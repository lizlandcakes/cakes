const express = require('express');
const path = require('path');
const app = express();

const SB = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const ANON = process.env.SUPABASE_ANON_KEY || '';
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // secret: server only

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
  next();
});
app.use(express.json({ limit: '20kb' }));

// tiny in-memory rate limit: 8 enquiries per 10 minutes per IP
const hits = new Map();
const limited = (ip) => {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 600000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 8;
};

// public values only (the anon key is designed to be public; RLS protects the data)
app.get('/api/config', (req, res) => res.json({ url: SB || null, anonKey: ANON || null }));

app.get('/api/cakes', async (req, res) => {
  if (!SB || !ANON) return res.json({ cakes: [], categories: [] });
  try {
    const h = { apikey: ANON, Authorization: 'Bearer ' + ANON };
    const [cakes, cats] = await Promise.all([
      fetch(`${SB}/rest/v1/cakes?select=id,name,category,description,image_url&published=eq.true&order=sort.asc,created_at.desc`, { headers: h }).then((r) => r.json()),
      fetch(`${SB}/rest/v1/categories?select=name&order=sort.asc`, { headers: h }).then((r) => r.json())
    ]);
    res.set('Cache-Control', 'public, max-age=60');
    res.json({
      cakes: Array.isArray(cakes) ? cakes : [],
      categories: Array.isArray(cats) ? cats.map((c) => c.name) : []
    });
  } catch (e) {
    res.json({ cakes: [], categories: [] });
  }
});

const TYPES = ['order', 'custom', 'training', 'contact'];
app.post('/api/enquiries', async (req, res) => {
  const b = req.body || {};
  if (b.website) return res.json({ ok: true }); // honeypot for bots
  if (limited(req.ip)) return res.status(429).json({ ok: false, error: 'Too many requests' });
  const type = String(b.type || '');
  const message = String(b.message || '').trim().slice(0, 3000);
  if (!TYPES.includes(type) || !message) return res.status(400).json({ ok: false, error: 'Invalid enquiry' });
  if (!SB || !SVC) return res.status(202).json({ ok: true, stored: false });
  try {
    const r = await fetch(`${SB}/rest/v1/enquiries`, {
      method: 'POST',
      headers: { apikey: SVC, Authorization: 'Bearer ' + SVC, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({
        type,
        name: String(b.name || '').slice(0, 100),
        phone: String(b.phone || '').slice(0, 30),
        message
      })
    });
    res.status(r.ok ? 200 : 502).json({ ok: r.ok });
  } catch (e) {
    res.status(502).json({ ok: false });
  }
});

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'], maxAge: '1h' }));
app.get('/health', (req, res) => res.json({ ok: true }));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'index.html')));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Lizland Cakes running on http://localhost:${port}`));

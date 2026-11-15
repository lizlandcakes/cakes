# Lizland Cakes website

Front-end site + Express server + Supabase (cakes, categories, photos, enquiries) + admin dashboard at `/admin`.

## 1. Supabase (one time)
1. supabase.com > New project (`lizland-cakes`). Save the database password.
2. SQL Editor > New query > paste all of `supabase/schema.sql` > Run.
3. Authentication > Users > Add user (owner's email + strong password, tick auto-confirm).
4. SQL Editor, run (with the owner's email):
   `insert into public.admins (user_id) select id from auth.users where email = 'OWNER-EMAIL-HERE';`
5. Project Settings > API: copy the **Project URL**, the **anon public** key and the **service_role** key.
   The service_role key is a secret: only ever put it in `.env` and in Render's environment, never in any page or GitHub.

## 2. Run locally (Windows PowerShell)
```powershell
cd path\to\lizland-cakes
npm install
copy .env.example .env      # then open .env and fill in the 3 values
npm run dev                 # needs Node 20.6 or newer
```
Site: http://localhost:3000   Admin: http://localhost:3000/admin

Without `.env` the site still works (built-in photos, WhatsApp ordering); the admin cannot log in.

## 3. GitHub
```powershell
git init
git add .
git commit -m "Lizland Cakes website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/lizland-cakes.git
git push -u origin main
```
`.env` is in `.gitignore`, so your keys are not uploaded.

## 4. Render
New > Web Service > pick the repo. Build command `npm install`, start command `npm start`.
Environment tab: add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
Then Settings > Custom Domains to attach your domain.

## How it works
- Customers fill a form > the enquiry is saved to Supabase through `/api/enquiries` (validated, rate-limited) and WhatsApp opens with the message.
- Cakes added in `/admin` appear on the website within about a minute, ahead of the built-in photos.
- Enquiries can only be read by the admin account (Row Level Security).

## Photos
Cake photos are real files in `public/images/cakes/full` (large) and `public/images/cakes/thumb` (grid). The list with categories is the `CAKES` / `CAKES.push(...)` block in `public/index.html`. New cakes are easiest to add in `/admin`.

## Business details used on the site
Lizland Cakes, 0746213847 (WhatsApp and call), Jogoo Kimakia next to ACK Memoria, Thika, open daily 8:00 AM to 9:00 PM, TikTok @Lizlandcakes (linked). Facebook and Instagram show the name Liz Albert; paste the exact profile links into `CONFIG.social` in `public/index.html`.

## Still to do
- Social links: search `CONFIG` in `public/index.html`.
- The 3 built-in photos live inside `index.html`; move them into the admin if you want to delete them from the site.
- Favicon file, SEO per page, sitemap.xml, robots.txt, share image.

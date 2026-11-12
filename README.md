# Lizland Cakes website

Current state: the full front-end site (welcome screen, pouring 3D cake, gallery, custom cake designer, training and contact forms that open WhatsApp). Admin dashboard, Supabase, sitemap/robots and share image are the next steps.

## Run locally (Windows PowerShell)
```powershell
cd path\to\lizland-cakes
npm install
npm start
```
Open http://localhost:3000

## Put it on GitHub
```powershell
git init
git add .
git commit -m "Lizland Cakes website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/lizland-cakes.git
git push -u origin main
```
(Create an empty repository named lizland-cakes on GitHub first.)

## Deploy on Render
New > Web Service > connect the GitHub repo. Build command: `npm install`. Start command: `npm start`. Then add your domain under Settings > Custom Domains.

## Things to configure
- Social links: search `CONFIG` in `public/index.html` and add the real TikTok, Facebook and Instagram URLs.
- More cake photos: add entries to the `CAKES` list in `public/index.html`.

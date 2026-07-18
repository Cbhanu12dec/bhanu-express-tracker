# Paycheck tracker

A private dashboard for tracking hours and pay across two companies (Company A
$54.50/hr, Company B $57.80/hr), with a running total of what's still owed to you.

- **Locked to one account** — only `cbhanu12dec@gmail.com` can sign in and edit data,
  enforced both in the app and in Firestore's own security rules.
- **Persists forever** — data lives in Firestore under your account and stays there
  until you delete it, from any device.
- **Deployable for free** on GitHub Pages.

## 1. Create your Firebase project (free)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a new project.
2. **Authentication** → Sign-in method → enable **Email/Password**.
3. **Authentication** → Users → **Add user** → enter `cbhanu12dec@gmail.com` and choose a
   password. This is the only account the app will ever let in.
4. **Firestore Database** → Create database → start in **production mode**.
5. In Firestore → **Rules**, paste the contents of `firestore.rules` from this repo and publish.
6. Project settings (gear icon) → **Your apps** → Add app → Web (`</>`) → register it →
   copy the `firebaseConfig` values shown. You'll need these next.

## 2. Configure the app

Copy `.env.example` to `.env` and fill in the values from step 1.6:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Try it locally:

```bash
npm install
npm run dev
```

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Paycheck tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/paycheck-tracker.git
git push -u origin main
```

If your repo name isn't `paycheck-tracker`, update the `base` path in `vite.config.js`
to match (`/your-repo-name/`).

## 4. Add your Firebase config as GitHub secrets

Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**,
one for each value from your `.env`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

(These stay out of the public repo — the `.env` file itself is git-ignored.)

## 5. Turn on GitHub Pages

Repo → **Settings** → **Pages** → Source → **GitHub Actions**.

Push to `main` (or re-run the workflow from the **Actions** tab) and the site deploys
automatically to `https://YOUR_USERNAME.github.io/paycheck-tracker/`.

## How the security works

- Signing in with any email other than `cbhanu12dec@gmail.com` is rejected client-side,
  and immediately signed back out even if it somehow got through.
- Firestore's own rules (`firestore.rules`) double-check `request.auth.token.email` on
  every read and write, so the restriction holds even if someone bypasses the UI.
- Each entry is a document at `users/{your-uid}/entries/{month}` — only your signed-in
  account can read or write that path.

## Notes

- Rates ($54.50 / $57.80 per hour) are set as constants in
  `src/components/Dashboard.jsx` — change `RATE_A` / `RATE_B` there if they ever update.
- Deleting an entry removes it permanently (no undo) — that's the "persists until you
  delete it" behavior working as intended.

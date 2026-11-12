# Vardaan waitlist

Static Next.js site on **Firebase Hosting** with sign-ups in **Cloud Firestore**. Runs on Firebase's free Spark plan (no card).

## How it works
- `npm run build` exports a static site to `out/`.
- The waitlist form writes straight to Firestore. `firestore.rules` is the security layer: anyone can add one valid sign-up, nobody can read/edit/delete sign-ups from a browser, and repeat emails/phones are rejected.
- Firebase Analytics is on (see privacy policy).

## One-time setup (Firebase console, project `vardaan-tech`)
1. **Firestore Database → Create database** → Production mode → region `asia-south1`.

## Deploy
```bash
npm install
npm i -g firebase-tools
firebase login
npm run build
firebase deploy --only firestore:rules,hosting
```
Live at https://vardaan-tech.web.app

## Viewing sign-ups
Firebase console → Firestore Database → `waitlist_signups`. To export: Firestore → Import/Export, or copy from the data viewer.

## Auto-deploy on every push (optional)
Run `firebase init hosting:github` once and pick `shub240-del/vardaan`. It adds the GitHub secret and workflow for you. Use build command `npm ci && npm run build`.

## Known limits (static site, no server)
- No per-IP rate limit. Spam protection is a honeypot field, a minimum fill time and strict rules. If spam shows up, turn on Firebase App Check (reCAPTCHA) — free.
- Fill in the grievance officer placeholders in `app/privacy/page.tsx` before launch.

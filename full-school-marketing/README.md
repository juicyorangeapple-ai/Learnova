# Full School Marketing

Standalone public marketing website for Full School. It is intentionally isolated from the existing Learnova extension and backend.

## Recommended public structure

- `fullschool.com` serves this marketing project.
- `app.fullschool.com` serves the existing school application.
- Marketing calls to action stay on the public site.
- Login links use `VITE_FULL_SCHOOL_APP_URL` to hand off to the application without changing application routing.

## Local development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
npm run preview
```

## Application login URL

Copy `.env.example` to `.env.local` and set the deployed Full School application login URL:

```bash
VITE_FULL_SCHOOL_APP_URL=https://app.fullschool.com/login
```

Without this variable, Login points to `http://localhost:3000/login` for local integration testing.

## Deployment

The production output is generated in `dist/`. `vercel.json` provides SPA routing for Vercel, or the same directory can be deployed to any static host.

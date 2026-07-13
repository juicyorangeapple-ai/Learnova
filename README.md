# Learnova Chrome Extension Prototype

Learnova is an interactive AI-powered study platform prototype for high school students. This project includes the existing Learnova workspace and a Chrome extension companion that helps students open the workspace, save study pages, organize materials, generate quizzes, review flashcards, track weak topics, and plan revision.

This is a polished demo MVP for a Dartmouth entrepreneurship showcase. Study data remains local or mock, while the AI Assistant can use a real OpenAI model through the server-side proxy in `server/`.

## What Is Included

- Chrome Extension Manifest V3
- Compact extension popup that opens the main Learnova website, launches quick actions, and saves the current page
- First-install welcome page with website availability fallback
- Full extension dashboard at `dashboard.html`
- First-run onboarding flow with a "build my study cockpit" moment
- Command-palette style navigation with keyboard shortcut support
- Calm desktop-app visual system inspired by modern SaaS tools
- Smooth CSS and Web Animations designed for an extension-only prototype
- Mock Chrome local storage via `chrome.storage.local`
- Focus Coach service worker using `chrome.tabs`, `chrome.alarms`, `chrome.notifications`, and local settings
- Privacy & Focus Controls page with permission modes, distracting website manager, time limits, snooze, emergency override, intervention levels, analytics, and recommendations
- Modular Learnova Assistant orchestration layer with source retrieval, prompt context assembly, and swappable AI provider adapters
- Deployable Node/Express AI service at `server/` so the OpenAI API key never appears in extension JavaScript
- Subject library, material upload demo, AI assistant, quiz generator, flashcards, mastery tracker, revision planner, pricing, and future roadmap
- Shared local/production AI configuration for real assistant and companion responses

## Load The Extension

1. Open Chrome and go to `chrome://extensions`.
2. Enable Developer mode.
3. Click **Load unpacked**.
4. Select the `extension/` folder.
5. The first install opens Learnova's welcome page automatically.
6. Open any study page and click the Learnova extension.
7. Use **Open Learnova Workspace** to open or focus the configured Learnova website.

The popup detects the current page title and URL, lets the student choose a subject/topic, add notes, save locally with `chrome.storage.local`, and try mock AI actions:

- Summarize Page
- Turn Into Flashcards
- Generate Quiz

The popup is a compact launcher and capture surface. Its primary action and three website quick actions open the configured Learnova website. It checks for an existing Learnova tab first and focuses that tab instead of creating duplicates. The existing extension workspace remains available under **Extension tools**, including `dashboard.html#quiz`, `dashboard.html#flashcards`, and `dashboard.html#focus`.

## Website And AI Environment

The development/production switch, website URL, and AI service URL live in one place:

```txt
extension/learnova-config.js
```

For local development, keep:

```js
const ACTIVE_MODE = 'development';
```

Development uses:

```txt
Website: http://127.0.0.1:8787/dashboard.html
AI API:  http://localhost:3001
```

To use the deployed website and AI service, change only that mode line to:

```js
const ACTIVE_MODE = 'production';
```

Production currently points to:

```txt
Website: https://learnova.vercel.app
AI API:  https://learnova-api.onrender.com
```

Replace the production `apiBaseUrl` in `extension/learnova-config.js` with the real URL returned by Render or Railway. Do not add `/api/chat`; enter only the origin, such as `https://my-learnova-api.onrender.com`. Routes and API paths are assembled by the shared config, so no other file needs a URL change.

The popup checks both the website and public `/api/health` endpoint. It shows **Learnova connected** only when the workspace and configured AI service are available. If either is offline, page capture and the internal extension workspace remain usable.

To test the local website entry flow:

```bash
cd "/Users/max/Documents/Learnova project/extension"
python3 -m http.server 8787 --bind 127.0.0.1
```

Then reload Learnova from `chrome://extensions`, click its toolbar icon, and verify:

1. The popup reports **Learnova connected**.
2. **Open Learnova Workspace** opens `dashboard.html#dashboard` in a website tab.
3. Clicking it again focuses the existing website tab.
4. Stopping the preview server changes the popup to **Website unavailable** after retrying.
5. Removing and loading the unpacked extension again opens the first-install welcome page.

## Local AI Development

Learnova uses a Node/Express proxy to call OpenAI. The OpenAI key stays in the server process and must never be placed in `extension/`, `manifest.json`, Chrome storage, or committed source files.

Install and start the backend:

```bash
cd "/Users/max/Documents/Learnova project/server"
npm install
npm start
```

For local development only, create `/Users/max/Documents/Learnova project/.env.local` from `server/.env.example` and set:

```dotenv
OPENAI_API_KEY=your_real_server_side_key
```

`.env.local` is ignored by Git. Restart `npm start` after changing it. The local service listens on `0.0.0.0:3001`, and the development extension calls `http://localhost:3001` through the shared configuration module.

In another terminal, serve the extension preview if you are using the local browser preview:

```bash
cd "/Users/max/Documents/Learnova project/extension"
python3 -m http.server 8787 --bind 127.0.0.1
```

Test the chatbot:

1. Open `http://127.0.0.1:8787/dashboard.html#assistant`.
2. Ask Learnova a question.
3. If the backend is stopped, the development assistant shows: "AI backend is not connected. Please start the local server."

Optional backend health check:

```bash
curl http://localhost:3001/api/health
```

Expected safe response:

```json
{"ok":true,"service":"learnova-ai","openAIConfigured":true}
```

The response never includes a key, prefix, key length, model, or environment-file details.

## Deploy The AI Service

The service root is `server/`. It requires Node 20 or newer, installs from `package-lock.json`, starts with `npm start`, reads the host-provided `PORT`, and binds to `0.0.0.0`.

### Environment Variables

Add these in the hosting provider dashboard. Never paste a real key into source code or README files.

Required:

```dotenv
OPENAI_API_KEY=your_real_server_side_key
NODE_ENV=production
```

Recommended demo settings:

```dotenv
OPENAI_MODEL=gpt-4.1-mini
OPENAI_MAX_OUTPUT_TOKENS=700
OPENAI_TIMEOUT_MS=30000
ALLOWED_ORIGINS=https://learnova.vercel.app
ALLOW_ANY_CHROME_EXTENSION=true
ALLOWED_EXTENSION_IDS=
RATE_LIMIT_WINDOW_MS=600000
RATE_LIMIT_MAX=30
TRUST_PROXY_HOPS=1
```

Do not set `PORT` unless the host explicitly requires it; Render and Railway provide it. For an unpacked classroom demo, `ALLOW_ANY_CHROME_EXTENSION=true` accepts valid `chrome-extension://` origins. After publishing to the Chrome Web Store, set it to `false` and place the stable extension ID in `ALLOWED_EXTENSION_IDS`. Multiple IDs are comma-separated. Add any extra trusted website origins to `ALLOWED_ORIGINS`, also comma-separated.

### Render

1. Push the project to a private GitHub repository without `.env.local`.
2. In Render, choose **New > Web Service** and connect the repository.
3. Set **Root Directory** to `server`.
4. Choose the Node runtime.
5. Set **Build Command** to `npm ci`.
6. Set **Start Command** to `npm start`.
7. Set **Health Check Path** to `/api/health`.
8. Add the environment variables above in **Environment**.
9. Deploy, then copy the service origin Render provides, such as `https://learnova-api-xxxx.onrender.com`.

### Railway

1. In Railway, choose **New Project > Deploy from GitHub repo**.
2. Open the service settings and set **Root Directory** to `server`.
3. Use Railpack/Node with **Build Command** `npm ci` and **Start Command** `npm start`.
4. Add the environment variables above under **Variables**.
5. Set the health-check path to `/api/health`.
6. Open **Settings > Networking** and choose **Generate Domain**.
7. Copy the generated HTTPS service origin.

### Connect The Extension

1. Open `extension/learnova-config.js`.
2. Replace the production `apiBaseUrl` with the copied HTTPS service origin.
3. Set `ACTIVE_MODE` to `production`.
4. Visit `https://your-service.example/api/health` and confirm the safe response above.
5. Open `chrome://extensions`, find Learnova, and click **Reload**.
6. Open the popup and confirm **Learnova connected**, then ask the AI Tutor a question and trigger one companion suggestion.

A friend using this production build needs only the `extension/` folder. They do not need Node.js, `.env.local`, or the OpenAI key.

## API Safety Limits

The public demo service applies the following server-side limits:

- JSON request bodies: 64 KB maximum
- Student messages: 4,000 characters maximum
- Conversation history: latest 12 entries, at most 2,000 characters each
- Attached structured context: bounded depth, keys, arrays, strings, and serialized size
- AI output: 700 tokens by default, with a server-side maximum of 1,200
- OpenAI timeout: 30 seconds by default with one SDK retry
- Rate limit: 30 chat requests per IP per 10 minutes by default
- Model: selected only from the server environment; client model overrides are rejected
- CORS: configured website origins, localhost in development, and valid Chrome extension origins

The rate limiter is in memory and resets when an instance restarts. CORS limits browser origins but is not authentication and cannot stop direct scripted requests. Before a broad public launch, add authenticated accounts, per-user quotas, a shared rate-limit store, usage alerts, and billing controls.

## Upload And Image Status

File upload remains a frontend prototype. Learnova accepts PDF, DOCX, TXT, and image selections up to 10 MB each, stores only metadata locally, and sends bounded metadata such as filename/type/size as study context. File bytes are not uploaded, parsed, OCRed, summarized, or stored by the deployed server. A production parser would require a separate authenticated upload pipeline, malware scanning, storage limits, and retention controls.

## Mock Data Only

This prototype still does not connect:

- Real school accounts
- Real grades
- Google Drive or Classroom
- Stripe or real payments
- Any backend database

Uploaded files are not parsed. Quiz generation, summaries, mastery updates, pricing checkout, and study plans are still mocked for demo purposes. The assistant uses the configured AI service: the local `server/` process in development or the deployed public service in production.

## Assistant Architecture

The Learnova Assistant is designed as an AI orchestration system rather than a hardcoded topic bot.

Before generating a response, it retrieves context from:

- General AI Knowledge: study advice, explanations, motivation, academic concepts, essays, and exam strategy
- Student Profile: grade, curriculum, subjects, goals, weak topics, strengths, preferences, quiz history, and revision history
- Saved Study Materials: notes, saved webpages, flashcards, previous quizzes, and annotations
- Browser Context: current page title, URL, selected text, study website, and assignment note when available

The current prototype uses the server-side OpenAI provider by default, with local and deployed service modes plus a mock provider retained for fallback/demo development. The provider interface is intentionally swappable so future adapters for Claude, Gemini, or another model can be added without changing the retrieval pipeline or UI.

The architecture is ready for future source connectors such as Google Drive, Google Classroom, Canvas, Moodle, Notion, OneDrive, and other learning platforms once secure accounts, consent, and backend sync exist.

## Focus Coach And Privacy

Focus Coach is enabled by default in Balanced Mode. It only monitors selected distracting websites unless the student changes the mode.

Permission modes:

- Privacy Mode: no browsing activity tracked
- Balanced Mode: track only selected distracting websites
- Smart Study Mode: track all websites locally for stronger recommendations and analytics

All browsing information stays on the device in this prototype and is never shared. The extension requests the Chrome permissions needed to run the local prototype, but the student-facing settings control what Learnova actually tracks and how strongly it intervenes.

Intervention levels:

- Level 1: gentle Chrome notification
- Level 2: strong in-page reminder overlay
- Level 3: Focus Lock page with snooze and emergency unlock

Chrome notifications support a limited number of action buttons, so the prototype provides Study Now and Snooze buttons in the system notification while dismissing the notification acts as Ignore. The stronger in-page reminder and Focus Lock surfaces include fuller controls.

## Pricing Demo

The extension dashboard includes three demo tiers:

- Starter: $10/month
- Plus: $50/month
- Premium: $75/month

The **Choose Plan** buttons open a fake checkout modal and update the local dashboard plan badge. Real payments would later be handled through Stripe subscriptions with secure authentication and backend billing logic.

## Future Roadmap

A production version would add:

- Real account system
- Backend database
- Real AI API
- Google Drive/Classroom integration
- PDF/Slides parsing
- Embeddings/vector search
- Per-student mastery tracking
- Privacy/security controls
- Stripe subscription billing

## Privacy Note

This prototype uses mock data only. A real version would require secure authentication, user consent, encrypted storage, and careful handling of student data.

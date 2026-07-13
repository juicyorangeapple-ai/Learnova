(function () {
  // Change this one value when building the extension for local development or deployment.
  const ACTIVE_MODE = 'development';

  const MODES = Object.freeze({
    development: Object.freeze({
      websiteUrl: 'http://127.0.0.1:8787/dashboard.html',
      apiBaseUrl: 'http://localhost:3001',
      tabPatterns: Object.freeze([
        'http://127.0.0.1:8787/*',
        'http://localhost:8787/*',
      ]),
    }),
    production: Object.freeze({
      websiteUrl: 'https://learnova.vercel.app',
      apiBaseUrl: 'https://learnova-api.onrender.com',
      tabPatterns: Object.freeze(['https://learnova.vercel.app/*']),
    }),
  });

  const ROUTES = Object.freeze({
    workspace: 'dashboard',
    assistant: 'assistant',
    upload: 'capture',
    continue: 'library',
  });

  const active = MODES[ACTIVE_MODE] || MODES.production;

  function websiteUrl(route = 'workspace') {
    const url = new URL(active.websiteUrl);
    url.hash = ROUTES[route] || ROUTES.workspace;
    return url.toString();
  }

  function apiUrl(path = '') {
    const base = `${active.apiBaseUrl.replace(/\/+$/, '')}/`;
    return new URL(String(path).replace(/^\/+/, ''), base).toString();
  }

  async function fetchApi(path, options = {}) {
    const { timeoutMs = 35_000, signal: callerSignal, ...fetchOptions } = options;
    const controller = new AbortController();
    const abortFromCaller = () => controller.abort();
    if (callerSignal) {
      if (callerSignal.aborted) controller.abort();
      else callerSignal.addEventListener('abort', abortFromCaller, { once: true });
    }
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(apiUrl(path), {
        ...fetchOptions,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
      callerSignal?.removeEventListener?.('abort', abortFromCaller);
    }
  }

  async function checkApiHealth() {
    try {
      const response = await fetchApi('/api/health', {
        method: 'GET',
        cache: 'no-store',
        timeoutMs: 4_000,
      });
      const health = await response.json().catch(() => ({}));
      return {
        available: response.ok && health.ok === true,
        openAIConfigured: health.openAIConfigured === true,
      };
    } catch {
      return { available: false, openAIConfigured: false };
    }
  }

  const config = Object.freeze({
    mode: ACTIVE_MODE,
    routes: ROUTES,
    tabPatterns: active.tabPatterns,
    websiteBaseUrl: active.websiteUrl,
    apiBaseUrl: active.apiBaseUrl,
    websiteUrl,
    apiUrl,
    fetchApi,
    checkApiHealth,
  });

  globalThis.LearnovaConfig = config;
  // Keep the existing name as an alias so popup/welcome integrations remain compatible.
  globalThis.LearnovaWebsiteConfig = config;
})();

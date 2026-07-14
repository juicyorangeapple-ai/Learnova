(function () {
  // Change this one value when building the extension for local development or deployment.
  const ACTIVE_MODE = 'production';
  // Set this only to the verified deployment URL returned by the frontend host.
  // It is intentionally empty until the Learnova workspace in extension/ is deployed.
  const WEBSITE_URL = '';
  const API_BASE_URL = 'https://learnova-i1q6.onrender.com';
  const DEMO_DATA_ENABLED = false;

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
      websiteUrl: WEBSITE_URL,
      apiBaseUrl: API_BASE_URL,
    }),
  });

  const ROUTES = Object.freeze({
    workspace: 'dashboard',
    assistant: 'assistant',
    upload: 'capture',
    continue: 'library',
  });

  const active = MODES[ACTIVE_MODE] || MODES.production;
  const websiteConfigured = Boolean(active.websiteUrl);
  const apiHealthTimeoutMs = ACTIVE_MODE === 'production' ? 15_000 : 4_000;

  function internalWorkspaceBaseUrl() {
    if (globalThis.chrome?.runtime?.getURL) {
      return globalThis.chrome.runtime.getURL('dashboard.html');
    }
    return new URL('dashboard.html', globalThis.location?.href || 'http://127.0.0.1:8787/').toString();
  }

  function resolvedWebsiteBaseUrl() {
    return active.websiteUrl || internalWorkspaceBaseUrl();
  }

  function tabPatterns() {
    if (!websiteConfigured) return Object.freeze([]);
    const url = new URL(active.websiteUrl);
    return Object.freeze([`${url.origin}/*`]);
  }

  function websiteUrl(route = 'workspace') {
    const url = new URL(resolvedWebsiteBaseUrl());
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
        timeoutMs: apiHealthTimeoutMs,
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

  async function checkWebsiteHealth({ timeoutMs = 6_000 } = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(resolvedWebsiteBaseUrl(), {
        method: 'GET',
        cache: 'no-store',
        redirect: 'follow',
        signal: controller.signal,
      });
      return { available: response.ok, status: response.status };
    } catch {
      return { available: false, status: 0 };
    } finally {
      clearTimeout(timeout);
    }
  }

  async function checkServices() {
    const [website, ai] = await Promise.all([
      checkWebsiteHealth(),
      checkApiHealth(),
    ]);
    return {
      available: website.available && ai.available && ai.openAIConfigured,
      websiteAvailable: website.available,
      aiAvailable: ai.available,
      openAIConfigured: ai.openAIConfigured,
      mode: ACTIVE_MODE,
    };
  }

  const config = Object.freeze({
    mode: ACTIVE_MODE,
    routes: ROUTES,
    tabPatterns: tabPatterns(),
    websiteBaseUrl: resolvedWebsiteBaseUrl(),
    websiteConfigured,
    apiBaseUrl: active.apiBaseUrl,
    demoDataEnabled: DEMO_DATA_ENABLED,
    websiteUrl,
    apiUrl,
    fetchApi,
    checkApiHealth,
    checkWebsiteHealth,
    checkServices,
  });

  globalThis.LearnovaConfig = config;
  // Keep the existing name as an alias so popup/welcome integrations remain compatible.
  globalThis.LearnovaWebsiteConfig = config;
})();

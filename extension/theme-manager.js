(function () {
  const storageKey = 'learnovaTheme';
  const legacyStateKey = 'learnovaState';
  const cacheKey = 'learnovaThemeCache';

  const defaultPreference = {
    themeId: 'learnova-dark',
    accentId: 'apricot',
    mode: 'dark',
  };

  const surfaces = {
    dark: {
      '--bg': '#181815',
      '--panel': 'rgba(33, 32, 28, 0.8)',
      '--panel-strong': 'rgba(42, 40, 34, 0.94)',
      '--panel-soft': 'rgba(255, 255, 255, 0.055)',
      '--line': 'rgba(255, 255, 255, 0.1)',
      '--line-strong': 'rgba(255, 255, 255, 0.16)',
      '--text': '#f7f2e8',
      '--muted': '#b5ada0',
      '--faint': '#7f786d',
      '--shadow': '0 24px 80px rgba(0, 0, 0, 0.36)',
      '--grid-line': 'rgba(255, 255, 255, 0.035)',
      '--rail-bg': 'rgba(24, 24, 21, 0.74)',
      '--top-fade': 'linear-gradient(180deg, rgba(24, 24, 21, 0.92), rgba(24, 24, 21, 0))',
      '--modal-bg': 'rgba(35, 33, 28, 0.97)',
      '--input-bg': 'rgba(255, 255, 255, 0.065)',
      '--chat-assistant-bg': 'rgba(255, 255, 255, 0.07)',
      '--body-background': 'radial-gradient(circle at 92% 4%, rgba(220, 105, 70, 0.16), transparent 28rem), radial-gradient(circle at 12% 90%, rgba(181, 199, 142, 0.1), transparent 30rem), linear-gradient(150deg, #181815 0%, #1d1b17 52%, #151512 100%)',
      '--ambient-one-bg': 'rgba(220, 105, 70, 0.08)',
      '--ambient-two-bg': 'rgba(181, 199, 142, 0.08)',
    },
    light: {
      '--bg': '#f8f4ec',
      '--panel': 'rgba(255, 253, 247, 0.84)',
      '--panel-strong': 'rgba(255, 255, 255, 0.96)',
      '--panel-soft': 'rgba(48, 40, 29, 0.05)',
      '--line': 'rgba(48, 40, 29, 0.12)',
      '--line-strong': 'rgba(48, 40, 29, 0.18)',
      '--text': '#28231c',
      '--muted': '#71695e',
      '--faint': '#958c7f',
      '--shadow': '0 24px 80px rgba(31, 45, 70, 0.14)',
      '--grid-line': 'rgba(48, 40, 29, 0.045)',
      '--rail-bg': 'rgba(250, 246, 239, 0.78)',
      '--top-fade': 'linear-gradient(180deg, rgba(248, 244, 236, 0.92), rgba(248, 244, 236, 0))',
      '--modal-bg': 'rgba(255, 255, 255, 0.96)',
      '--input-bg': 'rgba(48, 40, 29, 0.055)',
      '--chat-assistant-bg': 'rgba(48, 40, 29, 0.045)',
      '--body-background': 'radial-gradient(circle at 92% 4%, rgba(220, 105, 70, 0.12), transparent 28rem), radial-gradient(circle at 12% 90%, rgba(181, 199, 142, 0.1), transparent 30rem), linear-gradient(160deg, #f8f4ec 0%, #f3eee3 100%)',
      '--ambient-one-bg': 'rgba(220, 105, 70, 0.08)',
      '--ambient-two-bg': 'rgba(181, 199, 142, 0.08)',
    },
  };

  const accents = [
    { id: 'apricot', name: 'Apricot', vars: { '--blue': '#f1a15d', '--blue-strong': '#dc6946', '--violet': '#e8b85a', '--cyan': '#f6d7a8', '--green': '#b5c78e' } },
    { id: 'cyan', name: 'Ocean', vars: { '--blue': '#6aa8ff', '--blue-strong': '#2b7fff', '--violet': '#9b7cff', '--cyan': '#4de3ff', '--green': '#6ee7b7' } },
    { id: 'emerald', name: 'Emerald', vars: { '--blue': '#5eead4', '--blue-strong': '#10b981', '--violet': '#34d399', '--cyan': '#2dd4bf', '--green': '#86efac' } },
    { id: 'purple', name: 'Purple', vars: { '--blue': '#a78bfa', '--blue-strong': '#7c3aed', '--violet': '#c084fc', '--cyan': '#8b5cf6', '--green': '#6ee7b7' } },
    { id: 'orange', name: 'Orange', vars: { '--blue': '#fb923c', '--blue-strong': '#f97316', '--violet': '#f59e0b', '--cyan': '#fdba74', '--green': '#84cc16' } },
    { id: 'midnight', name: 'Midnight', vars: { '--blue': '#60a5fa', '--blue-strong': '#2563eb', '--violet': '#818cf8', '--cyan': '#38bdf8', '--green': '#22d3ee' } },
  ];

  const themes = [
    {
      id: 'learnova-dark',
      name: 'Learnova Dark',
      mode: 'dark',
      accentId: 'apricot',
      description: 'An editorial charcoal workspace with warm study energy.',
      preview: ['#181815', '#dc6946', '#f6d7a8'],
      vars: {
        '--body-background': 'radial-gradient(circle at 92% 4%, rgba(220, 105, 70, 0.16), transparent 28rem), radial-gradient(circle at 12% 90%, rgba(181, 199, 142, 0.1), transparent 30rem), linear-gradient(150deg, #181815 0%, #1d1b17 52%, #151512 100%)',
        '--ambient-one-bg': 'rgba(220, 105, 70, 0.08)',
        '--ambient-two-bg': 'rgba(181, 199, 142, 0.08)',
      },
    },
    {
      id: 'learnova-light',
      name: 'Learnova Light',
      mode: 'light',
      accentId: 'apricot',
      description: 'A soft paper workspace with warm, focused accents.',
      preview: ['#f8f4ec', '#dc6946', '#f6d7a8'],
      vars: {
        '--body-background': 'radial-gradient(circle at 92% 4%, rgba(220, 105, 70, 0.12), transparent 28rem), radial-gradient(circle at 12% 90%, rgba(181, 199, 142, 0.1), transparent 30rem), linear-gradient(160deg, #f8f4ec 0%, #f3eee3 100%)',
        '--ambient-one-bg': 'rgba(220, 105, 70, 0.08)',
        '--ambient-two-bg': 'rgba(181, 199, 142, 0.08)',
      },
    },
    {
      id: 'midnight-blue',
      name: 'Midnight Blue',
      mode: 'dark',
      accentId: 'midnight',
      description: 'Deep blue focus mode for late study sessions.',
      preview: ['#061025', '#2563eb', '#38bdf8'],
      vars: {
        '--body-background': 'radial-gradient(circle at 12% 8%, rgba(37, 99, 235, 0.28), transparent 28rem), radial-gradient(circle at 82% 16%, rgba(56, 189, 248, 0.16), transparent 30rem), linear-gradient(180deg, #061025 0%, #0a1430 52%, #060b18 100%)',
        '--ambient-one-bg': 'rgba(56, 189, 248, 0.12)',
        '--ambient-two-bg': 'rgba(37, 99, 235, 0.14)',
      },
    },
    {
      id: 'emerald',
      name: 'Emerald',
      mode: 'dark',
      accentId: 'emerald',
      description: 'Calm green accents for steady revision.',
      preview: ['#061813', '#10b981', '#2dd4bf'],
      vars: {
        '--body-background': 'radial-gradient(circle at 14% 10%, rgba(16, 185, 129, 0.24), transparent 28rem), radial-gradient(circle at 80% 16%, rgba(45, 212, 191, 0.15), transparent 30rem), linear-gradient(180deg, #061813 0%, #0a201b 54%, #07110f 100%)',
        '--ambient-one-bg': 'rgba(45, 212, 191, 0.12)',
        '--ambient-two-bg': 'rgba(16, 185, 129, 0.12)',
      },
    },
    {
      id: 'purple',
      name: 'Purple',
      mode: 'dark',
      accentId: 'purple',
      description: 'A polished violet workspace with strong contrast.',
      preview: ['#12091f', '#7c3aed', '#c084fc'],
      vars: {
        '--body-background': 'radial-gradient(circle at 12% 8%, rgba(124, 58, 237, 0.26), transparent 28rem), radial-gradient(circle at 82% 16%, rgba(192, 132, 252, 0.18), transparent 30rem), linear-gradient(180deg, #12091f 0%, #1a0f2f 54%, #0d0716 100%)',
        '--ambient-one-bg': 'rgba(192, 132, 252, 0.12)',
        '--ambient-two-bg': 'rgba(124, 58, 237, 0.14)',
      },
    },
    {
      id: 'sunset-orange',
      name: 'Sunset Orange',
      mode: 'dark',
      accentId: 'orange',
      description: 'Warm energy for planning and momentum.',
      preview: ['#1c1006', '#f97316', '#fdba74'],
      vars: {
        '--body-background': 'radial-gradient(circle at 14% 10%, rgba(249, 115, 22, 0.24), transparent 28rem), radial-gradient(circle at 82% 14%, rgba(253, 186, 116, 0.16), transparent 30rem), linear-gradient(180deg, #1c1006 0%, #251505 52%, #120a04 100%)',
        '--ambient-one-bg': 'rgba(253, 186, 116, 0.13)',
        '--ambient-two-bg': 'rgba(249, 115, 22, 0.12)',
      },
    },
  ];

  const subscribers = new Set();
  let activePreference = defaultPreference;

  function getTheme(themeId) {
    return themes.find((theme) => theme.id === themeId) || themes[0];
  }

  function getAccent(accentId) {
    return accents.find((accent) => accent.id === accentId) || accents[0];
  }

  function normalizePreference(raw = {}) {
    const theme = getTheme(raw.themeId || defaultPreference.themeId);
    const mode = raw.mode === 'light' || raw.mode === 'dark' ? raw.mode : theme.mode;
    const accentId = raw.accentId === 'cyan' && theme.id === 'learnova-dark' ? 'apricot' : raw.accentId || theme.accentId;
    return {
      themeId: theme.id,
      accentId: getAccent(accentId).id,
      mode,
    };
  }

  function resolve(preference = defaultPreference) {
    const normalized = normalizePreference(preference);
    const theme = getTheme(normalized.themeId);
    const accent = getAccent(normalized.accentId);
    const themeVars = { ...theme.vars };
    if (normalized.mode !== theme.mode) {
      delete themeVars['--body-background'];
      delete themeVars['--ambient-one-bg'];
      delete themeVars['--ambient-two-bg'];
    }
    return {
      normalized,
      theme,
      accent,
      vars: {
        ...surfaces[normalized.mode],
        ...themeVars,
        ...accent.vars,
        '--chat-user-bg': `linear-gradient(135deg, ${accent.vars['--blue-strong']}, ${accent.vars['--violet']})`,
      },
    };
  }

  function readCache() {
    try {
      return JSON.parse(localStorage.getItem(cacheKey) || 'null');
    } catch {
      return null;
    }
  }

  function writeCache(preference) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(preference));
    } catch {
      // Storage may be unavailable in restricted contexts.
    }
  }

  function apply(preference = defaultPreference, options = {}) {
    const root = document.documentElement;
    const { normalized, vars } = resolve(preference);
    const animate = options.animate !== false;
    if (animate) {
      root.classList.add('theme-transition');
      window.clearTimeout(apply.timer);
      apply.timer = window.setTimeout(() => root.classList.remove('theme-transition'), 280);
    }
    Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
    root.dataset.theme = normalized.themeId;
    root.dataset.mode = normalized.mode;
    activePreference = normalized;
    writeCache(normalized);
    subscribers.forEach((callback) => callback(normalized));
    return normalized;
  }

  async function getStored() {
    if (globalThis.chrome?.storage?.local) {
      const stored = await chrome.storage.local.get({
        [storageKey]: null,
        [legacyStateKey]: null,
      });
      return normalizePreference(stored[storageKey] || stored[legacyStateKey]?.theme || readCache() || defaultPreference);
    }
    return normalizePreference(readCache() || JSON.parse(localStorage.getItem(legacyStateKey) || '{}')?.theme || defaultPreference);
  }

  async function save(nextPreference, options = {}) {
    const normalized = normalizePreference(nextPreference);
    apply(normalized);
    if (globalThis.chrome?.storage?.local) {
      const stored = await chrome.storage.local.get({ [legacyStateKey]: null });
      await chrome.storage.local.set({
        [storageKey]: normalized,
        [legacyStateKey]: { ...(stored[legacyStateKey] || {}), theme: normalized },
      });
      if (options.broadcast !== false && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ type: 'learnova-theme-changed', theme: normalized })?.catch?.(() => {});
      }
    } else {
      const state = JSON.parse(localStorage.getItem(legacyStateKey) || '{}');
      localStorage.setItem(legacyStateKey, JSON.stringify({ ...state, theme: normalized }));
      window.dispatchEvent(new CustomEvent('learnova-theme-changed', { detail: normalized }));
    }
    return normalized;
  }

  function subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  }

  function watch() {
    if (globalThis.chrome?.storage?.onChanged) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'local' || !changes[storageKey]?.newValue) return;
        apply(changes[storageKey].newValue);
      });
    }
    if (globalThis.chrome?.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener((message) => {
        if (message?.type === 'learnova-theme-changed' && message.theme) apply(message.theme);
      });
    }
    window.addEventListener('storage', (event) => {
      if (event.key === cacheKey && event.newValue) {
        try {
          apply(JSON.parse(event.newValue));
        } catch {
          // Ignore malformed external storage values.
        }
      }
    });
  }

  async function init() {
    apply(readCache() || defaultPreference, { animate: false });
    const stored = await getStored();
    apply(stored, { animate: false });
    watch();
    return stored;
  }

  globalThis.LearnovaTheme = {
    accents,
    defaultPreference,
    getAccent,
    getStored,
    getTheme,
    init,
    normalizePreference,
    resolve,
    save,
    subscribe,
    themes,
    apply,
  };

  init();
})();

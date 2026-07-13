(function () {
  const STORAGE_KEY = 'learnovaCompanion';
  const PROACTIVE_COOLDOWN = 45 * 60 * 1000;
  const PROACTIVE_DELAY = 4200;
  const defaults = {
    shown: true,
    proactive: true,
    animationLevel: 'full',
    tone: 'calm',
    position: null,
    lastProactiveAt: 0,
  };

  let preferences = { ...defaults };
  let config = {};
  let root = null;
  let panelOpen = false;
  let proactiveShownThisSession = false;
  let requestPending = false;
  let dragging = null;
  let mounted = false;

  function localRead() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  async function readPreferences() {
    const chromeStorage = globalThis.chrome?.storage?.local;
    if (chromeStorage) {
      try {
        const values = await chromeStorage.get(STORAGE_KEY);
        return { ...defaults, ...(values[STORAGE_KEY] || {}) };
      } catch {
        // The static preview does not always expose extension storage.
      }
    }
    return { ...defaults, ...localRead() };
  }

  async function persist(nextPreferences = preferences) {
    preferences = { ...defaults, ...nextPreferences };
    const chromeStorage = globalThis.chrome?.storage?.local;
    if (chromeStorage) {
      try {
        await chromeStorage.set({ [STORAGE_KEY]: preferences });
      } catch {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    }
    window.dispatchEvent(new CustomEvent('learnova-companion-changed', { detail: preferences }));
    return preferences;
  }

  function getContext() {
    return globalThis.LearnovaCompanionContext?.build({
      state: config.getState?.() || {},
      route: config.getRoute?.() || 'dashboard',
      studySet: config.getStudySet?.() || null,
    });
  }

  function fallbackFor(context = getContext()) {
    return globalThis.LearnovaCompanionContext?.fallback(context) || {
      message: 'A focused study step is ready when you are.',
      actions: ['ask-tutor', 'make-plan'],
    };
  }

  function actionLabel(id) {
    return globalThis.LearnovaCompanionActions?.label(id) || 'Ask Learnova';
  }

  function cleanSuggestion(value, fallback) {
    const plain = String(value || '').replace(/\s+/g, ' ').trim();
    if (!plain) return fallback;
    return plain.length > 180 ? `${plain.slice(0, 177).trim()}...` : plain;
  }

  function mascotMarkup() {
    return `
      <svg class="companion-mascot" viewBox="0 0 96 96" role="img" aria-label="Learnova companion">
        <defs>
          <linearGradient id="companionShell" x1="16" y1="12" x2="80" y2="84" gradientUnits="userSpaceOnUse">
            <stop stop-color="var(--accent)"></stop>
            <stop offset="1" stop-color="var(--accent-2)"></stop>
          </linearGradient>
        </defs>
        <path class="companion-shadow" d="M27 76c7-5 35-5 42 0 3 2 2 5-3 6-12 3-27 3-39 0-5-1-4-4 0-6Z"></path>
        <path class="companion-body" d="M22 44c0-19 12-31 28-31 17 0 28 12 28 31v12c0 17-12 27-28 27S22 73 22 56V44Z"></path>
        <path class="companion-wing companion-wing-left" d="M23 48c-10 1-14 7-13 15 1 8 9 11 16 6l5-6"></path>
        <path class="companion-wing companion-wing-right" d="M76 48c10 1 14 7 13 15-1 8-9 11-16 6l-5-6"></path>
        <rect class="companion-face" x="31" y="31" width="38" height="25" rx="11"></rect>
        <g class="companion-eyes"><circle cx="42" cy="43" r="3"></circle><circle cx="58" cy="43" r="3"></circle></g>
        <path class="companion-mouth" d="M44 50c3 3 6 3 9 0"></path>
        <path class="companion-antenna" d="M50 13V8"></path><circle class="companion-signal" cx="50" cy="6" r="3"></circle>
        <path class="companion-chest" d="M41 64h18"></path>
      </svg>
    `;
  }

  function actionMarkup(actions = []) {
    return actions
      .slice(0, 5)
      .map((action) => `<button type="button" class="companion-action" data-companion-action="${action}">${actionLabel(action)}</button>`)
      .join('');
  }

  function render() {
    document.getElementById('learnovaCompanion')?.remove();
    root = null;
    if (!preferences.shown || !document.body) return;

    const context = getContext();
    const suggestion = fallbackFor(context);
    const savedPosition = preferences.position;
    root = document.createElement('aside');
    root.id = 'learnovaCompanion';
    root.className = 'learnova-companion';
    root.dataset.state = 'idle';
    root.dataset.animation = preferences.animationLevel;
    root.setAttribute('aria-label', 'Learnova study companion');
    if (savedPosition && Number.isFinite(savedPosition.x) && Number.isFinite(savedPosition.y)) {
      root.style.left = `${savedPosition.x}px`;
      root.style.top = `${savedPosition.y}px`;
      root.style.right = 'auto';
      root.style.bottom = 'auto';
    }
    root.innerHTML = `
      <div class="companion-proactive" aria-live="polite">
        <span class="companion-proactive-copy"></span>
        <button type="button" class="companion-proactive-dismiss" aria-label="Dismiss suggestion">&times;</button>
      </div>
      <section class="companion-panel" aria-live="polite" aria-label="Learnova companion suggestions">
        <div class="companion-panel-header">
          <div><span class="companion-panel-kicker">LEARNOVA</span><strong>Study companion</strong></div>
          <button type="button" class="companion-close" aria-label="Close companion">&times;</button>
        </div>
        <p class="companion-message">${suggestion.message}</p>
        <div class="companion-actions">${actionMarkup(suggestion.actions)}</div>
        <button type="button" class="companion-tutor-link">Open AI Tutor <span aria-hidden="true">&rarr;</span></button>
        <button type="button" class="companion-hide">Hide companion</button>
      </section>
      <button type="button" class="companion-orb" aria-label="Open Learnova study companion" aria-expanded="false">
        <span class="companion-state-dots" aria-hidden="true"><i></i><i></i><i></i></span>
        ${mascotMarkup()}
      </button>
    `;
    document.body.appendChild(root);
    bindEvents();
    scheduleProactive(context, suggestion);
  }

  function updatePanel(copy, actions, stateName = 'speaking') {
    if (!root) return;
    root.dataset.state = stateName;
    const message = root.querySelector('.companion-message');
    const actionList = root.querySelector('.companion-actions');
    if (message) message.textContent = copy;
    if (actionList) actionList.innerHTML = actionMarkup(actions);
    bindActionEvents();
  }

  function setOpen(open) {
    panelOpen = Boolean(open);
    if (!root) return;
    root.classList.toggle('is-open', panelOpen);
    root.querySelector('.companion-orb')?.setAttribute('aria-expanded', String(panelOpen));
    if (panelOpen) {
      root.querySelector('.companion-proactive')?.classList.remove('is-visible');
      refreshWithAI();
    }
  }

  async function refreshWithAI() {
    if (requestPending || !root) return;
    const context = getContext();
    const fallback = fallbackFor(context);
    updatePanel(fallback.message, fallback.actions, 'thinking');
    requestPending = true;
    try {
      const suggestion = await config.requestSuggestion?.(context);
      updatePanel(cleanSuggestion(suggestion, fallback.message), fallback.actions, 'speaking');
    } catch {
      updatePanel('Learnova AI is currently unavailable.', fallback.actions, 'offline');
    } finally {
      requestPending = false;
    }
  }

  function scheduleProactive(context, suggestion) {
    if (!preferences.proactive || proactiveShownThisSession) return;
    const recentlyShown = Date.now() - Number(preferences.lastProactiveAt || 0) < PROACTIVE_COOLDOWN;
    if (recentlyShown) return;
    window.setTimeout(async () => {
      if (!root || panelOpen || proactiveShownThisSession || !preferences.proactive) return;
      proactiveShownThisSession = true;
      const bubble = root.querySelector('.companion-proactive');
      const copy = root.querySelector('.companion-proactive-copy');
      if (copy) copy.textContent = suggestion.message;
      bubble?.classList.add('is-visible');
      await persist({ ...preferences, lastProactiveAt: Date.now() });
    }, PROACTIVE_DELAY);
  }

  async function runAction(action) {
    if (!action || requestPending) return;
    const context = getContext();
    try {
      await globalThis.LearnovaCompanionActions?.execute(action, context, config.actionHandlers || {});
      if (root) {
        root.dataset.state = 'celebrating';
        window.setTimeout(() => {
          if (root) root.dataset.state = 'idle';
        }, 850);
      }
      setOpen(false);
    } catch {
      updatePanel('That action needs a moment. Please try again.', fallbackFor(context).actions, 'offline');
      setOpen(true);
    }
  }

  function clampPosition(position) {
    if (!root) return position;
    const width = root.offsetWidth || 88;
    const height = root.offsetHeight || 88;
    return {
      x: Math.max(12, Math.min(position.x, Math.max(12, window.innerWidth - width - 12))),
      y: Math.max(12, Math.min(position.y, Math.max(12, window.innerHeight - height - 12))),
    };
  }

  function bindDrag(orb) {
    orb.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || !root) return;
      const bounds = root.getBoundingClientRect();
      dragging = { startX: event.clientX, startY: event.clientY, left: bounds.left, top: bounds.top, moved: false };
      orb.setPointerCapture?.(event.pointerId);
    });
    orb.addEventListener('pointermove', (event) => {
      if (!dragging || !root) return;
      const deltaX = event.clientX - dragging.startX;
      const deltaY = event.clientY - dragging.startY;
      if (Math.abs(deltaX) + Math.abs(deltaY) > 4) dragging.moved = true;
      if (!dragging.moved) return;
      const position = clampPosition({ x: dragging.left + deltaX, y: dragging.top + deltaY });
      root.classList.add('is-dragging');
      root.style.left = `${position.x}px`;
      root.style.top = `${position.y}px`;
      root.style.right = 'auto';
      root.style.bottom = 'auto';
    });
    orb.addEventListener('pointerup', async (event) => {
      if (!dragging || !root) return;
      const didMove = dragging.moved;
      orb.releasePointerCapture?.(event.pointerId);
      dragging = null;
      root.classList.remove('is-dragging');
      if (didMove) {
        const bounds = root.getBoundingClientRect();
        await persist({ ...preferences, position: clampPosition({ x: bounds.left, y: bounds.top }) });
        return;
      }
      setOpen(!panelOpen);
    });
    orb.addEventListener('pointercancel', () => {
      dragging = null;
      root?.classList.remove('is-dragging');
    });
  }

  function bindActionEvents() {
    root?.querySelectorAll('[data-companion-action]').forEach((button) => {
      button.addEventListener('click', () => runAction(button.dataset.companionAction));
    });
  }

  function bindEvents() {
    const orb = root.querySelector('.companion-orb');
    bindDrag(orb);
    root.querySelector('.companion-close')?.addEventListener('click', () => setOpen(false));
    root.querySelector('.companion-hide')?.addEventListener('click', async () => {
      await setPreferences({ shown: false });
    });
    root.querySelector('.companion-tutor-link')?.addEventListener('click', () => runAction('ask-tutor'));
    root.querySelector('.companion-proactive')?.addEventListener('click', (event) => {
      if (event.target.closest('.companion-proactive-dismiss')) return;
      setOpen(true);
    });
    root.querySelector('.companion-proactive-dismiss')?.addEventListener('click', (event) => {
      event.stopPropagation();
      root.querySelector('.companion-proactive')?.classList.remove('is-visible');
    });
    bindActionEvents();
  }

  async function setPreferences(patch = {}) {
    await persist({ ...preferences, ...patch });
    render();
    return preferences;
  }

  async function resetPosition() {
    return setPreferences({ position: null });
  }

  async function resetPreferences() {
    return setPreferences({ ...defaults, shown: true });
  }

  async function mount(nextConfig = {}) {
    config = { ...config, ...nextConfig };
    if (!mounted) {
      preferences = await readPreferences();
      mounted = true;
      globalThis.chrome?.storage?.onChanged?.addListener((changes, areaName) => {
        if (areaName !== 'local' || !changes[STORAGE_KEY]) return;
        preferences = { ...defaults, ...(changes[STORAGE_KEY].newValue || {}) };
        render();
      });
      window.addEventListener('resize', () => {
        if (!root || !preferences.position) return;
        const nextPosition = clampPosition(preferences.position);
        root.style.left = `${nextPosition.x}px`;
        root.style.top = `${nextPosition.y}px`;
      });
    }
    render();
  }

  function update(nextConfig = {}) {
    config = { ...config, ...nextConfig };
    if (!mounted || !root) return;
    const context = getContext();
    const fallback = fallbackFor(context);
    if (!panelOpen) updatePanel(fallback.message, fallback.actions, 'idle');
  }

  globalThis.LearnovaCompanion = {
    mount,
    update,
    getPreferences: () => ({ ...preferences }),
    setPreferences,
    resetPosition,
    resetPreferences,
    defaults: { ...defaults },
  };
})();

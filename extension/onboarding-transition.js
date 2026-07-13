(function () {
  const storageKey = 'hasCompletedOnboardingTransition';
  const setupMessages = [
    'Creating your profile\u2026',
    'Personalizing your workspace\u2026',
    'Preparing your study tools\u2026',
  ];
  const timers = new Set();
  let active = false;

  function reducedMotion() {
    return Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  }

  function wait(duration) {
    return new Promise((resolve) => {
      const timer = globalThis.setTimeout(() => {
        timers.delete(timer);
        resolve();
      }, duration);
      timers.add(timer);
    });
  }

  function nextFrame() {
    return new Promise((resolve) => globalThis.requestAnimationFrame(() => resolve()));
  }

  function clearTimers() {
    timers.forEach((timer) => globalThis.clearTimeout(timer));
    timers.clear();
  }

  async function readCompletedState() {
    if (globalThis.chrome?.storage?.local) {
      const result = await globalThis.chrome.storage.local.get({ [storageKey]: false });
      return Boolean(result[storageKey]);
    }
    return globalThis.localStorage?.getItem(storageKey) === 'true';
  }

  async function writeCompletedState(value) {
    if (globalThis.chrome?.storage?.local) {
      await globalThis.chrome.storage.local.set({ [storageKey]: Boolean(value) });
      return;
    }
    if (value) globalThis.localStorage?.setItem(storageKey, 'true');
    else globalThis.localStorage?.removeItem(storageKey);
  }

  function ensureLayer() {
    let layer = document.getElementById('onboardingTransitionLayer');
    if (layer) return layer;
    layer = document.createElement('div');
    layer.id = 'onboardingTransitionLayer';
    layer.className = 'onboarding-transition-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = `
      <div class="onboarding-transition-content" role="status" aria-live="polite" aria-atomic="true">
        <span class="onboarding-transition-mark" aria-hidden="true"><i></i></span>
        <p class="onboarding-transition-kicker">Learnova workspace</p>
        <h2 id="onboardingTransitionMessage">${setupMessages[0]}</h2>
        <div class="onboarding-transition-progress" aria-hidden="true">
          ${setupMessages.map((_, index) => `<span data-setup-dot="${index}"></span>`).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(layer);
    return layer;
  }

  async function shouldPlayFirstTimeTransition() {
    return !(await readCompletedState());
  }

  async function showSetupStep(message, index = 0) {
    const layer = ensureLayer();
    const messageElement = layer.querySelector('#onboardingTransitionMessage');
    if (!messageElement) return;
    if (messageElement.textContent !== message) {
      messageElement.classList.add('is-changing');
      await wait(reducedMotion() ? 1 : 90);
      messageElement.textContent = message;
      messageElement.classList.remove('is-changing');
    }
    layer.querySelectorAll('[data-setup-dot]').forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex <= index);
    });
  }

  function focusDashboardHeading() {
    const heading = document.querySelector('#stage h1');
    if (!heading) return;
    const hadTabIndex = heading.hasAttribute('tabindex');
    if (!hadTabIndex) heading.setAttribute('tabindex', '-1');
    heading.classList.add('dashboard-entry-focus');
    heading.focus({ preventScroll: true });
    heading.addEventListener(
      'blur',
      () => {
        heading.classList.remove('dashboard-entry-focus');
        if (!hadTabIndex) heading.removeAttribute('tabindex');
      },
      { once: true }
    );
  }

  async function revealDashboard(options = {}) {
    if (typeof options.prepareDashboard === 'function') await options.prepareDashboard();
    const onboardingElement = options.onboardingElement || document.getElementById('onboarding');
    onboardingElement?.scrollTo?.({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    globalThis.scrollTo?.(0, 0);
    onboardingElement?.classList.add('hidden');
    document.body.classList.remove('onboarding-active', 'onboarding-completing');
    const entranceClass = options.firstTime ? 'dashboard-first-entry' : 'dashboard-returning-entry';
    document.body.classList.remove('dashboard-first-entry', 'dashboard-returning-entry');
    void document.body.offsetWidth;
    document.body.classList.add(entranceClass);
    await nextFrame();
    if (options.focus !== false) {
      const focusDelay = options.firstTime && !reducedMotion() ? 420 : 40;
      const focusTimer = globalThis.setTimeout(() => {
        timers.delete(focusTimer);
        focusDashboardHeading();
      }, focusDelay);
      timers.add(focusTimer);
    }
    const cleanupDelay = options.firstTime && !reducedMotion() ? 1050 : 220;
    const timer = globalThis.setTimeout(() => {
      timers.delete(timer);
      document.body.classList.remove(entranceClass);
    }, cleanupDelay);
    timers.add(timer);
  }

  function finishTransition() {
    const layer = document.getElementById('onboardingTransitionLayer');
    layer?.classList.remove('is-visible', 'is-leaving', 'has-error');
    layer?.setAttribute('aria-hidden', 'true');
    document.querySelector('.onboarding-card')?.classList.remove('is-completing');
    document.body.classList.remove('onboarding-completing');
    active = false;
  }

  async function restoreOnboardingAfterError() {
    const layer = document.getElementById('onboardingTransitionLayer');
    layer?.classList.add('is-leaving');
    await wait(reducedMotion() ? 1 : 180);
    finishTransition();
    document.body.classList.add('onboarding-active');
  }

  async function startOnboardingCompletionTransition(profile, options = {}) {
    if (active) return { played: false };
    const shouldPlay = await shouldPlayFirstTimeTransition();
    if (!shouldPlay) {
      await revealDashboard({ ...options, firstTime: false });
      return { played: false };
    }

    active = true;
    const layer = ensureLayer();
    const onboardingCard = document.querySelector('.onboarding-card');
    document.body.classList.add('onboarding-completing');
    onboardingCard?.classList.add('is-completing');
    layer.classList.remove('is-leaving', 'has-error');
    layer.setAttribute('aria-hidden', 'false');
    await nextFrame();
    layer.classList.add('is-visible');

    const preparation = Promise.resolve().then(() => options.prepareDashboard?.());
    const stepDuration = reducedMotion() ? 150 : 470;

    try {
      for (let index = 0; index < setupMessages.length; index += 1) {
        await showSetupStep(setupMessages[index], index);
        await wait(stepDuration);
      }
      await preparation;
      await revealDashboard({ ...options, prepareDashboard: null, firstTime: true });
      layer.classList.add('is-leaving');
      await wait(reducedMotion() ? 1 : 320);
      await writeCompletedState(true);
      finishTransition();
      options.onComplete?.(profile);
      return { played: true };
    } catch (error) {
      await showSetupStep('We could not finish setting up your workspace.', 0);
      layer.classList.add('has-error');
      await restoreOnboardingAfterError();
      throw error;
    }
  }

  async function reset() {
    clearTimers();
    finishTransition();
    document.body.classList.remove('dashboard-first-entry', 'dashboard-returning-entry', 'onboarding-active');
    await writeCompletedState(false);
  }

  globalThis.LearnovaOnboardingTransition = {
    finishTransition,
    reset,
    revealDashboard,
    shouldPlayFirstTimeTransition,
    showSetupStep,
    startOnboardingCompletionTransition,
  };
})();

importScripts('learnova-config.js', 'profile-service.js');

const LearnovaConfig = globalThis.LearnovaConfig || globalThis.LearnovaWebsiteConfig;
const WebsiteConfig = LearnovaConfig;

const DEFAULT_DISTRACTIONS = [
  ['youtube.com', 20],
  ['tiktok.com', 5],
  ['instagram.com', 10],
  ['reddit.com', 15],
  ['netflix.com', 20],
  ['twitch.tv', 20],
  ['discord.com', 30],
  ['roblox.com', 15],
  ['x.com', 10],
];

const DEFAULT_FOCUS = {
  enabled: true,
  permissionMode: 'balanced',
  interventionLevel: 1,
  defaultLimit: 15,
  snoozeEnabled: true,
  snoozeDuration: 10,
  customSnoozeDuration: 10,
  sites: DEFAULT_DISTRACTIONS.map(([domain, limit]) => ({
    domain,
    enabled: true,
    limit,
    custom: false,
  })),
  overrides: {},
  lastIntervention: {},
  analytics: {
    todayKey: '',
    todayMinutes: 0,
    byDomain: {},
    weekly: [0, 0, 0, 0, 0, 0, 0],
    monthly: [0, 0, 0, 0, 0, 0, 0, 0],
    focusSessions: [],
    interventions: 0,
    timeSavedWeek: 0,
    mostProductiveDay: '',
  },
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeFocus(raw = {}) {
  const merged = {
    ...DEFAULT_FOCUS,
    ...raw,
    analytics: { ...DEFAULT_FOCUS.analytics, ...(raw.analytics || {}) },
    overrides: { ...DEFAULT_FOCUS.overrides, ...(raw.overrides || {}) },
    lastIntervention: { ...DEFAULT_FOCUS.lastIntervention, ...(raw.lastIntervention || {}) },
  };
  const existing = new Map((raw.sites || []).map((site) => [site.domain, site]));
  merged.sites = DEFAULT_DISTRACTIONS.map(([domain, limit]) => ({
    domain,
    enabled: true,
    limit,
    custom: false,
    ...(existing.get(domain) || {}),
  }));
  (raw.sites || [])
    .filter((site) => site.custom && !DEFAULT_DISTRACTIONS.some(([domain]) => domain === site.domain))
    .forEach((site) => merged.sites.push(site));
  return merged;
}

async function getFocus() {
  const stored = await chrome.storage.local.get({ learnovaFocus: DEFAULT_FOCUS });
  return normalizeFocus(stored.learnovaFocus);
}

async function setFocus(focus) {
  await chrome.storage.local.set({ learnovaFocus: normalizeFocus(focus) });
}

function domainFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function siteForDomain(focus, domain) {
  return focus.sites.find((site) => domain === site.domain || domain.endsWith(`.${site.domain}`));
}

function isPaused(focus, domain) {
  return (focus.overrides[domain] || 0) > Date.now();
}

function shouldMonitor(focus, domain) {
  if (!focus.enabled || focus.permissionMode === 'privacy' || !domain || isPaused(focus, domain)) return false;
  if (focus.permissionMode === 'smart') return true;
  const site = siteForDomain(focus, domain);
  return Boolean(site?.enabled);
}

function limitFor(focus, domain) {
  return siteForDomain(focus, domain)?.limit || focus.defaultLimit || 15;
}

function dashboardUrl(route = 'dashboard') {
  return chrome.runtime.getURL(`dashboard.html#${route}`);
}

async function findLearnovaWebsiteTab() {
  const tabs = WebsiteConfig.tabPatterns.length
    ? await chrome.tabs.query({ url: [...WebsiteConfig.tabPatterns] })
    : await chrome.tabs.query({});
  const workspaceBaseUrl = WebsiteConfig.websiteBaseUrl.split('#')[0];
  const matchingTabs = WebsiteConfig.tabPatterns.length
    ? tabs
    : tabs.filter((tab) => String(tab.url || '').split('#')[0] === workspaceBaseUrl);
  return matchingTabs.find((tab) => tab.active) || matchingTabs[0] || null;
}

async function openLearnovaWebsite(route = 'workspace') {
  const targetUrl = WebsiteConfig.websiteUrl(route);
  const existing = await findLearnovaWebsiteTab();

  if (existing?.id) {
    await chrome.tabs.update(existing.id, { active: true, url: targetUrl });
    if (Number.isInteger(existing.windowId)) {
      await chrome.windows.update(existing.windowId, { focused: true });
    }
    return { ok: true, reused: true, tabId: existing.id, url: targetUrl };
  }

  const created = await chrome.tabs.create({ url: targetUrl });
  return { ok: true, reused: false, tabId: created.id, url: targetUrl };
}

async function checkLearnovaWebsite() {
  const website = await LearnovaConfig.checkWebsiteHealth();
  return { ...website, mode: WebsiteConfig.mode };
}

async function checkLearnovaServices() {
  return LearnovaConfig.checkServices();
}

async function recordMinute(domain) {
  const focus = await getFocus();
  const key = todayKey();
  if (focus.analytics.todayKey !== key) {
    focus.analytics.todayKey = key;
    focus.analytics.todayMinutes = 0;
    focus.analytics.byDomain = {};
  }
  focus.analytics.todayMinutes += 1;
  focus.analytics.byDomain[domain] = (focus.analytics.byDomain[domain] || 0) + 1;
  focus.analytics.weekly = [...focus.analytics.weekly.slice(-6), focus.analytics.todayMinutes];
  await setFocus(focus);
  return focus;
}

async function evaluateActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url || !/^https?:/.test(tab.url)) return;

  const focusBefore = await getFocus();
  const domain = domainFromUrl(tab.url);
  if (!shouldMonitor(focusBefore, domain)) return;

  const focus = await recordMinute(domain);
  const minutes = focus.analytics.byDomain[domain] || 0;
  const limit = limitFor(focus, domain);
  if (minutes < limit) return;

  const last = focus.lastIntervention[domain] || 0;
  if (Date.now() - last < 8 * 60 * 1000) return;
  focus.lastIntervention[domain] = Date.now();
  focus.analytics.interventions += 1;
  focus.analytics.timeSavedWeek += 10;
  await setFocus(focus);
  await intervene(tab, domain, minutes, focus);
}

async function intervene(tab, domain, minutes, focus) {
  const storedProfile = await globalThis.LearnovaProfile.getStudentProfile();
  const priority = storedProfile.profileLoaded && storedProfile.profile.personalizationEnabled !== false
    ? storedProfile.profile.weakTopics[0] || storedProfile.profile.subjects[0] || ''
    : '';
  if (focus.interventionLevel === 1) {
    await chrome.notifications.create(`learnova-${domain}-${Date.now()}`, {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Small reminder',
      message: priority
        ? `You've spent ${minutes} minutes on ${domain}. Ready for a quick ${priority} study reset?`
        : `You've spent ${minutes} minutes on ${domain}. Ready for a quick study reset?`,
      buttons: [{ title: 'Study Now' }, { title: 'Snooze' }],
      priority: 1,
    });
    return;
  }

  if (focus.interventionLevel === 2) {
    await injectStrongReminder(tab.id, domain, minutes, focus, priority);
    return;
  }

  const encodedUrl = encodeURIComponent(tab.url || '');
  const encodedDomain = encodeURIComponent(domain);
  await chrome.tabs.update(tab.id, {
    url: chrome.runtime.getURL(`focus-lock.html?site=${encodedDomain}&returnUrl=${encodedUrl}&snooze=${focus.snoozeEnabled ? '1' : '0'}`),
  });
}

async function injectStrongReminder(tabId, domain, minutes, focus, priority) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      args: [domain, minutes, focus.snoozeEnabled, focus.snoozeDuration, priority],
      func: (siteDomain, spentMinutes, snoozeEnabled, snoozeDuration, studyPriority) => {
        const existing = document.getElementById('learnova-focus-overlay');
        if (existing) existing.remove();

        const style = document.createElement('style');
        style.id = 'learnova-focus-style';
        style.textContent = `
          #learnova-focus-overlay {
            position: fixed;
            inset: 0;
            z-index: 2147483647;
            display: grid;
            place-items: center;
            padding: 24px;
            background: rgba(5, 8, 16, 0.38);
            backdrop-filter: blur(7px);
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
          #learnova-focus-overlay * { box-sizing: border-box; }
          .learnova-focus-card {
            width: min(520px, 94vw);
            border: 1px solid rgba(255,255,255,0.16);
            border-radius: 30px;
            padding: 24px;
            background:
              radial-gradient(circle at top right, rgba(77,227,255,0.18), transparent 16rem),
              rgba(13, 18, 31, 0.96);
            color: #f7f9ff;
            box-shadow: 0 30px 120px rgba(0,0,0,0.45);
            animation: learnovaIn 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
          }
          @keyframes learnovaIn {
            from { opacity: 0; transform: translateY(16px) scale(0.98); }
          }
          .learnova-focus-card p { color: #9aa7bd; line-height: 1.6; }
          .learnova-focus-card h1 { margin: 8px 0 10px; font-size: 34px; line-height: 1; letter-spacing: -0.045em; }
          .learnova-focus-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
          .learnova-focus-card button {
            border: 0;
            border-radius: 999px;
            padding: 11px 14px;
            color: #fff;
            cursor: pointer;
            font: inherit;
            font-weight: 850;
          }
          .learnova-primary { background: linear-gradient(135deg, #2b7fff, #9b7cff); }
          .learnova-secondary { background: rgba(255,255,255,0.1); }
          .learnova-muted { background: transparent; color: #9aa7bd !important; }
        `;
        document.head.appendChild(style);

        const overlay = document.createElement('div');
        overlay.id = 'learnova-focus-overlay';
        overlay.innerHTML = `
          <section class="learnova-focus-card">
            <p style="margin:0;color:#4de3ff;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase">Learnova Focus Coach</p>
            <h1>You planned to study today.</h1>
            <p id="learnova-focus-context"></p>
            <p>Take one quick 10-minute session? No pressure. Just a small reset.</p>
            <div class="learnova-focus-actions">
              <button class="learnova-primary" id="learnova-start">Start Studying</button>
              ${snoozeEnabled ? `<button class="learnova-secondary" id="learnova-snooze">Snooze ${snoozeDuration} min</button>` : ''}
              <button class="learnova-muted" id="learnova-continue">Continue Browsing</button>
            </div>
          </section>
        `;
        document.body.appendChild(overlay);
        document.getElementById('learnova-focus-context').textContent = studyPriority
          ? `You've spent ${spentMinutes} minutes on ${siteDomain}. A possible study focus is ${studyPriority}.`
          : `You've spent ${spentMinutes} minutes on ${siteDomain}. Ready for a small study reset?`;

        document.getElementById('learnova-start').addEventListener('click', () => {
          chrome.runtime.sendMessage({ type: 'learnova-open-route', route: 'quiz' });
        });
        document.getElementById('learnova-snooze')?.addEventListener('click', () => {
          chrome.runtime.sendMessage({ type: 'learnova-snooze', domain: siteDomain, minutes: snoozeDuration });
          overlay.remove();
        });
        document.getElementById('learnova-continue').addEventListener('click', () => {
          chrome.runtime.sendMessage({ type: 'learnova-snooze', domain: siteDomain, minutes: 15 });
          overlay.remove();
        });
      },
    });
  } catch (error) {
    await chrome.notifications.create(`learnova-fallback-${Date.now()}`, {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Ready to get back on track?',
      message: `You've spent ${minutes} minutes on ${domain}. Want a quick study reset?`,
      buttons: [{ title: 'Study Now' }, { title: 'Snooze' }],
    });
  }
}

async function pauseDomain(domain, minutes) {
  const focus = await getFocus();
  focus.overrides[domain] = Date.now() + Number(minutes || 15) * 60 * 1000;
  await setFocus(focus);
}

chrome.runtime.onInstalled.addListener(async (details) => {
  const focus = await getFocus();
  await setFocus(focus);
  await chrome.alarms.create('learnova-focus-tick', { periodInMinutes: 1 });
  if (details.reason === 'install') {
    await chrome.storage.local.set({ learnovaInstallVersion: chrome.runtime.getManifest().version });
    await chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
  }
});

chrome.runtime.onStartup.addListener(async () => {
  await chrome.alarms.create('learnova-focus-tick', { periodInMinutes: 1 });
});

chrome.alarms.get('learnova-focus-tick').then((alarm) => {
  if (!alarm) chrome.alarms.create('learnova-focus-tick', { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'learnova-focus-tick') evaluateActiveTab();
});

chrome.tabs.onActivated.addListener(() => evaluateActiveTab());
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') evaluateActiveTab();
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (!notificationId.startsWith('learnova-')) return;
  if (buttonIndex === 0) {
    chrome.tabs.create({ url: dashboardUrl('quiz') });
  }
  if (buttonIndex === 1) {
    const domain = notificationId.split('-').slice(1, -1).join('-');
    pauseDomain(domain, 10);
  }
});

chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId.startsWith('learnova-')) chrome.tabs.create({ url: dashboardUrl('quiz') });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.type === 'learnova-open-website') {
      sendResponse(await openLearnovaWebsite(message.route || 'workspace'));
      return;
    }
    if (message.type === 'learnova-check-website') {
      sendResponse(await checkLearnovaWebsite());
      return;
    }
    if (message.type === 'learnova-check-services') {
      sendResponse(await checkLearnovaServices());
      return;
    }
    if (message.type === 'learnova-open-route') {
      await chrome.tabs.create({ url: dashboardUrl(message.route || 'dashboard') });
    }
    if (message.type === 'learnova-snooze' || message.type === 'learnova-emergency-unlock') {
      await pauseDomain(message.domain, message.minutes || 15);
    }
    sendResponse({ ok: true });
  })();
  return true;
});

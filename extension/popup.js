const subjects = {
  Mathematics: ['Algebra', 'Quadratics', 'Trigonometry', 'Circle theorems'],
  Chemistry: ['Moles', 'Bonding', 'Rates of reaction', 'Electrolysis'],
  Physics: ['Forces', 'Energy', 'Electricity', 'Waves'],
  English: ['Analysis', 'Summary writing', 'Evaluation'],
  'Computer Science': ['Binary', 'Networks', 'CPU', 'Programming'],
};

const WebsiteConfig = globalThis.LearnovaConfig || globalThis.LearnovaWebsiteConfig;
const extensionApi = globalThis.chrome?.storage?.local ? globalThis.chrome : null;
const pageTitle = document.getElementById('pageTitle');
const pageUrl = document.getElementById('pageUrl');
const subject = document.getElementById('subject');
const topic = document.getElementById('topic');
const notes = document.getElementById('notes');
const save = document.getElementById('save');
const status = document.getElementById('status');
const openWorkspace = document.getElementById('openWorkspace');
const connectionStatus = document.getElementById('connectionStatus');
const retryConnection = document.getElementById('retryConnection');
const workspaceDestination = document.getElementById('workspaceDestination');
const websiteButtons = [openWorkspace, ...document.querySelectorAll('[data-website-route]')];

let websiteAvailable = false;
let checkingWebsite = false;
let currentTab = {
  title: 'Demo study page',
  url: 'https://example.com/study-material',
  selectedText: '',
};

function fillSubjects() {
  subject.innerHTML = Object.keys(subjects).map((item) => `<option value="${item}">${item}</option>`).join('');
  subject.value = 'Chemistry';
  fillTopics();
}

function fillTopics() {
  topic.innerHTML = subjects[subject.value].map((item) => `<option value="${item}">${item}</option>`).join('');
}

function hostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function setWebsiteControlsEnabled(enabled) {
  websiteButtons.forEach((button) => {
    button.disabled = !enabled;
    button.setAttribute('aria-disabled', String(!enabled));
  });
}

function setConnectionState(state) {
  connectionStatus.className = `connection-status ${state === 'ai-unavailable' ? 'unavailable' : state}`;
  if (state === 'connected') {
    connectionStatus.querySelector('span').textContent = 'Learnova connected';
    websiteAvailable = true;
    setWebsiteControlsEnabled(true);
    return;
  }
  if (state === 'ai-unavailable') {
    connectionStatus.querySelector('span').textContent = 'AI service unavailable';
    websiteAvailable = true;
    setWebsiteControlsEnabled(true);
    return;
  }
  if (state === 'unavailable') {
    connectionStatus.querySelector('span').textContent = 'Website unavailable';
    websiteAvailable = false;
    setWebsiteControlsEnabled(false);
    return;
  }
  connectionStatus.querySelector('span').textContent = 'Checking connection';
  setWebsiteControlsEnabled(false);
}

async function checkWebsiteConnection() {
  if (checkingWebsite) return websiteAvailable;
  checkingWebsite = true;
  setConnectionState('checking');

  try {
    let result;
    if (extensionApi?.runtime) {
      result = await extensionApi.runtime.sendMessage({ type: 'learnova-check-services' });
    } else {
      const [websiteResponse, ai] = await Promise.all([
        fetch(WebsiteConfig.websiteBaseUrl, { cache: 'no-store' }),
        WebsiteConfig.checkApiHealth(),
      ]);
      result = {
        websiteAvailable: websiteResponse.ok,
        aiAvailable: ai.available,
        openAIConfigured: ai.openAIConfigured,
      };
    }
    if (!result?.websiteAvailable) setConnectionState('unavailable');
    else if (!result?.aiAvailable || !result?.openAIConfigured) setConnectionState('ai-unavailable');
    else setConnectionState('connected');
  } catch {
    setConnectionState('unavailable');
  } finally {
    checkingWebsite = false;
  }
  return websiteAvailable;
}

async function openWebsiteRoute(route = 'workspace') {
  if (!websiteAvailable && !(await checkWebsiteConnection())) {
    status.textContent = 'AI website unavailable. Extension tools are still ready below.';
    return;
  }

  try {
    if (extensionApi?.runtime) {
      const result = await extensionApi.runtime.sendMessage({ type: 'learnova-open-website', route });
      if (!result?.ok) throw new Error('Website could not be opened');
      window.close();
      return;
    }
    window.open(WebsiteConfig.websiteUrl(route), '_blank', 'noopener');
  } catch {
    setConnectionState('unavailable');
    status.textContent = 'Website unavailable. You can continue using extension tools.';
  }
}

function openInternalRoute(route = 'dashboard') {
  if (!extensionApi?.tabs || !extensionApi?.runtime) {
    status.textContent = 'Load Learnova as an unpacked Chrome extension to open extension pages.';
    return;
  }
  extensionApi.tabs.create({ url: extensionApi.runtime.getURL(`dashboard.html#${route}`) });
  window.close();
}

async function getSavedPages() {
  if (extensionApi) {
    const existing = await extensionApi.storage.local.get({ learnovaSavedPages: [] });
    return existing.learnovaSavedPages;
  }
  return JSON.parse(localStorage.getItem('learnovaSavedPages') || '[]');
}

async function detectCurrentPage() {
  try {
    if (!extensionApi?.tabs) throw new Error('Chrome tabs API unavailable');
    const [tab] = await extensionApi.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      currentTab = { title: tab.title || 'Untitled study page', url: tab.url || '', selectedText: '' };
      try {
        if (extensionApi.scripting && tab.id && /^https?:/.test(tab.url || '')) {
          const [selection] = await extensionApi.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => String(window.getSelection?.() || '').slice(0, 1200),
          });
          currentTab.selectedText = selection?.result || '';
        }
      } catch {
        currentTab.selectedText = '';
      }
    }
  } catch {
    currentTab = {
      title: 'Demo study page',
      url: 'https://example.com/study-material',
      selectedText: 'Demo selected text from a study page.',
    };
  }

  pageTitle.textContent = currentTab.title;
  pageUrl.textContent = currentTab.url;
}

async function saveMaterial(action = 'Saved from Chrome') {
  const item = {
    id: crypto.randomUUID(),
    title: currentTab.title,
    url: currentTab.url,
    subject: subject.value,
    topic: topic.value,
    notes: notes.value,
    selectedText: currentTab.selectedText,
    action,
    savedAt: new Date().toISOString(),
  };

  const existing = await getSavedPages();
  const next = [item, ...existing];
  const browserContext = {
    title: currentTab.title,
    url: currentTab.url,
    selectedText: currentTab.selectedText,
    studyWebsite: hostname(currentTab.url) || 'example.com',
    assignment: notes.value,
    capturedAt: new Date().toISOString(),
  };

  if (extensionApi) {
    await extensionApi.storage.local.set({ learnovaSavedPages: next, learnovaBrowserContext: browserContext });
  } else {
    localStorage.setItem('learnovaSavedPages', JSON.stringify(next));
    localStorage.setItem('learnovaBrowserContext', JSON.stringify(browserContext));
  }

  status.textContent = action === 'Saved from Chrome' ? 'Saved from Chrome.' : `${action} queued from this page.`;
}

subject.addEventListener('change', fillTopics);
save.addEventListener('click', () => saveMaterial());
openWorkspace.addEventListener('click', () => openWebsiteRoute('workspace'));
connectionStatus.addEventListener('click', checkWebsiteConnection);
retryConnection.addEventListener('click', checkWebsiteConnection);

document.querySelectorAll('[data-website-route]').forEach((button) => {
  button.addEventListener('click', () => openWebsiteRoute(button.dataset.websiteRoute));
});

document.querySelectorAll('[data-internal-route]').forEach((button) => {
  button.addEventListener('click', () => openInternalRoute(button.dataset.internalRoute));
});

document.querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', () => saveMaterial(button.dataset.action));
});

workspaceDestination.textContent = WebsiteConfig.mode === 'production'
  ? new URL(WebsiteConfig.websiteBaseUrl).host
  : 'Local development workspace';
fillSubjects();
detectCurrentPage();
checkWebsiteConnection();

const WebsiteConfig = globalThis.LearnovaConfig || globalThis.LearnovaWebsiteConfig;
const extensionApi = globalThis.chrome?.runtime ? globalThis.chrome : null;
const openWebsiteButton = document.getElementById('openWebsite');
const openExtensionButton = document.getElementById('openExtension');
const destinationLabel = document.getElementById('destinationLabel');
const websiteStatus = document.getElementById('websiteStatus');
const retryConnection = document.getElementById('retryConnection');

let websiteAvailable = false;
let checking = false;

function setConnectionState(state) {
  websiteStatus.className = `website-status ${state === 'ai-unavailable' ? 'unavailable' : state}`;
  websiteAvailable = state === 'connected' || state === 'ai-unavailable';
  openWebsiteButton.disabled = !websiteAvailable;

  const labels = {
    checking: 'Checking Learnova...',
    connected: 'Learnova connected',
    'ai-unavailable': 'Workspace ready. AI service is unavailable.',
    unavailable: 'Website unavailable. The extension workspace is still ready.',
  };
  websiteStatus.querySelector('span').textContent = labels[state];
}

async function checkConnection() {
  if (checking) return;
  checking = true;
  setConnectionState('checking');

  try {
    let result;
    if (extensionApi) {
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
    checking = false;
  }
}

async function openWebsite() {
  if (!websiteAvailable) return;
  try {
    if (extensionApi) {
      const result = await extensionApi.runtime.sendMessage({ type: 'learnova-open-website', route: 'workspace' });
      if (!result?.ok) throw new Error('Unable to open Learnova');
      return;
    }
    window.open(WebsiteConfig.websiteUrl('workspace'), '_blank', 'noopener');
  } catch {
    setConnectionState('unavailable');
  }
}

function openExtensionWorkspace() {
  const url = extensionApi?.runtime?.getURL('dashboard.html#dashboard') || 'dashboard.html#dashboard';
  if (extensionApi?.tabs) {
    extensionApi.tabs.create({ url });
    return;
  }
  window.location.href = url;
}

destinationLabel.textContent = WebsiteConfig.mode === 'production'
  ? new URL(WebsiteConfig.websiteBaseUrl).host
  : 'Local development workspace';
openWebsiteButton.addEventListener('click', openWebsite);
openExtensionButton.addEventListener('click', openExtensionWorkspace);
retryConnection.addEventListener('click', checkConnection);
checkConnection();

const params = new URLSearchParams(location.search);
const site = params.get('site') || 'this website';
const returnUrl = params.get('returnUrl') || '';
const snoozeAllowed = params.get('snooze') !== '0';

document.getElementById('siteName').textContent = site;
if (!snoozeAllowed) document.getElementById('snooze').style.display = 'none';

function dashboard(route) {
  return chrome.runtime.getURL(`dashboard.html#${route}`);
}

function send(type, minutes) {
  return chrome.runtime.sendMessage({ type, domain: site, minutes });
}

function selectedDuration() {
  return Number(document.getElementById('duration').value || 15);
}

document.getElementById('startQuiz').addEventListener('click', () => {
  location.href = dashboard('quiz');
});

document.getElementById('openPlanner').addEventListener('click', () => {
  location.href = dashboard('planner');
});

document.getElementById('snooze').addEventListener('click', async () => {
  await send('learnova-snooze', selectedDuration());
  if (returnUrl) location.href = returnUrl;
});

document.getElementById('emergency').addEventListener('click', async () => {
  await send('learnova-emergency-unlock', selectedDuration());
  if (returnUrl) location.href = returnUrl;
});

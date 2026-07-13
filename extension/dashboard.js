const subjects = {
  Mathematics: ['Algebra', 'Quadratics', 'Trigonometry', 'Circle theorems'],
  Chemistry: ['Moles', 'Bonding', 'Rates of reaction', 'Electrolysis'],
  Physics: ['Forces', 'Energy', 'Electricity', 'Waves'],
  English: ['Analysis', 'Summary writing', 'Evaluation'],
  'Computer Science': ['Binary', 'Networks', 'CPU', 'Programming'],
};

const defaultDistractingSites = [
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

const defaultFocus = {
  enabled: true,
  permissionMode: 'balanced',
  interventionLevel: 1,
  defaultLimit: 15,
  snoozeEnabled: true,
  snoozeDuration: 10,
  customSnoozeDuration: 10,
  sites: defaultDistractingSites.map(([domain, limit]) => ({
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
    byDomain: {
      'youtube.com': 31,
      'instagram.com': 12,
      'discord.com': 18,
    },
    weekly: [18, 24, 14, 32, 20, 11, 16],
    monthly: [62, 70, 48, 84, 55, 76, 44, 66],
    focusSessions: [24, 31, 28, 35, 42],
    interventions: 4,
    timeSavedWeek: 75,
    mostProductiveDay: 'Wednesday',
  },
};

const ThemeManager = globalThis.LearnovaTheme;
const OnboardingTransition = globalThis.LearnovaOnboardingTransition;
const ProfileService = globalThis.LearnovaProfile;
const defaultThemePreference = ThemeManager.defaultPreference;
const accents = ThemeManager.accents;
const themes = ThemeManager.themes;
const isDevelopment =
  location.hostname === 'localhost' ||
  location.hostname === '127.0.0.1' ||
  location.protocol === 'file:';

const curriculumOptions = [
  'IB',
  'AP',
  'A Levels',
  'AS Levels',
  'IGCSE',
  'GCSE',
  'O Levels',
  'National Curriculum',
  'Middle School',
  'High School',
  'University',
  'College',
  'Homeschool',
  'Other',
];
const studyStyleOptions = ['Flashcards', 'Quizzes', 'Summaries', 'Step-by-step explanations', 'Past-paper practice'];

const defaultAuth = {
  isLoggedIn: false,
  profileComplete: false,
  email: '',
  createdAt: '',
};

const defaultState = {
  plan: 'Plus',
  onboarded: false,
  aiProvider: 'openai',
  theme: defaultThemePreference,
  studentProfile: {
    name: 'Alex Student',
    email: '',
    grade: 10,
    yearGroup: 'Year 10',
    ageRange: '',
    countryRegion: '',
    avatarDataUrl: '',
    curriculumChoice: 'IGCSE',
    customCurriculum: '',
    curriculum: 'Cambridge IGCSE',
    schoolName: '',
    subjects: ['Mathematics', 'Chemistry', 'Physics', 'English', 'Computer Science'],
    targetGrades: 'A/A*',
    upcomingDeadlines: ['Chemistry ATP revision', 'English essay', 'Math practice'],
    goals: ['Raise Chemistry confidence', 'Prepare for end-of-term exams', 'Build a consistent revision habit'],
    weakTopics: ['Chemistry moles', 'Math quadratics', 'English analysis'],
    strengths: ['Physics energy', 'English summary writing', 'Computer Science binary'],
    learningPreferences: ['simple explanations first', 'short quizzes', 'visual summaries', 'step-by-step examples'],
    studyStyle: ['Flashcards', 'Quizzes', 'Step-by-step explanations'],
    universityInterests: '',
    extracurricularInterests: '',
    dailyStudyTime: '45 minutes',
    preferredExplanationStyle: 'Simple, step-by-step explanations',
    personalizationEnabled: true,
    quizHistory: [
      { title: 'Quadratics checkpoint', subject: 'Mathematics', topic: 'Quadratics', score: 78 },
      { title: 'Moles basics', subject: 'Chemistry', topic: 'Moles', score: 62 },
      { title: 'Energy stores', subject: 'Physics', topic: 'Energy', score: 84 },
    ],
    revisionHistory: [
      'Reviewed Chemistry moles yesterday',
      'Completed Math quadratics flashcards this week',
      'Skipped Physics electricity planner task',
    ],
  },
  auth: defaultAuth,
  browserContext: {
    title: 'Waves revision guide',
    url: 'https://example.com/physics/waves',
    selectedText: 'Waves transfer energy without transferring matter.',
    studyWebsite: 'example.com',
    assignment: 'Physics waves checkpoint due Friday',
  },
  previousQuizzes: [
    { title: 'Quadratics checkpoint', subject: 'Mathematics', topic: 'Quadratics', score: 78 },
    { title: 'Moles basics', subject: 'Chemistry', topic: 'Moles', score: 62 },
  ],
  assistantUploads: [],
  flashcardMemory: [
    { subject: 'Chemistry', topic: 'Moles', front: 'What is Avogadro constant?', back: '6.02 x 10^23 particles per mole.' },
    { subject: 'Physics', topic: 'Waves', front: 'What do waves transfer?', back: 'Energy, not matter.' },
  ],
  savedPages: [],
  materials: [
    { title: 'Chemistry moles revision sheet', subject: 'Chemistry', type: 'PDF', topic: 'Moles' },
    { title: 'Quadratics class notes', subject: 'Mathematics', type: 'Notes', topic: 'Quadratics' },
    { title: 'Electric circuits slides', subject: 'Physics', type: 'Slides', topic: 'Electricity' },
    { title: 'English summary examples', subject: 'English', type: 'Doc', topic: 'Summary writing' },
  ],
  mastery: [
    { subject: 'Chemistry', topic: 'Moles', score: 42 },
    { subject: 'Mathematics', topic: 'Quadratics', score: 68 },
    { subject: 'Physics', topic: 'Energy', score: 82 },
    { subject: 'English', topic: 'Summary writing', score: 74 },
    { subject: 'Computer Science', topic: 'Binary', score: 71 },
    { subject: 'Physics', topic: 'Electricity', score: 57 },
    { subject: 'Chemistry', topic: 'Bonding', score: 64 },
  ],
  focus: defaultFocus,
};

const routes = [
  { id: 'dashboard', label: 'Home', icon: 'dashboard', group: 'main' },
  { id: 'library', label: 'Study Sets', icon: 'library', group: 'main' },
  { id: 'studyset', label: 'Study set', icon: 'library', group: 'hidden' },
  { id: 'assistant', label: 'AI Tutor', icon: 'assistant', group: 'main' },
  { id: 'flashcards', label: 'Flashcards', icon: 'flashcards', group: 'main' },
  { id: 'quiz', label: 'Quizzes', icon: 'quiz', group: 'main' },
  { id: 'mastery', label: 'Progress', icon: 'mastery', group: 'main' },
  { id: 'profile', label: 'Profile', icon: 'profile', group: 'main' },
  { id: 'settings', label: 'Settings', icon: 'settings', group: 'main' },
  { id: 'capture', label: 'Add materials', icon: 'capture', group: 'more' },
  { id: 'planner', label: 'Revision planner', icon: 'planner', group: 'more' },
  { id: 'focus', label: 'Focus Coach', icon: 'focus', group: 'more' },
  { id: 'pricing', label: 'Pricing', icon: 'pricing', group: 'more' },
  { id: 'roadmap', label: 'Future roadmap', icon: 'roadmap', group: 'more' },
];

const planner = [
  { day: 'Mon', task: 'Chemistry moles practice', detail: '25 min active recall', locked: false },
  { day: 'Tue', task: 'Math quadratics quiz', detail: '20 min checkpoint', locked: false },
  { day: 'Wed', task: 'Physics electricity flashcards', detail: '15 min rapid review', locked: false },
  { day: 'Thu', task: 'English summary timed practice', detail: '30 min exam rhythm', locked: false },
  { day: 'Fri', task: 'Exam strategy planner', detail: 'Premium planning layer', locked: true },
];

const flashcards = [
  ['Chemistry', 'Moles', 'What is Avogadro constant?', '6.02 x 10^23 particles per mole.'],
  ['Mathematics', 'Quadratics', 'What does the discriminant tell you?', 'How many real roots a quadratic has.'],
  ['Physics', 'Electricity', "State Ohm's law.", 'Voltage equals current multiplied by resistance: V = IR.'],
  ['Computer Science', 'Binary', 'What is 1010 in denary?', '10.'],
];

const pricing = [
  {
    name: 'Starter',
    price: '$10',
    description: 'For focused weekly practice.',
    features: ['Basic AI Study Assistant', '20 quiz generations/month', '50 flashcards/month', 'Save study materials', 'Basic revision planner'],
  },
  {
    name: 'Plus',
    price: '$50',
    description: 'For ambitious students building momentum.',
    featured: true,
    features: ['Unlimited quizzes', 'Unlimited flashcards', 'Advanced AI explanations', 'Weak-topic tracker', 'Personalized revision plans', 'Chrome extension access', 'Progress analytics'],
  },
  {
    name: 'Premium',
    price: '$75',
    description: 'For high-stakes exams and deeper support.',
    features: ['Everything in Plus', 'Priority AI tutor mode', 'Exam strategy planner', 'Parent progress dashboard', 'Advanced subject reports', 'Essay feedback mode', 'SAT/IB/IGCSE prep mode', 'Early access to new features'],
  },
];

const stage = document.getElementById('stage');
const insightPanel = document.getElementById('insightPanel');
const railNav = document.getElementById('railNav');
const planLabel = document.getElementById('planLabel');
const profileButton = document.getElementById('profileButton');
const profileAvatar = document.getElementById('profileAvatar');
const profileName = document.getElementById('profileName');
const profileGrade = document.getElementById('profileGrade');
const modal = document.getElementById('modal');
const onboarding = document.getElementById('onboarding');
const toast = document.getElementById('toast');
const commandButton = document.getElementById('commandButton');
const resetOnboarding = document.getElementById('resetOnboarding');
const extensionStorage = globalThis.chrome?.storage?.local || null;

let state = { ...defaultState };
let activeRoute = 'dashboard';
let selectedAnswers = {};
let activeCard = 0;
let cardFlipped = false;
let toastTimer = null;
let onboardingStep = 0;
let onboardingMode = 'signup';
let onboardingDraft = {};
let onboardingErrors = {};
let onboardingReturnFocus = null;
let assistantDraft = '';
let pendingQuiz = null;
let revealObserver = null;
let activeStudySetId = '';

function normalizeFocus(raw = {}) {
  const merged = {
    ...defaultFocus,
    ...raw,
    analytics: { ...defaultFocus.analytics, ...(raw.analytics || {}) },
    overrides: { ...defaultFocus.overrides, ...(raw.overrides || {}) },
    lastIntervention: { ...defaultFocus.lastIntervention, ...(raw.lastIntervention || {}) },
  };
  const existing = new Map((raw.sites || []).map((site) => [site.domain, site]));
  merged.sites = defaultDistractingSites.map(([domain, limit]) => ({
    domain,
    enabled: true,
    limit,
    custom: false,
    ...(existing.get(domain) || {}),
  }));
  (raw.sites || [])
    .filter((site) => site.custom && !defaultDistractingSites.some(([domain]) => domain === site.domain))
    .forEach((site) => merged.sites.push(site));
  return merged;
}

function getTheme(themeId) {
  return ThemeManager.getTheme(themeId);
}

function getAccent(accentId) {
  return ThemeManager.getAccent(accentId);
}

function normalizeThemePreference(raw = {}) {
  return ThemeManager.normalizePreference(raw);
}

function toList(value) {
  return ProfileService.toList(value);
}

function listText(value) {
  return toList(value).join(', ');
}

function normalizeAuth(raw = {}) {
  return { ...defaultAuth, ...ProfileService.normalizeAuth(raw) };
}

function normalizeStudentProfile(raw = {}) {
  const source = raw && Object.keys(raw).length ? raw : defaultState.studentProfile;
  return ProfileService.normalizeStudentProfile(source);
}

function resolveTheme(preference = defaultThemePreference) {
  return ThemeManager.resolve(preference);
}

function applyThemePreference(preference = defaultThemePreference, animate = true) {
  ThemeManager.apply(preference, { animate });
}

async function setThemePreference(nextTheme, options = {}) {
  const theme = normalizeThemePreference({ ...state.theme, ...nextTheme });
  state = normalizeState({ ...state, theme });
  await ThemeManager.save(theme);
  updateThemeControls();
  if (options.toast !== false) showToast('Theme updated.');
}

function normalizeState(raw = {}) {
  return {
    ...defaultState,
    ...raw,
    focus: normalizeFocus(raw.focus),
    theme: normalizeThemePreference(raw.theme),
    auth: normalizeAuth(raw.auth),
    materials: raw.materials || defaultState.materials,
    mastery: raw.mastery || defaultState.mastery,
    savedPages: raw.savedPages || [],
    aiProvider: raw.aiProvider && raw.aiProvider !== 'mock' ? raw.aiProvider : defaultState.aiProvider,
    studentProfile: normalizeStudentProfile(raw.studentProfile),
    browserContext: { ...defaultState.browserContext, ...(raw.browserContext || {}) },
    previousQuizzes: raw.previousQuizzes || defaultState.previousQuizzes,
    assistantUploads: raw.assistantUploads || [],
    flashcardMemory: raw.flashcardMemory || defaultState.flashcardMemory,
  };
}

const storage = {
  async get() {
    if (extensionStorage) {
      const [stored, savedProfile] = await Promise.all([
        extensionStorage.get({
          learnovaState: defaultState,
          learnovaSavedPages: [],
          learnovaFocus: defaultFocus,
          learnovaBrowserContext: defaultState.browserContext,
          learnovaTheme: defaultThemePreference,
        }),
        ProfileService.getStudentProfile(),
      ]);
      return normalizeState({
        ...defaultState,
        ...stored.learnovaState,
        focus: stored.learnovaFocus || stored.learnovaState.focus,
        browserContext: stored.learnovaBrowserContext || stored.learnovaState.browserContext,
        savedPages: stored.learnovaSavedPages || [],
        theme: stored.learnovaTheme || stored.learnovaState.theme,
        studentProfile: savedProfile.profileLoaded ? savedProfile.profile : stored.learnovaState.studentProfile,
        auth: savedProfile.profileLoaded ? savedProfile.auth : stored.learnovaState.auth,
      });
    }

    const savedProfile = await ProfileService.getStudentProfile();
    return normalizeState({
      ...defaultState,
      ...JSON.parse(localStorage.getItem('learnovaState') || '{}'),
      focus: JSON.parse(localStorage.getItem('learnovaFocus') || 'null') || defaultFocus,
      browserContext: JSON.parse(localStorage.getItem('learnovaBrowserContext') || 'null') || defaultState.browserContext,
      savedPages: JSON.parse(localStorage.getItem('learnovaSavedPages') || '[]'),
      studentProfile: savedProfile.profileLoaded ? savedProfile.profile : undefined,
      auth: savedProfile.profileLoaded ? savedProfile.auth : undefined,
    });
  },
  async set(next) {
    state = normalizeState(next);
    applyThemePreference(state.theme);
    if (extensionStorage) {
      await extensionStorage.set({
        learnovaState: state,
        learnovaSavedPages: state.savedPages,
        learnovaFocus: state.focus,
        learnovaBrowserContext: state.browserContext,
        learnovaTheme: state.theme,
      });
      return;
    }
    localStorage.setItem('learnovaState', JSON.stringify(state));
    localStorage.setItem('learnovaSavedPages', JSON.stringify(state.savedPages));
    localStorage.setItem('learnovaFocus', JSON.stringify(state.focus));
    localStorage.setItem('learnovaBrowserContext', JSON.stringify(state.browserContext));
    localStorage.setItem('learnovaThemeCache', JSON.stringify(state.theme));
  },
};

async function getProfile() {
  const stored = await ProfileService.getStudentProfile();
  return {
    ...stored,
    profile: stored.profileLoaded ? normalizeStudentProfile(stored.profile) : normalizeStudentProfile(defaultState.studentProfile),
    auth: normalizeAuth(stored.auth),
  };
}

function studentProfilePayload(profile = state.studentProfile) {
  return ProfileService.buildStudentContext(profile);
}

async function saveProfile(profile, auth = {}) {
  const normalizedProfile = normalizeStudentProfile(profile);
  const saved = await ProfileService.saveStudentProfile(normalizedProfile, { ...state.auth, ...auth });
  const normalizedAuth = normalizeAuth(saved.auth);
  await storage.set({
    ...state,
    onboarded: true,
    studentProfile: saved.profile,
    auth: normalizedAuth,
  });
  applyProfileToDashboard();
  return saved.profile;
}

async function updateProfile(changes) {
  const saved = await ProfileService.updateStudentProfile(changes);
  await storage.set({
    ...state,
    studentProfile: saved.profile,
    auth: normalizeAuth(saved.auth),
  });
  applyProfileToDashboard();
  return saved.profile;
}

async function clearProfile() {
  await ProfileService.clearStudentProfile();
  await storage.set({
    ...state,
    onboarded: false,
    studentProfile: defaultState.studentProfile,
    auth: defaultAuth,
  });
  await OnboardingTransition?.reset();
  applyProfileToDashboard();
}

function applyProfileToDashboard() {
  updateProfileChip();
}

function injectProfileIntoAssistantContext(context) {
  const profile = studentProfilePayload(state.studentProfile);
  const { auth: _privateAuth, ...safeContext } = context;
  const personalizationEnabled = Boolean(
    state.auth.profileComplete && state.studentProfile.personalizationEnabled !== false
  );
  return {
    ...safeContext,
    studentProfile: personalizationEnabled ? profile : {},
    personalizationEnabled,
    profileContext: personalizationEnabled ? {
      identity: `${profile.name}, ${profile.yearGroup || profile.grade}`,
      curriculum: profile.curriculum,
      countryRegion: profile.countryRegion,
      subjects: profile.subjects,
      targetGrades: profile.targetGrades,
      upcomingDeadlines: profile.upcomingDeadlines,
      goals: profile.academicGoals,
      weakTopics: profile.weakTopics,
      studyStyle: profile.preferredStudyStyle,
      preferredExplanationStyle: profile.preferredExplanationStyle,
      universityInterests: profile.universityInterests,
      careerInterests: profile.careerInterests,
      extracurricularInterests: profile.extracurricularInterests,
      availableStudyTime: profile.availableStudyTime,
    } : {},
  };
}

function profileDebugSummary(profile, profileLoaded) {
  const normalized = normalizeStudentProfile(profile);
  return {
    profileLoaded,
    personalizationEnabled: Boolean(profileLoaded && normalized.personalizationEnabled),
    curriculum: normalized.curriculum || 'Not set',
    subjectCount: toList(normalized.subjects).length,
    weakTopicsCount: toList(normalized.weakTopics).length,
  };
}

async function saveFocus(nextFocus, rerender = true) {
  await storage.set({ ...state, focus: normalizeFocus(nextFocus) });
  if (rerender) {
    render();
    showToast('Focus controls saved locally.');
  }
}

function themePreviewStyle(theme) {
  return `--preview-bg:${theme.preview[0]};--preview-primary:${theme.preview[1]};--preview-secondary:${theme.preview[2]};`;
}

function accentSwatchesMarkup(selectedAccentId) {
  return accents
    .map(
      (item) => `
        <button class="accent-swatch ${item.id === selectedAccentId ? 'active' : ''}" data-accent-id="${item.id}" aria-label="${item.name} accent" style="--swatch-a:${item.vars['--blue-strong']};--swatch-b:${item.vars['--cyan']};"></button>
      `
    )
    .join('');
}

function modeToggleMarkup(mode) {
  return `
    <div class="theme-segment" role="group" aria-label="Theme mode">
      <button class="theme-mode-button ${mode === 'dark' ? 'active' : ''}" data-mode="dark">Dark</button>
      <button class="theme-mode-button ${mode === 'light' ? 'active' : ''}" data-mode="light">Light</button>
    </div>
  `;
}

function themeSelectMarkup(themeId) {
  return `
    <select class="theme-select">
      ${themes.map((item) => `<option value="${item.id}" ${item.id === themeId ? 'selected' : ''}>${item.name}</option>`).join('')}
    </select>
  `;
}

function ThemeSettingsPanel() {
  const { normalized, theme, accent } = resolveTheme(state.theme);
  return panel(`
    <div class="theme-settings-card">
      <div>
        <p class="eyebrow">Appearance</p>
        <h2>Theme system</h2>
        <p class="muted">Choose a built-in workspace theme, tune the accent, or switch between dark and light surfaces. Changes apply instantly and persist locally.</p>
      </div>
      <div class="theme-control-grid">
        <label>Theme selector${themeSelectMarkup(normalized.themeId)}</label>
        <div>
          <strong>Dark / Light mode</strong>
          ${modeToggleMarkup(normalized.mode)}
        </div>
        <div class="theme-accent-block">
          <strong>Accent color</strong>
          <div class="accent-swatches">${accentSwatchesMarkup(normalized.accentId)}</div>
        </div>
        <div class="theme-current-card">
          <span class="theme-mini-preview" style="${themePreviewStyle(theme)}"></span>
          <div>
            <strong data-theme-current>${theme.name}</strong>
            <small>${accent.name} accent - ${normalized.mode === 'dark' ? 'Dark' : 'Light'} mode</small>
          </div>
        </div>
      </div>
      <div class="theme-actions">
        <button class="primary" data-open-theme-modal>Open theme gallery</button>
        <button class="secondary" data-reset-theme>Reset to default</button>
      </div>
    </div>
  `);
}

function ThemeModal() {
  const { normalized, theme, accent } = resolveTheme(state.theme);
  return `
    <section class="modal-card theme-modal-card">
      <div class="section-title">
        <div>
          <p class="eyebrow">Appearance</p>
          <h2>Choose your Learnova theme</h2>
          <p class="muted">Preview each palette, then apply it across the entire extension instantly.</p>
        </div>
        <button id="closeModal" class="secondary">Close</button>
      </div>
      <div class="theme-gallery">
        ${themes
          .map(
            (item) => `
              <button class="theme-option ${item.id === normalized.themeId ? 'selected' : ''}" data-theme-id="${item.id}">
                <span class="theme-preview-tile" style="${themePreviewStyle(item)}">
                  <span></span><span></span><span></span>
                </span>
                <strong>${item.name}</strong>
                <small>${item.description}</small>
              </button>
            `
          )
          .join('')}
      </div>
      <div class="theme-modal-controls">
        <label>Theme selector${themeSelectMarkup(normalized.themeId)}</label>
        <div>
          <strong>Accent color</strong>
          <div class="accent-swatches">${accentSwatchesMarkup(normalized.accentId)}</div>
        </div>
        <div>
          <strong>Dark / Light mode</strong>
          ${modeToggleMarkup(normalized.mode)}
        </div>
        <div class="theme-current-card">
          <span class="theme-mini-preview" style="${themePreviewStyle(theme)}"></span>
          <div>
            <strong data-theme-current>${theme.name}</strong>
            <small>${accent.name} accent - ${normalized.mode === 'dark' ? 'Dark' : 'Light'} mode</small>
          </div>
        </div>
      </div>
      <div class="theme-actions">
        <button class="secondary" data-reset-theme>Reset to default</button>
      </div>
    </section>
  `;
}

function openThemeModal() {
  modal.classList.remove('hidden');
  modal.innerHTML = ThemeModal();
  document.getElementById('closeModal').addEventListener('click', closeModal);
  bindThemeControls(modal);
}

function updateThemeControls() {
  const { normalized, theme, accent } = resolveTheme(state.theme);
  document.querySelectorAll('.theme-select').forEach((select) => {
    select.value = normalized.themeId;
  });
  document.querySelectorAll('.theme-option').forEach((button) => {
    button.classList.toggle('selected', button.dataset.themeId === normalized.themeId);
  });
  document.querySelectorAll('.theme-mode-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === normalized.mode);
  });
  document.querySelectorAll('.accent-swatch').forEach((button) => {
    button.classList.toggle('active', button.dataset.accentId === normalized.accentId);
  });
  document.querySelectorAll('[data-theme-current]').forEach((node) => {
    node.textContent = theme.name;
  });
  document.querySelectorAll('.theme-current-card small').forEach((node) => {
    node.textContent = `${accent.name} accent - ${normalized.mode === 'dark' ? 'Dark' : 'Light'} mode`;
  });
}

function bindThemeControls(scope = document) {
  scope.querySelectorAll('[data-open-theme-modal]').forEach((button) => {
    button.addEventListener('click', openThemeModal);
  });
  scope.querySelectorAll('.settings-anchor[data-setting="Theme"]').forEach((button) => {
    button.addEventListener('click', openThemeModal);
  });
  scope.querySelectorAll('.theme-option').forEach((button) => {
    button.addEventListener('click', async () => {
      const theme = getTheme(button.dataset.themeId);
      await setThemePreference({ themeId: theme.id, accentId: theme.accentId, mode: theme.mode });
    });
  });
  scope.querySelectorAll('.theme-select').forEach((select) => {
    select.addEventListener('change', async (event) => {
      const theme = getTheme(event.target.value);
      await setThemePreference({ themeId: theme.id, accentId: theme.accentId, mode: theme.mode });
    });
  });
  scope.querySelectorAll('.accent-swatch').forEach((button) => {
    button.addEventListener('click', async () => {
      await setThemePreference({ accentId: button.dataset.accentId });
    });
  });
  scope.querySelectorAll('.theme-mode-button').forEach((button) => {
    button.addEventListener('click', async () => {
      await setThemePreference({ mode: button.dataset.mode });
    });
  });
  scope.querySelectorAll('[data-reset-theme]').forEach((button) => {
    button.addEventListener('click', async () => {
      await setThemePreference(defaultThemePreference);
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function uid() {
  return globalThis.crypto?.randomUUID?.() || `learnova-${Date.now()}-${Math.random()}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 2300);
}

function initials(name) {
  return String(name || 'Alex Student')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function updateProfileChip() {
  const profile = state.studentProfile;
  profileName.textContent = profile.name || 'Alex Student';
  profileGrade.textContent = profile.yearGroup || profile.grade || 10;
  if (profile.avatarDataUrl) {
    profileAvatar.innerHTML = `<img src="${profile.avatarDataUrl}" alt="">`;
    profileAvatar.classList.add('has-image');
  } else {
    profileAvatar.textContent = initials(profile.name);
    profileAvatar.classList.remove('has-image');
  }
}

function setRoute(route, options = {}) {
  activeRoute = route === 'home' ? 'dashboard' : route;
  if (options.syncHash !== false && location.hash !== `#${activeRoute}`) {
    history.replaceState(null, '', `#${activeRoute}`);
  }
  railNav.querySelectorAll('.rail-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.route === activeRoute);
  });
  const activeRouteDefinition = routes.find((route) => route.id === activeRoute);
  const moreTools = railNav.querySelector('.rail-more');
  if (moreTools && activeRouteDefinition?.group === 'more') moreTools.open = true;
  stage.style.animation = 'none';
  stage.offsetHeight;
  stage.style.animation = '';
  render();
}

function iconSvg(name) {
  const icons = {
    dashboard: '<rect x="3" y="3" width="7" height="7" rx="2"></rect><rect x="14" y="3" width="7" height="7" rx="2"></rect><rect x="3" y="14" width="7" height="7" rx="2"></rect><rect x="14" y="14" width="7" height="7" rx="2"></rect>',
    library: '<path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4V4Z"></path><path d="M5 16a4 4 0 0 1 4-4h10"></path>',
    capture: '<path d="M12 3v11"></path><path d="m7 9 5 5 5-5"></path><path d="M4 17h16v3H4z"></path>',
    assistant: '<path d="M5 6a6 6 0 0 1 6-3h2a6 6 0 0 1 6 6v3a6 6 0 0 1-6 6h-1l-5 3v-4a6 6 0 0 1-2-5V6Z"></path><path d="M9 10h.01M15 10h.01"></path>',
    quiz: '<path d="M7 4h10l3 3v13H7z"></path><path d="M10 11h7M10 15h5"></path><path d="m9 19 2 2 4-5"></path>',
    flashcards: '<rect x="4" y="7" width="13" height="13" rx="3"></rect><path d="M8 4h10a3 3 0 0 1 3 3v10"></path>',
    mastery: '<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="4"></circle><path d="M12 2v3M22 12h-3M12 22v-3M2 12h3"></path>',
    planner: '<rect x="4" y="5" width="16" height="15" rx="3"></rect><path d="M8 3v4M16 3v4M4 10h16"></path>',
    focus: '<path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z"></path><path d="M9 12l2 2 4-5"></path>',
    settings: '<circle cx="12" cy="12" r="3"></circle><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 3a7 7 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.7 1l.3 3h5l.3-3a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5c.1-.3.1-.7.1-1Z"></path>',
    profile: '<circle cx="12" cy="8" r="4"></circle><path d="M4.5 20c1.5-3.8 4-5.7 7.5-5.7s6 1.9 7.5 5.7"></path>',
    pricing: '<path d="M4 5h9l7 7-8 8-8-8V5Z"></path><circle cx="9" cy="10" r="1.5"></circle>',
    roadmap: '<path d="M5 18c3 0 3-12 6-12s3 12 8 12"></path><circle cx="5" cy="18" r="2"></circle><circle cx="11" cy="6" r="2"></circle><circle cx="19" cy="18" r="2"></circle>',
  };
  return `<svg class="rail-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.dashboard}</svg>`;
}

function routeButton(route) {
  return `
    <button class="rail-button" data-route="${route.id}" data-label="${route.label}" aria-label="${route.label}" title="${route.label}">
      ${iconSvg(route.icon)}
      <span class="rail-label">${route.label}</span>
    </button>
  `;
}

function renderRail() {
  const primary = routes.filter((route) => route.group === 'main');
  const more = routes.filter((route) => route.group === 'more');
  const moreOpen = more.some((route) => route.id === activeRoute) ? 'open' : '';
  railNav.innerHTML = `
    <p class="rail-section-label">Workspace</p>
    ${primary.map(routeButton).join('')}
    ${more.length ? `<details class="rail-more" ${moreOpen}><summary>More tools</summary><div>${more.map(routeButton).join('')}</div></details>` : ''}
  `;
  document.querySelectorAll('.route-link, .rail-button').forEach((button) => {
    button.addEventListener('click', () => setRoute(button.dataset.route));
  });
}

function bindRouteLinks(scope = document) {
  scope.querySelectorAll('.route-link').forEach((button) => {
    button.addEventListener('click', () => setRoute(button.dataset.route));
  });
}

function panel(content, className = '') {
  return `<section class="panel ${className}">${content}</section>`;
}

function mini(content, className = '') {
  return `<article class="mini-card interactive ${className}">${content}</article>`;
}

function weakestTopic() {
  return [...state.mastery].sort((a, b) => a.score - b.score)[0];
}

function masteryAverage() {
  return Math.round(state.mastery.reduce((sum, item) => sum + item.score, 0) / state.mastery.length);
}

function profileNextAction() {
  const weak = toList(state.studentProfile.weakTopics)[0] || `${weakestTopic().subject}: ${weakestTopic().topic}`;
  const style = toList(state.studentProfile.studyStyle)[0] || 'quiz';
  return `Start with ${weak}, then use ${style.toLowerCase()} for active recall.`;
}

function StudentContextCard() {
  const profile = state.studentProfile;
  return panel(`
    <div class="section-title">
      <div>
        <p class="eyebrow">Student context</p>
        <h2>${escapeHtml(profile.name || 'Student')}'s study profile</h2>
      </div>
      <span class="pill glow-pill">${escapeHtml(profile.curriculum || 'Curriculum')}</span>
    </div>
    <div class="context-grid">
      <div><strong>Current goal</strong><small>${escapeHtml(profile.targetGrades || toList(profile.goals)[0] || 'Build consistent progress')}</small></div>
      <div><strong>Weak topics</strong><small>${escapeHtml(toList(profile.weakTopics).slice(0, 3).join(', ') || 'No weak topics added yet')}</small></div>
      <div><strong>Upcoming tasks</strong><small>${escapeHtml(toList(profile.upcomingDeadlines).slice(0, 3).join(', ') || 'No deadlines added yet')}</small></div>
      <div><strong>Recommended next action</strong><small>${escapeHtml(profileNextAction())}</small></div>
    </div>
  `, 'student-context-panel');
}

function progressRow(item) {
  const label = item.score < 60 ? 'Focus now' : item.score < 75 ? 'Build next' : 'Keep warm';
  return `
    <div class="list-row">
      <div class="progress-shell" style="flex:1">
        <div class="row" style="justify-content:space-between">
          <strong>${escapeHtml(item.subject)}: ${escapeHtml(item.topic)}</strong>
          <span class="pill">${item.score}%</span>
        </div>
        <div class="progress-track"><div class="progress-bar" style="--value:${item.score}%"></div></div>
        <small>${label}</small>
      </div>
    </div>
  `;
}

function studySetTypeLabel(type = '') {
  const value = String(type).toLowerCase();
  if (value.includes('pdf')) return 'PDF';
  if (value.includes('word') || value.includes('docx')) return 'DOCX';
  if (value.includes('text') || value.includes('txt')) return 'TXT';
  if (value.includes('image')) return 'IMAGE';
  if (value.includes('slide')) return 'SLIDES';
  if (value.includes('chrome') || value.includes('web')) return 'WEB PAGE';
  return String(type || 'NOTES').toUpperCase();
}

function studySetEstimate(type = '') {
  const value = String(type).toLowerCase();
  if (value.includes('slide') || value.includes('pdf')) return '25 min';
  if (value.includes('web') || value.includes('chrome')) return '15 min';
  if (value.includes('image')) return '10 min';
  return '20 min';
}

function getStudySets() {
  const materials = state.materials.map((item, index) => ({
    id: `material-${index}`,
    title: item.title,
    subject: item.subject || 'General',
    type: studySetTypeLabel(item.type),
    topics: [item.topic || item.type || 'General review'],
    estimate: studySetEstimate(item.type),
    lastStudied: index === 0 ? 'Today' : index === 1 ? 'Yesterday' : 'This week',
    source: 'Saved material',
  }));
  const uploads = state.assistantUploads.map((item) => ({
    id: `upload-${item.id}`,
    title: item.name,
    subject: 'Uploaded material',
    type: studySetTypeLabel(item.type),
    topics: ['Ready for AI study context'],
    estimate: studySetEstimate(item.type),
    lastStudied: 'Just added',
    source: 'Uploaded file',
  }));
  const savedPages = state.savedPages.map((item, index) => ({
    id: `page-${item.id || index}`,
    title: item.title,
    subject: item.subject || 'General',
    type: 'WEB PAGE',
    topics: [item.topic || 'Saved page'],
    estimate: '15 min',
    lastStudied: item.savedAt ? 'Saved recently' : 'Saved from Chrome',
    source: 'Chrome capture',
  }));
  return [...uploads, ...materials, ...savedPages];
}

function findStudySet(id = activeStudySetId) {
  return getStudySets().find((item) => item.id === id) || getStudySets()[0];
}

function weakestMastery() {
  return [...(state.mastery || [])].sort((left, right) => left.score - right.score)[0] || {
    subject: 'Chemistry',
    topic: 'Moles',
    score: 42,
  };
}

function getCompanionStudySet() {
  if (activeRoute === 'studyset') return findStudySet(activeStudySetId);
  return findStudySet();
}

function openCompanionTutor(prompt = '', options = {}) {
  assistantDraft = prompt;
  setRoute('assistant');
  if (options.send) {
    requestAnimationFrame(() => sendChat(prompt));
  }
}

async function getCompanionSuggestion(context) {
  const storedProfile = await getProfile();
  state = normalizeState({
    ...state,
    studentProfile: storedProfile.profile,
    auth: storedProfile.auth,
  });
  applyProfileToDashboard();
  const studySetLabel = context.studySet?.title ? ` The student is viewing "${context.studySet.title}".` : '';
  const prompt = `You are Nova, Learnova's floating study companion. Give one concise, encouraging and specific study suggestion in 22 words or fewer. Do not use emojis, guilt, or a greeting. Current workspace: ${context.route}.${studySetLabel} Use the student profile, weak topics, upcoming tasks, uploaded study context, and available study time when useful.`;
  const orchestrator = globalThis.LearnovaAssistant.create(state.aiProvider);
  const response = await orchestrator.answer(
    prompt,
    injectProfileIntoAssistantContext({
      ...state,
      subjects,
      conversationHistory: [],
      profileDebug: profileDebugSummary(storedProfile.profile, storedProfile.profileLoaded),
      isDevelopment,
    })
  );
  return response.text;
}

function companionActionHandlers() {
  return {
    'start-quiz': async () => {
      const weak = weakestMastery();
      pendingQuiz = { subject: weak.subject, topic: weak.topic };
      setRoute('quiz');
      requestAnimationFrame(() => document.getElementById('generateQuiz')?.click());
      showToast(`Quick ${weak.topic} quiz ready.`);
    },
    'explain-weakest': async () => {
      const weak = weakestMastery();
      const prompt = state.auth.profileComplete && state.studentProfile.personalizationEnabled !== false
        ? `Explain my weakest topic, ${weak.subject}: ${weak.topic}, simply. Use a short example and finish with one question to check my understanding.`
        : 'Help me choose a topic to review, then explain it simply with a short example and one check question.';
      openCompanionTutor(prompt, { send: true });
    },
    'continue-set': async (context) => {
      const studySet = context.studySet || getCompanionStudySet();
      if (!studySet) {
        setRoute('library');
        showToast('Choose a study set to continue.');
        return;
      }
      activeStudySetId = studySet.id;
      setRoute('studyset');
      showToast(`Continuing ${studySet.title}.`);
    },
    'make-plan': async () => {
      const profile = state.studentProfile;
      const prompt = state.auth.profileComplete && profile.personalizationEnabled !== false
        ? `Make today's focused revision plan using my weak topics (${listText(profile.weakTopics)}), upcoming tasks (${listText(profile.upcomingDeadlines)}), and ${profile.dailyStudyTime || 'my available time'}. Give clear time blocks and one small first step.`
        : 'Help me make a focused revision plan for today. Ask which subjects and how much time I have, then give clear time blocks.';
      openCompanionTutor(prompt, { send: true });
    },
    flashcards: async (context) => {
      const studySet = context.studySet || getCompanionStudySet();
      if (studySet) {
        showToast(`Flashcard review opened for ${studySet.title}.`);
      }
      setRoute('flashcards');
    },
    'ask-tutor': async (context) => {
      const studySet = context.studySet || getCompanionStudySet();
      const draft = studySet
        ? `Help me choose the best next step for ${studySet.title}.`
        : state.auth.profileComplete && state.studentProfile.personalizationEnabled !== false
          ? 'Help me choose the best next study step based on my profile and current progress.'
          : 'Help me choose a useful next study step. Ask what I am studying first.';
      openCompanionTutor(draft);
    },
  };
}

function mountCompanion() {
  globalThis.LearnovaCompanion?.mount({
    getState: () => state,
    getRoute: () => activeRoute,
    getStudySet: getCompanionStudySet,
    requestSuggestion: getCompanionSuggestion,
    actionHandlers: companionActionHandlers(),
  });
}

function studySetActions(set) {
  return `
    <div class="study-set-actions" aria-label="Study set actions">
      <button data-study-action="summary" data-study-set="${escapeHtml(set.id)}">Summary</button>
      <button data-study-action="flashcards" data-study-set="${escapeHtml(set.id)}">Flashcards</button>
      <button data-study-action="quiz" data-study-set="${escapeHtml(set.id)}">Quiz</button>
      <button data-study-action="practice" data-study-set="${escapeHtml(set.id)}">Practice questions</button>
      <button data-study-action="ask" data-study-set="${escapeHtml(set.id)}">Ask AI</button>
    </div>
  `;
}

function studySetCard(set) {
  return `
    <article class="study-set-card">
      <div class="study-set-card-top">
        <span class="study-set-filetype">${escapeHtml(set.type)}</span>
        <span class="study-set-time">${escapeHtml(set.estimate)}</span>
      </div>
      <button class="study-set-title" data-open-study-set="${escapeHtml(set.id)}">${escapeHtml(set.title)}</button>
      <p class="study-set-subject">${escapeHtml(set.subject)}</p>
      <div class="study-set-topics">${set.topics.map((topic) => `<span>${escapeHtml(topic)}</span>`).join('')}</div>
      <div class="study-set-footer"><span>Last studied ${escapeHtml(set.lastStudied)}</span><button class="text-action" data-open-study-set="${escapeHtml(set.id)}">Open</button></div>
    </article>
  `;
}

function studySetListRow(set) {
  return `
    <article class="study-set-list-row">
      <span class="study-set-filetype">${escapeHtml(set.type)}</span>
      <div>
        <button class="study-set-title" data-open-study-set="${escapeHtml(set.id)}">${escapeHtml(set.title)}</button>
        <p>${escapeHtml(set.subject)} - ${escapeHtml(set.topics[0])}</p>
      </div>
      <span>${escapeHtml(set.estimate)}</span>
      <button class="text-action" data-open-study-set="${escapeHtml(set.id)}">Continue</button>
    </article>
  `;
}

function openStudySet(id) {
  activeStudySetId = id;
  setRoute('studyset');
}

function launchStudySetAction(id, action) {
  const set = findStudySet(id);
  if (!set) return;
  const topic = set.topics[0] || 'this study set';
  const assistantPrompts = {
    summary: `Summarize my study set "${set.title}" for ${set.subject}. Focus on ${topic}, then give me the three most important things to remember.`,
    ask: `Help me study "${set.title}" for ${set.subject}. I want a focused explanation of ${topic} based on my profile and attached study context.`,
  };
  if (assistantPrompts[action]) {
    assistantDraft = assistantPrompts[action];
    setRoute('assistant');
    return;
  }
  if (action === 'flashcards') {
    setRoute('flashcards');
    showToast(`Opening flashcards for ${set.title}.`);
    return;
  }
  pendingQuiz = { subject: set.subject, topic };
  setRoute('quiz');
  showToast(`${action === 'practice' ? 'Practice questions' : 'Quiz'} prepared for ${set.title}.`);
}

function bindStudySetActions(scope = document) {
  scope.querySelectorAll('[data-open-study-set]').forEach((button) => {
    button.addEventListener('click', () => openStudySet(button.dataset.openStudySet));
  });
  scope.querySelectorAll('[data-study-action]').forEach((button) => {
    button.addEventListener('click', () => launchStudySetAction(button.dataset.studySet, button.dataset.studyAction));
  });
}

function focusModeCopy(mode) {
  return {
    privacy: ['Privacy Mode', 'No browsing activity tracked. Focus Coach stays available but passive.'],
    balanced: ['Balanced Mode', 'Default. Track only selected distracting websites.'],
    smart: ['Smart Study Mode', 'Track all websites locally to improve study recommendations and focus analytics.'],
  }[mode];
}

function mostDistractingSite() {
  const entries = Object.entries(state.focus.analytics.byDomain || {});
  if (!entries.length) return ['youtube.com', 0];
  return entries.sort((a, b) => b[1] - a[1])[0];
}

function averageFocusSession() {
  const sessions = state.focus.analytics.focusSessions || [];
  if (!sessions.length) return 0;
  return Math.round(sessions.reduce((sum, value) => sum + value, 0) / sessions.length);
}

function chartBars(values, labelPrefix = 'Day') {
  const max = Math.max(...values, 1);
  return `
    <div class="bar-chart">
      ${values
        .map(
          (value, index) => `
            <div class="bar-wrap">
              <div class="bar" style="--height:${Math.max(8, Math.round((value / max) * 100))}%"></div>
              <small>${labelPrefix} ${index + 1}</small>
            </div>
          `
        )
        .join('')}
    </div>
  `;
}

function toggleMarkup(checked, id, label = '') {
  return `
    <button class="switch ${checked ? 'on' : ''}" id="${id}" type="button" aria-pressed="${checked}">
      <span></span>
    </button>
    ${label ? `<strong>${label}</strong>` : ''}
  `;
}

function minutesOptions(selected, includeCustom = true) {
  const options = [5, 10, 15, 20, 30, 45, 60];
  return `
    ${options.map((value) => `<option value="${value}" ${Number(selected) === value ? 'selected' : ''}>${value} min</option>`).join('')}
    ${includeCustom ? `<option value="custom" ${!options.includes(Number(selected)) ? 'selected' : ''}>Custom</option>` : ''}
  `;
}

function normalizeDomain(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];
}

function renderInsights() {
  insightPanel.innerHTML = '';
}

function homeStudyAction({ label, detail, route, icon, prompt = '' }) {
  const assistantAttribute = prompt ? `data-home-assistant="${escapeHtml(prompt)}"` : '';
  const routeAttribute = route ? `data-route="${route}"` : '';
  const classes = route ? 'route-link' : 'home-assistant-action';
  return `
    <button class="home-study-action ${classes}" ${routeAttribute} ${assistantAttribute}>
      <span class="home-action-icon">${iconSvg(icon)}</span>
      <span><strong>${label}</strong><small>${detail}</small></span>
      <span class="home-action-arrow" aria-hidden="true">+</span>
    </button>
  `;
}

function bindHomeActions(scope = document) {
  scope.querySelectorAll('[data-home-assistant]').forEach((button) => {
    button.addEventListener('click', () => {
      assistantDraft = button.dataset.homeAssistant;
      setRoute('assistant');
    });
  });
}

function renderHome() {
  const weak = weakestTopic();
  const profile = state.studentProfile;
  const firstName = (profile.name || 'Student').split(' ')[0];
  const sets = getStudySets();
  const continueSet = sets[0];
  const nextDeadline = toList(profile.upcomingDeadlines)[0] || 'No deadline added yet';
  const priorityTopic = toList(profile.weakTopics)[0] || `${weak.subject}: ${weak.topic}`;
  stage.innerHTML = `
    <section class="home-stage">
      <div class="home-stage-copy">
        <p class="home-greeting"><span></span>${escapeHtml(firstName)}'s study space</p>
        <h1>What do you want to study today?</h1>
        <p class="home-stage-subtitle">Learnova has a focused next step ready for your ${escapeHtml(profile.curriculum || 'coursework')}.</p>
        <div class="home-stage-meta"><span>${escapeHtml(profile.yearGroup || `Year ${profile.grade}`)}</span><span>${escapeHtml(profile.curriculum || 'Curriculum')}</span><span>Next: ${escapeHtml(nextDeadline)}</span></div>
      </div>
      <div class="home-study-art" aria-hidden="true">
        <div class="home-art-orbit orbit-one"></div>
        <div class="home-art-orbit orbit-two"></div>
        <div class="home-art-paper paper-one"><span></span><span></span><span></span></div>
        <div class="home-art-paper paper-two"><span></span><span></span></div>
        <div class="home-art-badge"><small>Focus topic</small><strong>${escapeHtml(weak.topic)}</strong><span>${weak.score}% ready</span></div>
        <div class="home-art-marker"></div>
      </div>
    </section>

    <section class="home-intent-grid" aria-label="Choose a study action">
      ${(() => {
        const actions = [
          { label: 'Continue studying', detail: continueSet ? continueSet.title : 'Pick up a study set', icon: 'library', route: continueSet ? 'studyset' : 'library' },
          { label: 'Upload notes', detail: 'Make a new study set', icon: 'capture', route: 'capture' },
          { label: 'Generate flashcards', detail: 'Quick active recall', icon: 'flashcards', route: 'flashcards' },
          { label: 'Practice quiz', detail: `${weak.topic} is ready`, icon: 'quiz', route: 'quiz' },
          { label: 'Ask Learnova', detail: 'Get a study recommendation', icon: 'assistant', prompt: `What should I study today? Use my weak topics, next deadline (${nextDeadline}), available study time, and preferred study style.` },
        ];
        return actions.map(homeStudyAction).join('');
      })()}
    </section>

    <section class="home-flow-layout">
      <section class="home-session-flow">
        <div class="home-section-heading"><div><p>Recommended next</p><h2>One small study session</h2></div><span>${escapeHtml(profile.dailyStudyTime || '45 min')} available</span></div>
        <button class="home-session-main route-link" data-route="quiz">
          <span class="home-session-index">01</span>
          <span class="home-session-content"><small>Start here</small><strong>${escapeHtml(priorityTopic)}</strong><em>10 min quiz, then a focused correction pass</em></span>
          <span class="home-session-play" aria-hidden="true">Start</span>
        </button>
        <div class="home-session-steps">
          ${planner.slice(1, 3).map((item, index) => `<button class="route-link" data-route="${index === 0 ? 'flashcards' : 'planner'}"><span>0${index + 2}</span><strong>${escapeHtml(item.task)}</strong><small>${escapeHtml(item.detail)}</small></button>`).join('')}
        </div>
      </section>
      <aside class="home-ai-note">
        <div class="home-ai-note-icon">${assistantAiIcon()}</div>
        <p>Learnova's suggestion</p>
        <h3>Build confidence in ${escapeHtml(weak.topic)} before you move on.</h3>
        <button class="home-assistant-action" data-home-assistant="${escapeHtml(`Explain ${priorityTopic} using a simple everyday example, then give me one quick question to check my understanding.`)}">Ask for an explanation</button>
      </aside>
    </section>

    <section class="home-materials-layout">
      <section class="home-materials">
        <div class="home-section-heading"><div><p>Continue from your materials</p><h2>Study sets in motion</h2></div><button class="text-action route-link" data-route="library">View all</button></div>
        <div class="home-materials-row">
          ${sets.slice(0, 3).map((set, index) => `
            <button class="home-material-preview" data-open-study-set="${escapeHtml(set.id)}">
              <span class="home-document-thumb thumb-${index + 1}"><i></i><i></i><i></i></span>
              <span><small>${escapeHtml(set.type)} - ${escapeHtml(set.estimate)}</small><strong>${escapeHtml(set.title)}</strong><em>${escapeHtml(set.topics[0])}</em></span>
            </button>
          `).join('')}
        </div>
      </section>
      <aside class="home-progress-field">
        <div><p>Progress</p><strong>${masteryAverage()}%</strong><span>mastery</span></div>
        <div class="home-progress-graphic"><i style="--dot:42%"></i><i style="--dot:68%"></i><i style="--dot:82%"></i><i style="--dot:74%"></i><i style="--dot:71%"></i></div>
        <button class="text-action route-link" data-route="mastery">See your progress</button>
      </aside>
    </section>
  `;
}

function renderLibrary() {
  const sets = getStudySets();
  stage.innerHTML = `
    <section class="page-intro study-sets-intro">
      <div><p class="page-kicker">Study sets</p><h1>Your materials, ready to study.</h1><p>Every note, upload, and saved page becomes a clear starting point for active study.</p></div>
      <button class="primary route-link" data-route="capture">Add study material</button>
    </section>
    <section class="study-set-grid">
      ${sets.length ? sets.map(studySetCard).join('') : '<div class="empty-state study-set-empty"><h2>Start your first study set</h2><p>Upload notes, save a webpage, or add a material from Learnova.</p><button class="primary route-link" data-route="capture">Add study material</button></div>'}
    </section>
  `;
}

function renderStudySet() {
  const set = findStudySet();
  if (!set) {
    setRoute('library');
    return;
  }
  activeStudySetId = set.id;
  stage.innerHTML = `
    <section class="study-set-detail-header">
      <button class="back-link route-link" data-route="library">Back to study sets</button>
      <div class="study-set-detail-title">
        <span class="study-set-filetype">${escapeHtml(set.type)}</span>
        <h1>${escapeHtml(set.title)}</h1>
        <p>${escapeHtml(set.subject)} - ${escapeHtml(set.source)}</p>
      </div>
      <div class="study-set-detail-meta"><span>${escapeHtml(set.estimate)} study time</span><span>Last studied ${escapeHtml(set.lastStudied)}</span></div>
    </section>
    <section class="study-set-detail-workspace">
      <div>
        <p class="page-kicker">Key topics</p>
        <div class="study-set-topics">${set.topics.map((topic) => `<span>${escapeHtml(topic)}</span>`).join('')}</div>
        <p class="study-set-detail-copy">Choose a study mode to turn this material into an active session. Learnova will use the set alongside your saved profile and any attached context.</p>
      </div>
      ${studySetActions(set)}
    </section>
  `;
}

function renderCapture() {
  const saved = state.savedPages.length
    ? state.savedPages.map(savedPageRow).join('')
    : '<p class="muted">Save a study page from the popup and it will appear here.</p>';

  stage.innerHTML = `
    <section class="grid grid-2">
      ${panel(`
        <p class="eyebrow">Material capture</p>
        <h2>Upload demo</h2>
        <p class="muted">This creates a mock parsed result. No files are read or sent anywhere.</p>
        <div class="form-grid">
          <label class="wide">Pretend filename<input id="fakeFile" placeholder="Chemistry moles notes.pdf"></label>
          <label>Subject<select id="uploadSubject">${Object.keys(subjects).map((subject) => `<option>${subject}</option>`).join('')}</select></label>
          <label>Material type<select id="uploadType"><option>PDF</option><option>Slides</option><option>Notes</option><option>Study guide</option></select></label>
        </div>
        <div class="button-row" style="margin-top:16px">
          <button id="mockUpload" class="primary">Generate study layer</button>
          <button class="secondary route-link" data-route="assistant">Ask about notes</button>
        </div>
      `)}
      ${panel(`
        <p class="eyebrow">Generated layer</p>
        <div id="uploadResult" class="prompt-card">
          <h2>Ready to transform material.</h2>
          <p class="muted">The wow moment here is instant structure: summary, key terms, quiz ideas, and topic tagging.</p>
        </div>
      `)}
    </section>
    <section class="grid grid-2">
      ${panel(`<div class="section-title"><div><p class="eyebrow">Library</p><h2>Saved materials</h2></div><span class="pill">${state.materials.length}</span></div>${state.materials.map(materialRow).join('')}`)}
      ${panel(`<div class="section-title"><div><p class="eyebrow">Chrome</p><h2>Saved pages</h2></div><span class="pill">${state.savedPages.length}</span></div>${saved}`)}
    </section>
  `;

  document.getElementById('mockUpload').addEventListener('click', mockUpload);
}

function materialRow(item) {
  return `<div class="list-row"><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.subject)} - ${escapeHtml(item.topic || item.type)}</small></div><span class="pill">${escapeHtml(item.type)}</span></div>`;
}

function savedPageRow(item) {
  return `<div class="list-row"><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.subject)} - ${escapeHtml(item.topic)} - ${escapeHtml(item.action || 'Saved from Chrome')}</small></div><span class="pill">Chrome</span></div>`;
}

async function mockUpload() {
  const subject = document.getElementById('uploadSubject').value;
  const type = document.getElementById('uploadType').value;
  const title = document.getElementById('fakeFile').value || `${subject} study material`;
  const topic = subjects[subject][0];
  const material = { title, subject, type, topic };
  await storage.set({ ...state, materials: [material, ...state.materials] });

  document.getElementById('uploadResult').innerHTML = `
    <p class="eyebrow">Generated from your study material</p>
    <h2>${escapeHtml(subject)}: ${escapeHtml(topic)}</h2>
    <div class="grid">
      <div class="list-row"><div><strong>Summary</strong><small>Core definitions, formulas, and exam mistakes extracted into a clean revision view.</small></div></div>
      <div class="list-row"><div><strong>Key terms</strong><small>${escapeHtml(topic)}, formula, method, worked example, exam command word.</small></div></div>
      <div class="list-row"><div><strong>Quiz seeds</strong><small>Define ${escapeHtml(topic)}. Apply it to a problem. Explain one common mistake.</small></div></div>
    </div>
  `;
  showToast('Study layer generated from mock material.');
}

function renderAssistant() {
  const profile = state.studentProfile;
  const firstName = (profile.name || 'Student').split(' ')[0];
  const personalizationActive = Boolean(state.auth.profileComplete && profile.personalizationEnabled !== false);
  const profileWeak = toList(profile.weakTopics)[0] || `${weakestTopic().subject}: ${weakestTopic().topic}`;
  const prompts = personalizationActive
    ? [
        { label: 'Explain my weakest topic', prompt: `Explain my weakest topic, ${profileWeak}, in a simple ${profile.curriculum || 'high school'} style. Use my profile, goals, and preferred study style.` },
        { label: 'Quiz me on weak topics', prompt: `Quiz me on my weak topics: ${listText(profile.weakTopics)}. Make it targeted to my ${profile.curriculum || 'curriculum'} and target grades of ${profile.targetGrades || 'my goals'}.` },
        { label: 'Make flashcards from my notes', prompt: 'Make flashcards from my uploaded notes and saved study materials. Prioritize my weak topics and keep them concise.' },
        { label: "Create today's revision plan", prompt: `Create today's revision plan using my upcoming tasks (${listText(profile.upcomingDeadlines)}) and weak topics (${listText(profile.weakTopics)}). Fit it into ${profile.dailyStudyTime || 'my available study time'}.` },
        { label: 'Summarize uploaded materials', prompt: 'Summarize my uploaded materials and turn the key ideas into a short study plan, quiz topics, and flashcard ideas.' },
      ]
    : [
        { label: 'Explain a topic', prompt: 'Help me understand a topic I am studying. Ask which topic, then explain it simply.' },
        { label: 'Quiz me', prompt: 'Give me a short quiz. Ask which subject and level I want first.' },
        { label: 'Make flashcards from my notes', prompt: 'Make concise flashcards from my uploaded notes and saved study materials.' },
        { label: "Create today's revision plan", prompt: 'Help me create a revision plan for today. Ask which subjects and how much time I have.' },
        { label: 'Summarize uploaded materials', prompt: 'Summarize my uploaded materials and identify the most important study points.' },
      ];
  const provider = globalThis.LearnovaAssistant?.providers?.[state.aiProvider] || globalThis.LearnovaAssistant?.providers?.mock;
  const weak = weakestTopic();
  const contextSignals = [
    ['Using your notes', `${state.materials.length + state.savedPages.length} saved sources available`],
    ...(personalizationActive
      ? [
          ['Student profile', `${state.studentProfile.yearGroup || `Grade ${state.studentProfile.grade}`}, ${state.studentProfile.curriculum}`],
          ['Weak topics', toList(state.studentProfile.weakTopics).slice(0, 2).join(', ') || `${weak.subject}: ${weak.topic} (${weak.score}%)`],
        ]
      : []),
    ['Current webpage', state.browserContext.title || 'No page captured yet'],
  ];
  stage.innerHTML = `
    <section class="assistant-home-panel assistant-intro">
      <div class="assistant-intro-heading">
        <div class="assistant-home-copy">
          <p class="eyebrow">Learnova Assistant</p>
          <h1>Hi ${escapeHtml(firstName)}</h1>
          <p class="assistant-subtitle">What would you like help with today?</p>
        </div>
        <div class="assistant-intro-status"><span></span>Ready to study with you</div>
      </div>
      <div class="assistant-quick-grid">${prompts.map((prompt) => (typeof prompt === 'string' ? `<button class="assistant-action prompt">${prompt}</button>` : `<button class="assistant-action prompt" data-prompt="${escapeHtml(prompt.prompt)}">${escapeHtml(prompt.label)}</button>`)).join('')}</div>
    </section>

    <section class="assistant-chat-surface">
      <header class="chat-surface-header">
        <div class="chat-thread-identity">
          <span class="learnova-ai-avatar" aria-hidden="true">${assistantAiIcon()}</span>
          <div>
            <p class="eyebrow">Your study conversation</p>
            <h2>Learnova AI</h2>
            <p>Ask a question, attach notes, or start with one small next step.</p>
          </div>
        </div>
        <details class="study-context-disclosure">
          <summary><span>Study context</span><small>${contextSignals.length} signals active</small></summary>
          <div class="context-check-list">
            ${contextSignals
              .map(([title, copy]) => `<div class="context-check"><span>check</span><div><strong>${title}</strong><small>${copy}</small></div></div>`)
              .join('')}
          </div>
        </details>
      </header>
      ${profilePersonalizationIndicator()}
      <div id="chatAttachedFiles" class="chat-attached-files">${ChatAttachedFiles()}</div>
      <div id="chat" class="chat-window">
        <div class="message assistant welcome-message">${assistantWelcomeMarkup(firstName)}</div>
      </div>
      <div class="chat-composer-wrap">
        <div class="chat-composer-meta">${StudyContextIndicator()}</div>
        <form id="chatComposer" class="chat-composer">
          <button type="button" data-open-context class="attach-context-button compact" aria-label="Add study context">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>
          </button>
          <textarea id="chatInput" rows="1" placeholder="Ask Learnova about your studies..." aria-label="Ask Learnova about your studies"></textarea>
          <button type="submit" id="sendChat" class="primary chat-send-button">Send</button>
        </form>
        <p class="chat-composer-hint">Press Enter to send. Shift + Enter adds a new line.</p>
      </div>
    </section>
    <details class="assistant-debug">
        <summary>Developer debug</summary>
        <div class="advanced-grid">
          <div>
            <p class="eyebrow">Provider</p>
            <h2>${provider?.label || 'Local Mock Provider'}</h2>
            <p class="muted">Production providers can implement the same adapter interface for GPT, Claude, Gemini, or another model.</p>
          </div>
          <div class="provider-grid">
            ${['Learnova AI service', 'Claude provider', 'Gemini provider', 'Local mock provider']
              .map((item) => `<div class="provider-card"><strong>${item}</strong><small>Swappable adapter</small></div>`)
              .join('')}
          </div>
        </div>
    </details>
  `;

  bindPromptButtons(document);
  bindContextButtons(document);
  document.getElementById('chatComposer').addEventListener('submit', (event) => {
    event.preventDefault();
    sendChat(document.getElementById('chatInput').value);
  });
  document.getElementById('chatInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendChat(event.currentTarget.value);
    }
  });
  if (assistantDraft) {
    const input = document.getElementById('chatInput');
    input.value = assistantDraft;
    assistantDraft = '';
    input.focus();
  }
}

function bindPromptButtons(scope = document) {
  scope.querySelectorAll('.prompt').forEach((button) => {
    button.addEventListener('click', () => sendChat(button.dataset.prompt || button.textContent));
  });
  bindAssistantResponseActions(scope);
}

function bindContextButtons(scope = document) {
  scope.querySelectorAll('[data-open-context]').forEach((button) => {
    button.addEventListener('click', openUploadContextModal);
  });
}

function bindAssistantResponseActions(scope = document) {
  scope.querySelectorAll('[data-copy-response]').forEach((button) => {
    button.addEventListener('click', async () => {
      const answer = button.closest('.message')?.querySelector('.assistant-answer')?.innerText?.trim();
      if (!answer) return;
      try {
        await navigator.clipboard.writeText(answer);
        showToast('Response copied.');
      } catch {
        showToast('Copy is unavailable here. Select the response to copy it.');
      }
    });
  });
}

function StudyContextIndicator() {
  const count = state.assistantUploads.length;
  if (!count) {
    return `
      <div class="study-context-indicator muted-state">
        <span></span>
        <strong>No extra files attached</strong>
        <small>Add notes, PDFs, docs, or images for more specific help.</small>
      </div>
    `;
  }
  const latest = state.assistantUploads[0];
  return `
    <div class="study-context-indicator">
      <span></span>
      <strong>Context attached</strong>
      <small>${count} file${count === 1 ? '' : 's'} ready - latest: ${escapeHtml(latest.name)}</small>
    </div>
  `;
}

function assistantAiIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5 14 9l5.5 2-5.5 2L12 18.5 10 13l-5.5-2L10 9l2-5.5Z"></path>
      <path d="m18.5 16 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"></path>
    </svg>
  `;
}

function attachmentTypeLabel(file) {
  const type = String(file.type || '').toLowerCase();
  if (type.includes('pdf')) return 'PDF';
  if (type.includes('word') || type.includes('docx')) return 'DOCX';
  if (type.includes('text') || type.includes('txt')) return 'TXT';
  if (type.includes('image')) return 'IMAGE';
  return type.split('/').pop()?.toUpperCase() || 'FILE';
}

function ChatAttachedFiles() {
  const files = state.assistantUploads;
  if (!files.length) {
    return `
      <div class="attached-files-empty">
        <span class="attached-files-icon" aria-hidden="true">+</span>
        <div><strong>No files attached</strong><small>Add notes or a worksheet for more specific help.</small></div>
      </div>
      <button type="button" data-open-context class="attached-files-add">Add study material</button>
    `;
  }
  const visibleFiles = files.slice(0, 3);
  const remaining = files.length - visibleFiles.length;
  return `
    <div class="attached-files-label">
      <span class="attached-files-icon" aria-hidden="true">${files.length}</span>
      <div><strong>Attached study context</strong><small>Learnova can reference these in your next response.</small></div>
    </div>
    <div class="attached-file-chips">
      ${visibleFiles
        .map((file) => `<span class="attached-file-chip" title="${escapeHtml(file.name)}"><b>${attachmentTypeLabel(file)}</b>${escapeHtml(file.name)}</span>`)
        .join('')}
      ${remaining > 0 ? `<span class="attached-file-more">+${remaining} more</span>` : ''}
    </div>
    <button type="button" data-open-context class="attached-files-add">Manage</button>
  `;
}

function assistantQuickActions() {
  const actions = [
    { label: 'Copy', action: 'copy' },
    { label: 'Make Flashcards', prompt: 'Turn your previous Learnova response into concise flashcards I can review. Keep them targeted to the topic we just discussed.' },
    { label: 'Quiz Me', prompt: 'Quiz me on the topic from your previous response. Ask one question at a time and wait for my answer.' },
    { label: 'Summarize', prompt: 'Summarize your previous response into a five-bullet revision sheet with the most important exam-ready points.' },
    { label: 'Explain Simpler', prompt: 'Explain your previous response more simply. Use an everyday analogy and one clear exam-ready example.' },
  ];
  return `
    <div class="assistant-response-actions" aria-label="Response actions">
      ${actions
        .map((action) =>
          action.action === 'copy'
            ? `<button type="button" class="assistant-response-action copy-action" data-copy-response>${action.label}</button>`
            : `<button type="button" class="assistant-response-action prompt" data-prompt="${escapeHtml(action.prompt)}">${action.label}</button>`
        )
        .join('')}
    </div>
  `;
}

function profilePersonalizationIndicator() {
  if (!state.auth.profileComplete || state.studentProfile.personalizationEnabled === false) return '';
  return `
    <div class="profile-personalization-pill" role="status">
      <span aria-hidden="true"></span>
      <span>Personalized using your academic profile</span>
      <button type="button" class="profile-view-link route-link" data-route="profile">View profile</button>
    </div>
  `;
}

function assistantWelcomeMarkup(firstName) {
  return assistantMessageMarkup({
    text: `Hi ${firstName}. I am ready to help with explanations, quizzes, revision plans, flashcards, essay feedback, and study advice. Tell me what you are working on, or use a quick action above.`,
  });
}

function assistantMessageMarkup({ text, response = null }) {
  const profileDebug = response?.contextBundle?.profileDebug;
  return `
    <div class="assistant-message-header">
      <span class="learnova-ai-avatar" aria-hidden="true">${assistantAiIcon()}</span>
      <div>
        <strong>Learnova AI</strong>
        <span>Study response</span>
      </div>
    </div>
    <div class="assistant-answer">${escapeHtml(text).replace(/\n/g, '<br>')}</div>
    ${assistantQuickActions()}
    ${
      response
        ? `
          <details class="orchestration-context">
            <summary><span>View orchestration context</span><small>${response.pipeline.length} sources checked</small></summary>
            <div class="source-strip">
              ${response.pipeline
                .map(
                  (step) => `
                    <div class="source-card">
                      <strong>${escapeHtml(step.label)}</strong>
                      <small>${step.count} retrieved - ${escapeHtml(step.top)}</small>
                    </div>
                  `
                )
                .join('')}
            </div>
            <div class="evidence-list">
              ${response.evidence
                .slice(0, 6)
                .map(
                  (item) => `
                    <div class="evidence-item">
                      <strong>${escapeHtml(item.sourceLabel)} - ${escapeHtml(item.title)}</strong>
                      <small>${escapeHtml(item.snippet)}</small>
                    </div>
                  `
                )
                .join('')}
            </div>
            <p class="muted">Provider: ${escapeHtml(response.provider.label)} (${escapeHtml(response.model)})</p>
          </details>
          ${
            response.contextBundle?.isDevelopment && profileDebug
              ? `<details class="profile-debug-details">
                  <summary>Profile debug</summary>
                  <div class="profile-debug-grid">
                    <span>profile loaded: ${profileDebug.profileLoaded ? 'true' : 'false'}</span>
                    <span>curriculum: ${escapeHtml(profileDebug.curriculum)}</span>
                    <span>subjects: ${profileDebug.subjectCount}</span>
                    <span>weak topics: ${profileDebug.weakTopicsCount}</span>
                  </div>
                </details>`
              : ''
          }
        `
        : ''
    }
  `;
}

function ConnectedSources() {
  const sources = [
    ['Connect Google Drive', 'Connect notes, PDFs, and slides from Drive.'],
    ['Connect Google Calendar', 'Use study blocks, deadlines, and exam dates.'],
    ['Connect Notion', 'Bring in class pages, checklists, and revision notes.'],
  ];
  return `
    <div class="connected-sources">
      ${sources
        .map(
          ([title, copy]) => `
            <div class="connector-card disabled">
              <div>
                <strong>${title}</strong>
                <small>${copy}</small>
              </div>
              <button disabled>Coming soon</button>
            </div>
          `
        )
        .join('')}
    </div>
  `;
}

function UploadedFileList() {
  if (!state.assistantUploads.length) {
    return `
      <div class="empty-upload-list">
        <strong>No uploaded files yet.</strong>
        <small>Attach class notes, PDFs, worksheets, screenshots, or essay drafts.</small>
      </div>
    `;
  }
  return `
    <div class="uploaded-file-list">
      ${state.assistantUploads
        .map(
          (file) => `
            <div class="uploaded-file-row" data-id="${file.id}">
              <div>
                <strong>${escapeHtml(file.name)}</strong>
                <small>${escapeHtml(file.type || 'Unknown file')} - ${escapeHtml(file.status)}</small>
              </div>
              <button class="remove-upload" data-id="${file.id}">Remove</button>
            </div>
          `
        )
        .join('')}
    </div>
  `;
}

function UploadContextModal() {
  return `
    <section class="modal-card upload-context-modal">
      <div class="section-title">
        <div>
          <p class="eyebrow">Study context</p>
          <h2>Add study context</h2>
          <p class="muted">Attach local files now, or connect learning sources later. Nothing is uploaded to a server in this prototype.</p>
        </div>
        <button id="closeModal" class="secondary">Close</button>
      </div>
      <div class="grid grid-2">
        <section class="upload-drop-zone">
          <input id="studyFileInput" type="file" multiple accept=".pdf,.docx,.txt,image/*">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>
          <h3>Upload files</h3>
          <p class="muted">PDF, DOCX, TXT, PNG, JPG, and other image files.</p>
          <button id="chooseStudyFiles" class="primary">Choose files</button>
        </section>
        <section>
          <p class="eyebrow">Connect sources</p>
          ${ConnectedSources()}
        </section>
      </div>
      <section class="upload-list-panel">
        <div class="section-title">
          <div>
            <p class="eyebrow">Attached files</p>
            <h3>${state.assistantUploads.length} file${state.assistantUploads.length === 1 ? '' : 's'} available to Learnova</h3>
          </div>
        </div>
        <div id="uploadedFileList">${UploadedFileList()}</div>
      </section>
    </section>
  `;
}

function openUploadContextModal() {
  modal.classList.remove('hidden');
  modal.innerHTML = UploadContextModal();
  bindUploadContextModal();
}

function bindUploadContextModal() {
  document.getElementById('closeModal').addEventListener('click', closeModal);
  const input = document.getElementById('studyFileInput');
  document.getElementById('chooseStudyFiles').addEventListener('click', () => input.click());
  input.addEventListener('change', handleStudyFiles);
  bindUploadedFileList();
}

function bindUploadedFileList() {
  document.querySelectorAll('.remove-upload').forEach((button) => {
    button.addEventListener('click', async () => {
      const uploads = state.assistantUploads.filter((file) => file.id !== button.dataset.id);
      await storage.set({ ...state, assistantUploads: uploads });
      document.getElementById('uploadedFileList').innerHTML = UploadedFileList();
      bindUploadedFileList();
      refreshStudyContextIndicators();
      showToast('File removed from study context.');
    });
  });
}

async function handleStudyFiles(event) {
  const files = [...event.target.files];
  if (!files.length) return;
  const maxFileSize = 10 * 1024 * 1024;
  const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  const oversized = files.filter((file) => file.size > maxFileSize);
  const uploads = files
    .filter((file) => file.size <= maxFileSize && (allowed.includes(file.type) || file.type.startsWith('image/')))
    .map((file) => ({
      id: uid(),
      name: file.name,
      type: file.type || file.name.split('.').pop().toUpperCase(),
      size: file.size,
      status: 'Ready for prototype context',
      addedAt: new Date().toISOString(),
    }));

  if (!uploads.length) {
    showToast(oversized.length ? 'Files must be 10 MB or smaller.' : 'Supported files: PDF, DOCX, TXT, and images.');
    return;
  }
  await storage.set({ ...state, assistantUploads: [...uploads, ...state.assistantUploads] });
  document.getElementById('uploadedFileList').innerHTML = UploadedFileList();
  bindUploadedFileList();
  refreshStudyContextIndicators();
  showUploadCompletion();
  showToast(`${uploads.length} file${uploads.length === 1 ? '' : 's'} attached to Learnova.`);
}

function refreshStudyContextIndicators() {
  document.querySelectorAll('.study-context-indicator').forEach((indicator) => {
    indicator.outerHTML = StudyContextIndicator();
  });
  const attachedFiles = document.getElementById('chatAttachedFiles');
  if (attachedFiles) {
    attachedFiles.innerHTML = ChatAttachedFiles();
    bindContextButtons(attachedFiles);
  }
}

function showUploadCompletion() {
  document.querySelectorAll('.chat-attached-files, .study-context-indicator').forEach((element) => {
    element.classList.remove('upload-complete');
    requestAnimationFrame(() => element.classList.add('upload-complete'));
  });
}

async function sendChat(prompt) {
  const clean = prompt.trim();
  if (!clean) return;
  const chat = document.getElementById('chat');
  chat.insertAdjacentHTML('beforeend', `<div class="message user"><span class="user-message-text">${escapeHtml(clean)}</span></div>`);
  const chatInput = document.getElementById('chatInput');
  if (chatInput) chatInput.value = '';
  const conversationHistory = [...chat.querySelectorAll('.message')]
    .slice(-12)
    .map((message) => {
      const isUser = message.classList.contains('user');
      return {
        role: isUser ? 'user' : 'assistant',
        content: (isUser ? message.querySelector('.user-message-text') : message.querySelector('.assistant-answer'))?.textContent.trim() || '',
      };
    })
    .filter((message) => message.content);

  const typing = document.createElement('div');
  typing.className = 'message assistant loading-message';
  typing.textContent = state.auth.profileComplete && state.studentProfile.personalizationEnabled !== false
    ? 'Checking your study context and academic profile...'
    : 'Preparing your study response...';
  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;

  try {
    const storedProfile = await getProfile();
    state = normalizeState({
      ...state,
      studentProfile: storedProfile.profile,
      auth: storedProfile.auth,
    });
    applyProfileToDashboard();
    const profileDebug = profileDebugSummary(storedProfile.profile, storedProfile.profileLoaded);
    const orchestrator = globalThis.LearnovaAssistant.create(state.aiProvider);
    const response = await orchestrator.answer(
      clean,
      injectProfileIntoAssistantContext({
        ...state,
        subjects,
        conversationHistory,
        profileDebug,
        isDevelopment,
      })
    );
    typing.classList.remove('loading-message');
    typing.innerHTML = assistantResponseMarkup(response);
    bindPromptButtons(typing);
    chat.scrollTop = chat.scrollHeight;
  } catch (error) {
    typing.classList.remove('loading-message');
    typing.classList.add('error-message');
    typing.textContent = error.message || 'Learnova could not complete the AI request. Please try again.';
    chat.scrollTop = chat.scrollHeight;
  }
}

function assistantResponseMarkup(response) {
  return assistantMessageMarkup({ text: response.text, response });
}

function renderQuiz() {
  stage.innerHTML = `
    <section class="grid grid-2">
      ${panel(`
        <p class="eyebrow">Quiz Studio</p>
        <h2>Generate focused practice.</h2>
        <div class="form-grid">
          <label>Subject<select id="quizSubject">${Object.keys(subjects).map((subject) => `<option>${subject}</option>`).join('')}</select></label>
          <label>Topic<select id="quizTopic"></select></label>
          <label>Difficulty<select id="quizDifficulty"><option>Easy</option><option selected>Medium</option><option>Hard</option></select></label>
          <label>Questions<input id="quizCount" type="number" min="2" max="4" value="4"></label>
        </div>
        <div class="button-row" style="margin-top:16px">
          <button id="generateQuiz" class="primary">Generate mock quiz</button>
          <button class="secondary route-link" data-route="pricing">Unlock unlimited</button>
        </div>
      `)}
      ${panel(`
        <p class="eyebrow">Session brief</p>
        <h2>Designed for short effort.</h2>
        <p class="muted">Learnova recommends short, high-signal quizzes before passive review. This demo updates mastery locally after completion.</p>
      `, 'locked')}
    </section>
    ${panel('<div class="section-title"><div><p class="eyebrow">Practice</p><h2>Quiz preview</h2></div></div><div id="quizArea" class="grid"><p class="muted">Generate a mock quiz to begin.</p></div>')}
  `;

  const subject = document.getElementById('quizSubject');
  const topic = document.getElementById('quizTopic');
  const syncTopics = () => {
    topic.innerHTML = subjects[subject.value].map((item) => `<option>${item}</option>`).join('');
  };
  subject.addEventListener('change', syncTopics);
  if (pendingQuiz && subjects[pendingQuiz.subject]) {
    subject.value = pendingQuiz.subject;
    syncTopics();
    const matchingTopic = subjects[pendingQuiz.subject].find((item) => item.toLowerCase() === String(pendingQuiz.topic || '').toLowerCase());
    if (matchingTopic) topic.value = matchingTopic;
    pendingQuiz = null;
  } else {
    syncTopics();
  }
  document.getElementById('generateQuiz').addEventListener('click', generateQuiz);
}

function quizQuestions(subject, topic) {
  return [
    {
      q: `What is the strongest revision move for ${topic}?`,
      options: ['Active recall', 'Only rereading', 'Avoid feedback', 'Skip examples'],
      answer: 'Active recall',
    },
    subject === 'Chemistry'
      ? {
          q: 'What does one mole represent?',
          options: ['6.02 x 10^23 particles', '1 particle', '12 grams only', 'No fixed meaning'],
          answer: '6.02 x 10^23 particles',
        }
      : {
          q: `Which habit improves ${topic} mastery fastest?`,
          options: ['Practice with feedback', 'Guessing silently', 'Skipping weak areas', 'Only highlighting'],
          answer: 'Practice with feedback',
        },
    {
      q: `Short answer: name one common mistake in ${topic}.`,
      short: true,
      answer: 'Missing steps, units, or key definitions',
    },
    {
      q: `What should happen after a low ${topic} score?`,
      options: ['Target the weak step', 'Stop revising', 'Only read notes', 'Ignore mistakes'],
      answer: 'Target the weak step',
    },
  ];
}

function generateQuiz() {
  selectedAnswers = {};
  const subject = document.getElementById('quizSubject').value;
  const topic = document.getElementById('quizTopic').value;
  const count = Math.min(Number(document.getElementById('quizCount').value), 4);
  const questions = quizQuestions(subject, topic).slice(0, count);
  document.getElementById('quizArea').innerHTML = `
    ${questions
      .map(
        (question, index) => `
          <div class="list-row" style="display:block">
            <strong>${index + 1}. ${escapeHtml(question.q)}</strong>
            ${
              question.short
                ? `<input class="short-answer" data-index="${index}" placeholder="Type a short answer" style="margin-top:12px">`
                : `<div class="grid grid-2" style="margin-top:12px">${question.options
                    .map((option) => `<button class="quiz-option" data-index="${index}" data-answer="${escapeHtml(option)}">${escapeHtml(option)}</button>`)
                    .join('')}</div>`
            }
          </div>
        `
      )
      .join('')}
    <button id="submitQuiz" class="primary">Complete quiz</button>
    <div id="quizResult"></div>
  `;

  document.querySelectorAll('.quiz-option').forEach((button) => {
    button.addEventListener('click', () => {
      selectedAnswers[button.dataset.index] = button.dataset.answer;
      document.querySelectorAll(`.quiz-option[data-index="${button.dataset.index}"]`).forEach((option) => {
        option.classList.remove('selected');
      });
      button.classList.add('selected');
    });
  });

  document.querySelectorAll('.short-answer').forEach((input) => {
    input.addEventListener('input', () => {
      selectedAnswers[input.dataset.index] = input.value;
    });
  });

  document.getElementById('submitQuiz').addEventListener('click', () => submitQuiz(subject, topic, questions));
}

async function submitQuiz(subject, topic, questions) {
  let correct = 0;
  questions.forEach((question, index) => {
    const answer = selectedAnswers[index] || '';
    if (question.short ? answer.trim().length > 5 : answer === question.answer) correct += 1;
  });
  const score = Math.round((correct / questions.length) * 100);
  const mastery = state.mastery.map((item) =>
    item.subject === subject && item.topic.toLowerCase() === topic.toLowerCase()
      ? { ...item, score: Math.min(100, item.score + 6) }
      : item
  );
  await storage.set({ ...state, mastery });

  document.getElementById('quizResult').innerHTML = `
    <div class="prompt-card">
      <p class="eyebrow">Completed</p>
      <h2>Score: ${score}%</h2>
      <p class="muted">Mock mastery updated locally. Correct answers are shown below for review.</p>
      ${questions.map((question) => `<div class="list-row"><div><strong>Answer</strong><small>${escapeHtml(question.answer)}</small></div></div>`).join('')}
    </div>
  `;
  renderInsights();
  showToast('Quiz complete. Mastery signal updated.');
}

function renderFlashcards() {
  const [subject, topic, front, back] = flashcards[activeCard];
  stage.innerHTML = `
    <section class="grid grid-2">
      ${panel(`
        <p class="eyebrow">Flashcards</p>
        <div id="flashcard" class="flashcard ${cardFlipped ? 'flipped' : ''}">
          <div class="flashcard-inner">
            <div class="face front">
              <div>
                <span class="pill glow-pill">${subject} - ${topic}</span>
                <h2 style="margin-top:18px">${front}</h2>
                <p>Click to flip</p>
              </div>
            </div>
            <div class="face back">
              <div>
                <p class="eyebrow">Answer</p>
                <h2>${back}</h2>
                <p class="muted">Click again to return</p>
              </div>
            </div>
          </div>
        </div>
        <div class="row" style="justify-content:space-between;margin-top:16px">
          <button id="prevCard" class="secondary">Previous</button>
          <span class="pill">${activeCard + 1} / ${flashcards.length}</span>
          <button id="nextCard" class="primary">Next</button>
        </div>
      `)}
      ${panel(`
        <p class="eyebrow">Deck</p>
        <h2>Active recall queue</h2>
        <div class="grid">
          ${flashcards.map((item, index) => `<button class="deck-button" data-index="${index}"><strong>${item[1]}</strong><small>${item[0]}</small></button>`).join('')}
        </div>
      `)}
    </section>
  `;

  document.getElementById('flashcard').addEventListener('click', () => {
    cardFlipped = !cardFlipped;
    renderFlashcards();
  });
  document.getElementById('prevCard').addEventListener('click', () => {
    activeCard = Math.max(0, activeCard - 1);
    cardFlipped = false;
    renderFlashcards();
  });
  document.getElementById('nextCard').addEventListener('click', () => {
    activeCard = Math.min(flashcards.length - 1, activeCard + 1);
    cardFlipped = false;
    renderFlashcards();
  });
  document.querySelectorAll('.deck-button').forEach((button) => {
    button.addEventListener('click', () => {
      activeCard = Number(button.dataset.index);
      cardFlipped = false;
      renderFlashcards();
    });
  });
}

function renderMastery() {
  stage.innerHTML = `
    ${panel(`
      <p class="eyebrow">Weak Topics / Mastery Tracker</p>
      <h1 style="font-size:56px">The map of what needs attention.</h1>
      <p class="muted" style="max-width:680px">Progress bars are mock signals. They create a clear study priority without real grades or accounts.</p>
    `, 'hero-panel')}
    <section class="grid grid-2">${state.mastery.map((item) => panel(progressRow(item))).join('')}</section>
  `;
}

function renderPlanner() {
  stage.innerHTML = `
    ${panel(`
      <p class="eyebrow">Revision Planner</p>
      <h1 style="font-size:56px">A week that knows the weak spots.</h1>
      <p class="muted" style="max-width:680px">Tasks are suggested from mock mastery data. Premium planning cards show the upgrade story without real billing.</p>
    `, 'hero-panel')}
    <section class="grid grid-3">
      ${planner
        .map(
          (item) => `
            ${mini(`
              <div class="row" style="justify-content:space-between"><span class="pill">${item.day}</span>${item.locked ? '<span class="pill glow-pill">Premium</span>' : '<span class="pill">Ready</span>'}</div>
              <h2 style="margin-top:18px">${item.task}</h2>
              <p class="muted">${item.detail}</p>
              ${item.locked ? '<button class="primary route-link" data-route="pricing">Upgrade to unlock</button>' : '<button class="secondary route-link" data-route="quiz">Start task</button>'}
            `, item.locked ? 'locked' : '')}
          `
        )
        .join('')}
    </section>
  `;
}

function renderFocusControls() {
  const focus = state.focus;
  const [topSite, topMinutes] = mostDistractingSite();
  const [modeTitle, modeText] = focusModeCopy(focus.permissionMode);
  const enabledSites = focus.sites.filter((site) => site.enabled).length;

  stage.innerHTML = `
    ${panel(`
      <p class="eyebrow">Privacy & Focus Controls</p>
      <h1 style="font-size:56px">Focus help that stays under your control.</h1>
      <p class="muted" style="max-width:760px">Learnova gently helps students avoid procrastination without feeling controlling or invasive. You decide what it can access and how strongly it responds.</p>
      <div class="privacy-banner">
        <strong>Your browsing information stays on your device in this prototype and is never shared.</strong>
        <span>In the production version, all privacy settings remain fully controlled by the student.</span>
      </div>
    `, 'hero-panel')}

    <section class="grid grid-4">
      ${mini(`<p class="faint">Today's distraction time</p><div class="metric">${focus.analytics.todayMinutes || 61}m</div><small>Local prototype estimate</small>`)}
      ${mini(`<p class="faint">Most distracting website</p><div class="metric" style="font-size:28px">${escapeHtml(topSite)}</div><small>${topMinutes || 31} minutes today</small>`)}
      ${mini(`<p class="faint">Average focus session</p><div class="metric">${averageFocusSession()}m</div><small>Across mock sessions</small>`)}
      ${mini(`<p class="faint">Time saved this week</p><div class="metric">${focus.analytics.timeSavedWeek}m</div><small>From reminders and locks</small>`)}
    </section>

    <section class="grid grid-2">
      ${panel(`
        <div class="section-title">
          <div>
            <p class="eyebrow">Permission mode</p>
            <h2>${modeTitle}</h2>
          </div>
          <div class="row">${toggleMarkup(focus.enabled, 'focusEnabled')}</div>
        </div>
        <p class="muted">${modeText}</p>
        <div class="mode-grid">
          ${['privacy', 'balanced', 'smart']
            .map((mode) => {
              const [title, copy] = focusModeCopy(mode);
              return `<button class="mode-card ${focus.permissionMode === mode ? 'selected' : ''}" data-mode="${mode}">
                <span class="radio-dot"></span>
                <strong>${title}</strong>
                <small>${copy}</small>
              </button>`;
            })
            .join('')}
        </div>
      `)}
      ${panel(`
        <p class="eyebrow">Intervention level</p>
        <h2>Choose how strongly Learnova steps in.</h2>
        <div class="intervention-stack">
          ${[
            [1, 'Gentle Reminder', 'Small Chrome notification with Study Now, Snooze, and Ignore behavior.'],
            [2, 'Strong Reminder', 'Blur the page and show a beautiful Learnova modal.'],
            [3, 'Focus Lock', 'Temporarily replace the website with a Learnova focus page.'],
          ]
            .map(
              ([level, heading, copy]) => `
                <button class="intervention-card ${focus.interventionLevel === level ? 'selected' : ''}" data-level="${level}">
                  <span class="pill">Level ${level}</span>
                  <strong>${heading}</strong>
                  <small>${copy}</small>
                </button>
              `
            )
            .join('')}
        </div>
      `)}
    </section>

    <section class="grid grid-2">
      ${panel(`
        <div class="section-title">
          <div>
            <p class="eyebrow">Distracting website manager</p>
            <h2>${enabledSites} sites monitored</h2>
          </div>
          <span class="pill">${focus.permissionMode === 'smart' ? 'All sites' : 'Selected sites'}</span>
        </div>
        <label>Search websites<input id="siteSearch" placeholder="Search youtube, reddit, discord..."></label>
        <div id="siteList" class="site-list"></div>
        <div class="add-site-row">
          <input id="customSite" placeholder="Add custom website, e.g. chess.com">
          <button id="addSite" class="secondary">Add</button>
        </div>
      `)}
      ${panel(`
        <p class="eyebrow">Time limits</p>
        <h2>Default limit</h2>
        <p class="muted">Global default: 15 minutes. Each website can override this.</p>
        <div class="form-grid">
          <label>Global limit<select id="defaultLimit">${minutesOptions(focus.defaultLimit)}</select></label>
          <label id="customDefaultWrap" class="${[5, 10, 15, 20, 30, 45, 60].includes(Number(focus.defaultLimit)) ? 'hidden' : ''}">Custom minutes<input id="customDefaultLimit" type="number" min="1" value="${focus.defaultLimit}"></label>
        </div>
        <div class="snooze-box">
          <div class="row" style="justify-content:space-between">
            <div>
              <strong>Snooze settings</strong>
              <small>Never trap the user. Snooze and emergency unlock remain student-controlled.</small>
            </div>
            <div class="row">${toggleMarkup(focus.snoozeEnabled, 'snoozeEnabled')}</div>
          </div>
          <label>Snooze duration<select id="snoozeDuration">${minutesOptions(focus.snoozeDuration)}</select></label>
          <label id="customSnoozeWrap" class="${[5, 10, 15, 20, 30, 45, 60].includes(Number(focus.snoozeDuration)) ? 'hidden' : ''}">Custom snooze minutes<input id="customSnoozeDuration" type="number" min="1" value="${focus.customSnoozeDuration || focus.snoozeDuration}"></label>
        </div>
      `)}
    </section>

    <section class="grid grid-2">
      ${panel(`
        <p class="eyebrow">Focus analytics</p>
        <h2>Weekly distraction chart</h2>
        ${chartBars(focus.analytics.weekly, 'D')}
      `)}
      ${panel(`
        <p class="eyebrow">Monthly view</p>
        <h2>Pattern over time</h2>
        ${chartBars(focus.analytics.monthly, 'W')}
      `)}
    </section>

    <section class="grid grid-3">
      ${mini(`<p class="faint">Study streak</p><div class="metric">6</div><small>days</small>`)}
      ${mini(`<p class="faint">Focus streak</p><div class="metric">4</div><small>low-distraction days</small>`)}
      ${mini(`<p class="faint">Most productive day</p><div class="metric" style="font-size:30px">${focus.analytics.mostProductiveDay}</div><small>You usually study better around 7 PM.</small>`)}
    </section>

    ${panel(`
      <p class="eyebrow">Smart study recommendations</p>
      <div class="recommendation-grid">
        ${[
          "You've watched YouTube for 30 minutes. Want a quick 8-minute quiz instead?",
          "You usually study better around 7 PM.",
          "Continue yesterday's Chemistry revision?",
          "You're 68% finished with Algebra.",
          "Just one small study session. You've got this.",
        ]
          .map((item) => `<div class="list-row"><div><strong>Small reminder</strong><small>${item}</small></div><button class="secondary route-link" data-route="quiz">Study Now</button></div>`)
          .join('')}
      </div>
    `)}
  `;

  bindFocusControls();
  drawSiteList();
}

function drawSiteList() {
  const list = document.getElementById('siteList');
  if (!list) return;
  const query = (document.getElementById('siteSearch')?.value || '').toLowerCase();
  const sites = state.focus.sites.filter((site) => site.domain.includes(query));
  list.innerHTML = sites
    .map(
      (site) => `
        <div class="site-row" data-domain="${escapeHtml(site.domain)}">
          <div>
            <strong>${escapeHtml(site.domain)}</strong>
            <small>${site.enabled ? 'Tracking enabled' : 'Tracking disabled'} - ${site.limit} minute limit</small>
          </div>
          <div class="site-controls">
            <button class="switch ${site.enabled ? 'on' : ''} site-toggle" data-domain="${escapeHtml(site.domain)}" aria-pressed="${site.enabled}"><span></span></button>
            <select class="site-limit" data-domain="${escapeHtml(site.domain)}">${minutesOptions(site.limit)}</select>
            ${site.custom ? `<button class="danger remove-site" data-domain="${escapeHtml(site.domain)}">Remove</button>` : ''}
          </div>
        </div>
      `
    )
    .join('');

  list.querySelectorAll('.site-toggle').forEach((button) => {
    button.addEventListener('click', async () => {
      const domain = button.dataset.domain;
      const sites = state.focus.sites.map((site) => (site.domain === domain ? { ...site, enabled: !site.enabled } : site));
      await saveFocus({ ...state.focus, sites });
    });
  });
  list.querySelectorAll('.site-limit').forEach((select) => {
    select.addEventListener('change', async () => {
      const domain = select.dataset.domain;
      const value = select.value === 'custom' ? Number(prompt('Custom minute limit', '15') || 15) : Number(select.value);
      const sites = state.focus.sites.map((site) => (site.domain === domain ? { ...site, limit: value } : site));
      await saveFocus({ ...state.focus, sites });
    });
  });
  list.querySelectorAll('.remove-site').forEach((button) => {
    button.addEventListener('click', async () => {
      const sites = state.focus.sites.filter((site) => site.domain !== button.dataset.domain);
      await saveFocus({ ...state.focus, sites });
    });
  });
}

function bindFocusControls() {
  document.getElementById('focusEnabled').addEventListener('click', async () => {
    await saveFocus({ ...state.focus, enabled: !state.focus.enabled });
  });
  document.querySelectorAll('.mode-card').forEach((button) => {
    button.addEventListener('click', async () => {
      await saveFocus({ ...state.focus, permissionMode: button.dataset.mode });
    });
  });
  document.querySelectorAll('.intervention-card').forEach((button) => {
    button.addEventListener('click', async () => {
      await saveFocus({ ...state.focus, interventionLevel: Number(button.dataset.level) });
    });
  });
  document.getElementById('siteSearch').addEventListener('input', drawSiteList);
  document.getElementById('addSite').addEventListener('click', async () => {
    const input = document.getElementById('customSite');
    const domain = normalizeDomain(input.value);
    if (!domain) return;
    if (state.focus.sites.some((site) => site.domain === domain)) {
      showToast('That website is already in the list.');
      return;
    }
    await saveFocus({
      ...state.focus,
      sites: [...state.focus.sites, { domain, enabled: true, limit: state.focus.defaultLimit, custom: true }],
    });
  });
  document.getElementById('defaultLimit').addEventListener('change', async (event) => {
    const value = event.target.value === 'custom' ? Number(document.getElementById('customDefaultLimit')?.value || 15) : Number(event.target.value);
    await saveFocus({ ...state.focus, defaultLimit: value });
  });
  document.getElementById('customDefaultLimit')?.addEventListener('change', async (event) => {
    await saveFocus({ ...state.focus, defaultLimit: Number(event.target.value || 15) });
  });
  document.getElementById('snoozeEnabled').addEventListener('click', async () => {
    await saveFocus({ ...state.focus, snoozeEnabled: !state.focus.snoozeEnabled });
  });
  document.getElementById('snoozeDuration').addEventListener('change', async (event) => {
    const value = event.target.value === 'custom' ? Number(state.focus.customSnoozeDuration || 10) : Number(event.target.value);
    await saveFocus({ ...state.focus, snoozeDuration: value });
  });
  document.getElementById('customSnoozeDuration')?.addEventListener('change', async (event) => {
    const value = Number(event.target.value || 10);
    await saveFocus({ ...state.focus, snoozeDuration: value, customSnoozeDuration: value });
  });
}

function renderProfile() {
  const profile = state.studentProfile;
  const subjectsList = toList(profile.subjects);
  const profileData = [
    ['Full name', profile.name],
    ['Email', profile.email],
    ['Grade / year', profile.yearGroup],
    ['Age range', profile.ageRange],
    ['Country / region', profile.countryRegion],
    ['Curriculum', profile.curriculum],
    ['School', profile.schoolName],
    ['Subjects', listText(profile.subjects)],
    ['Target grades', profile.targetGrades],
    ['Weak topics', listText(profile.weakTopics)],
    ['Upcoming deadlines', listText(profile.upcomingDeadlines)],
    ['Academic goals', listText(profile.goals)],
    ['Study style', listText(profile.studyStyle)],
    ['Explanation style', profile.preferredExplanationStyle],
    ['Available study time', profile.dailyStudyTime],
    ['University / career interests', [profile.universityInterests, profile.careerInterests].filter(Boolean).join(', ')],
    ['Extracurricular interests', profile.extracurricularInterests],
  ].filter(([, value]) => value);
  stage.innerHTML = `
    <section class="profile-page-header">
      <div class="profile-page-identity">
        <span class="profile-settings-avatar ${profile.avatarDataUrl ? 'has-image' : ''}">
          ${profile.avatarDataUrl ? `<img src="${profile.avatarDataUrl}" alt="">` : initials(profile.name)}
        </span>
        <div>
          <p class="page-kicker">Student profile</p>
          <h1>${escapeHtml(profile.name)}</h1>
          <p>${escapeHtml(profile.yearGroup || `Year ${profile.grade}`)} - ${escapeHtml(profile.curriculum)}</p>
        </div>
      </div>
      <div class="profile-actions">
        <input id="profilePhotoInput" type="file" accept="image/*">
        <button id="editAcademicProfile" class="primary">Edit profile</button>
        <button id="uploadProfilePhoto" class="secondary">Change photo</button>
        <button id="logoutProfile" class="danger">Log out</button>
      </div>
    </section>
    <section class="profile-detail-grid">
      <article class="profile-detail-section"><p class="page-kicker">Academic setup</p><div class="profile-detail-list"><div><span>School</span><strong>${escapeHtml(profile.schoolName || 'Not added')}</strong></div><div><span>Curriculum</span><strong>${escapeHtml(profile.curriculum || 'Not added')}</strong></div><div><span>Target grades</span><strong>${escapeHtml(profile.targetGrades || 'Not added')}</strong></div><div><span>Daily study time</span><strong>${escapeHtml(profile.dailyStudyTime || 'Not added')}</strong></div></div></article>
      <article class="profile-detail-section"><p class="page-kicker">Subjects</p><div class="study-set-topics">${subjectsList.map((subject) => `<span>${escapeHtml(subject)}</span>`).join('') || '<span>No subjects added</span>'}</div></article>
      <article class="profile-detail-section"><p class="page-kicker">Goals</p><div class="profile-detail-list">${toList(profile.goals).slice(0, 4).map((goal) => `<div><strong>${escapeHtml(goal)}</strong></div>`).join('') || '<div><strong>Build a consistent study rhythm</strong></div>'}</div></article>
      <article class="profile-detail-section"><p class="page-kicker">Study preferences</p><div class="study-set-topics">${toList(profile.studyStyle).map((style) => `<span>${escapeHtml(style)}</span>`).join('') || '<span>Not added</span>'}</div></article>
    </section>
    <section class="profile-privacy-section" aria-labelledby="profilePrivacyTitle">
      <div>
        <p class="page-kicker">Privacy and AI</p>
        <h2 id="profilePrivacyTitle">You control personalization.</h2>
        <p>Learnova can use relevant academic details to tailor explanations, quizzes, and study plans. Passwords, authentication data, email, and profile photos are never sent to the AI.</p>
      </div>
      <label class="profile-personalization-control" for="profilePersonalizationEnabled">
        <span><strong>Profile-based AI personalization</strong><small>The AI continues to work as a general study assistant when this is off.</small></span>
        <input id="profilePersonalizationEnabled" type="checkbox" ${profile.personalizationEnabled !== false ? 'checked' : ''}>
        <span class="settings-toggle" aria-hidden="true"></span>
      </label>
      <details class="saved-profile-disclosure">
        <summary>View information saved on this device</summary>
        <div class="saved-profile-list">
          ${profileData.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}
        </div>
        <p class="profile-data-note">No password is stored. Academic profile information stays in Chrome storage unless you clear it.</p>
      </details>
      <button id="clearProfileData" class="danger profile-clear-button">Clear profile data</button>
    </section>
  `;
  bindProfileSettings(renderProfile);
}

function renderSettings() {
  const { normalized, theme, accent } = resolveTheme(state.theme);
  const settings = [
    ['Theme', `${theme.name} with ${accent.name} accent in ${normalized.mode === 'dark' ? 'dark' : 'light'} mode.`],
    ['Notifications', 'Encouraging reminders only. Never shame-based language.'],
    ['Privacy', `${focusModeCopy(state.focus.permissionMode)[0]} is active.`],
    ['Focus Coach', state.focus.enabled ? 'Enabled with student-controlled interventions.' : 'Disabled.'],
    ['Blocked websites', `${state.focus.sites.filter((site) => site.enabled).length} websites monitored.`],
    ['Time limits', `${state.focus.defaultLimit} minute global default.`],
    ['Subscription', `${state.plan} demo plan selected.`],
    ['Keyboard shortcuts', 'Cmd/Ctrl K opens the command palette.'],
    ['AI preferences', 'Learnova AI service provider is active.'],
    ['Account', 'Manage your academic profile, photo, and local session.'],
  ];

  stage.innerHTML = `
    <section class="page-intro settings-intro"><div><p class="page-kicker">Settings</p><h1>Make Learnova feel like yours.</h1><p>Adjust your workspace, focus preferences, account, and demo subscription.</p></div></section>
    ${ThemeSettingsPanel()}
    <section class="settings-layout">
      <aside class="settings-index">
        ${settings.map(([name]) => `<button class="settings-anchor" data-setting="${name}">${name}</button>`).join('')}
      </aside>
      <div class="settings-list">
        ${settings
          .map(
            ([name, copy]) => `
              <section class="settings-row">
                <div>
                  <strong>${name}</strong>
                  <small>${copy}</small>
                </div>
                ${
                  name === 'Theme'
                    ? '<button class="secondary" data-open-theme-modal>Customize</button>'
                    : name === 'Privacy' || name === 'Focus Coach' || name === 'Blocked websites' || name === 'Time limits'
                    ? '<button class="secondary route-link" data-route="focus">Configure</button>'
                    : name === 'Account' || name === 'AI preferences'
                    ? '<button class="secondary route-link" data-route="profile">View profile</button>'
                    : '<span class="pill">Demo</span>'
                }
              </section>
            `
          )
          .join('')}
      </div>
    </section>
  `;
  bindThemeControls(stage);
}

function bindProfileSettings(renderAfter = renderProfile) {
  const input = document.getElementById('profilePhotoInput');
  document.getElementById('editAcademicProfile')?.addEventListener('click', () => renderOnboarding({ mode: 'edit' }));
  document.getElementById('logoutProfile')?.addEventListener('click', async () => {
    const confirmed = confirm('Log out and clear this local Learnova profile?');
    if (!confirmed) return;
    await clearProfile();
    closeModal();
    setRoute('dashboard');
    renderOnboarding({ mode: 'signup' });
    showToast('Logged out locally.');
  });
  document.getElementById('profilePersonalizationEnabled')?.addEventListener('change', async (event) => {
    await updateProfile({ personalizationEnabled: event.target.checked });
    renderAfter();
    showToast(event.target.checked ? 'AI personalization enabled.' : 'AI personalization disabled.');
  });
  document.getElementById('clearProfileData')?.addEventListener('click', async () => {
    const confirmed = confirm('Clear your local Learnova profile and return to onboarding? This cannot be undone.');
    if (!confirmed) return;
    await clearProfile();
    setRoute('dashboard');
    renderOnboarding({ mode: 'signup' });
    showToast('Profile data cleared from this device.');
  });
  document.getElementById('uploadProfilePhoto')?.addEventListener('click', () => input?.click());
  document.getElementById('removeProfilePhoto')?.addEventListener('click', async () => {
    await updateProfile({ avatarDataUrl: '' });
    updateProfileChip();
    renderAfter();
    showToast('Profile picture removed.');
  });
  input?.addEventListener('change', async (event) => {
    const [file] = [...event.target.files];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image file.');
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', async () => {
      await updateProfile({ avatarDataUrl: reader.result });
      updateProfileChip();
      renderAfter();
      showToast('Profile picture updated.');
    });
    reader.readAsDataURL(file);
  });
}

function renderPricing() {
  const rows = [
    ['Basic AI Study Assistant', true, true, true],
    ['Unlimited quizzes', false, true, true],
    ['Chrome extension access', false, true, true],
    ['Progress analytics', false, true, true],
    ['Priority AI tutor mode', false, false, true],
    ['Parent progress dashboard', false, false, true],
    ['SAT/IB/IGCSE prep mode', false, false, true],
  ];

  stage.innerHTML = `
    ${panel(`
      <p class="eyebrow">Pricing</p>
      <h1 style="font-size:56px">Subscription story without real payments.</h1>
      <p class="muted" style="max-width:680px">Choose Plan opens a fake checkout modal and updates the local plan badge. No Stripe or payment processing is connected.</p>
    `, 'hero-panel')}
    <section class="grid grid-3">
      ${pricing
        .map(
          (tier) => `
          <article class="price-card interactive ${tier.featured ? 'featured' : ''}">
            <span class="pill ${tier.featured ? 'glow-pill' : ''}">${tier.featured ? 'Most Popular' : 'Demo plan'}</span>
            <h2 style="margin-top:16px">${tier.name}</h2>
            <p class="muted">${tier.description}</p>
            <div class="price">${tier.price}</div>
            <p class="muted">per month</p>
            <button class="primary choose-plan" data-plan="${tier.name}">Choose Plan</button>
            <div class="feature-list">${tier.features.map((feature) => `<p>Yes - ${feature}</p>`).join('')}</div>
          </article>
        `
        )
        .join('')}
    </section>
    ${panel(`
      <div class="section-title"><div><p class="eyebrow">Comparison</p><h2>Plan matrix</h2></div></div>
      <div style="overflow:auto">
        <table style="width:100%;min-width:720px;border-spacing:0 8px">
          <thead><tr><th>Feature</th><th>Starter</th><th>Plus</th><th>Premium</th></tr></thead>
          <tbody>
            ${rows
              .map(
                (row) =>
                  `<tr>${row.map((cell, index) => `<td style="padding:12px;background:rgba(255,255,255,0.055)">${index === 0 ? cell : cell ? 'Yes' : '-'}</td>`).join('')}</tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `)}
  `;

  document.querySelectorAll('.choose-plan').forEach((button) => {
    button.addEventListener('click', () => openCheckout(button.dataset.plan));
  });
}

function openCheckout(plan) {
  modal.classList.remove('hidden');
  modal.innerHTML = `
    <section class="modal-card">
      <div class="section-title">
        <div>
          <p class="eyebrow">Fake checkout</p>
          <h2>${escapeHtml(plan)} plan</h2>
        </div>
        <button id="closeModal" class="secondary">Close</button>
      </div>
      <p class="muted">This prototype does not connect Stripe or process payments. A real version would require secure authentication, backend billing logic, and subscription controls.</p>
      <button id="setPlan" class="primary">Set demo plan</button>
    </section>
  `;

  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('setPlan').addEventListener('click', async () => {
    await storage.set({ ...state, plan });
    planLabel.textContent = plan;
    closeModal();
    showToast(`${plan} plan selected for the demo.`);
  });
}

function closeModal() {
  modal.classList.add('hidden');
  modal.innerHTML = '';
}

function renderRoadmap() {
  const roadmap = [
    'Real account system',
    'Backend database',
    'Real AI API',
    'Google Drive/Classroom integration',
    'PDF/Slides parsing',
    'Embeddings/vector search',
    'Per-student mastery tracking',
    'Privacy/security controls',
  ];

  stage.innerHTML = `
    ${panel(`
      <p class="eyebrow">Admin / Future Integrations</p>
      <h1 style="font-size:56px">What ships after the showcase.</h1>
      <p class="muted" style="max-width:720px">This extension is a professional prototype. The roadmap shows what a production Learnova would need before handling real students.</p>
    `, 'hero-panel')}
    ${panel(`
      <div class="roadmap-list">
        ${roadmap.map((item) => `<div class="list-row"><div><strong>${item}</strong><small>Production capability</small></div><span class="pill">Future</span></div>`).join('')}
      </div>
    `)}
    ${panel(`
      <p class="eyebrow">Privacy note</p>
      <h2>Student data would require serious controls.</h2>
      <p class="muted">A real version would require secure authentication, user consent, encrypted storage, data retention rules, and careful handling of student information.</p>
    `, 'locked')}
  `;
}

function openCommandPalette() {
  modal.classList.remove('hidden');
  modal.innerHTML = `
    <section class="command-dialog">
      <input id="commandInput" class="command-input" placeholder="Search Learnova..." autofocus>
      <div id="commandResults" class="command-results"></div>
    </section>
  `;
  const input = document.getElementById('commandInput');
  const results = document.getElementById('commandResults');

  const actions = [
    ...routes.filter((route) => route.group !== 'hidden').map((route) => ({ label: route.label, hint: 'Open page', route: route.id })),
    { label: 'Start focus quiz', hint: 'Practice Chemistry: moles', route: 'quiz' },
    { label: 'Ask weakest topics', hint: 'Open assistant', route: 'assistant' },
    { label: 'Save new material', hint: 'Open capture studio', route: 'capture' },
    { label: 'Compare plans', hint: 'Open pricing', route: 'pricing' },
  ];

  function draw() {
    const query = input.value.toLowerCase();
    const filtered = actions.filter((action) => action.label.toLowerCase().includes(query) || action.hint.toLowerCase().includes(query));
    results.innerHTML = filtered
      .map((action) => `<button class="command-result" data-route="${action.route}"><span>${action.label}</span><small>${action.hint}</small></button>`)
      .join('');
    results.querySelectorAll('.command-result').forEach((button) => {
      button.addEventListener('click', () => {
        closeModal();
        setRoute(button.dataset.route);
      });
    });
  }

  input.addEventListener('input', draw);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
  draw();
  input.focus();
}

function onboardingDefaults() {
  const profile = state.auth.profileComplete ? state.studentProfile : {};
  const savedCurriculum = profile.curriculum || '';
  const matchedCurriculum = curriculumOptions.find(
    (item) => item !== 'Other' && savedCurriculum.toLowerCase().includes(item.toLowerCase())
  );
  const curriculum = profile.curriculumChoice && curriculumOptions.includes(profile.curriculumChoice)
    ? profile.curriculumChoice
    : matchedCurriculum || (savedCurriculum ? 'Other' : '');
  return {
    name: profile.name || '',
    email: profile.email || state.auth.email || '',
    password: '',
    yearGroup: profile.yearGroup || '',
    curriculum,
    customCurriculum: profile.customCurriculum || (curriculum === 'Other' ? savedCurriculum : ''),
    schoolName: profile.schoolName || '',
    countryRegion: profile.countryRegion || '',
    ageRange: profile.ageRange || '',
    subjects: listText(profile.subjects),
    targetGrades: profile.targetGrades || '',
    upcomingDeadlines: listText(profile.upcomingDeadlines),
    goals: listText(profile.goals),
    weakTopics: listText(profile.weakTopics),
    studyStyle: toList(profile.studyStyle).length ? toList(profile.studyStyle) : toList(profile.learningPreferences),
    universityInterests: profile.universityInterests || '',
    extracurricularInterests: profile.extracurricularInterests || '',
    dailyStudyTime: profile.dailyStudyTime || '',
    preferredExplanationStyle: profile.preferredExplanationStyle || '',
    personalizationEnabled: profile.personalizationEnabled !== false,
  };
}

function onboardingLabel(label, required) {
  return `<span class="field-label-text">${escapeHtml(label)}</span><span class="field-requirement ${required ? 'required' : 'optional'}">${required ? 'Required' : 'Optional'}</span>`;
}

function onboardingField(id, label, type = 'text', placeholder = '', options = {}) {
  const value = escapeHtml(onboardingDraft[id] || '');
  const required = Boolean(options.required);
  const helperId = `${id}Help`;
  const errorId = `${id}Error`;
  const error = onboardingErrors[id] || '';
  const describedBy = [options.helper ? helperId : '', error ? errorId : ''].filter(Boolean).join(' ');
  return `
    <div class="onboarding-field ${options.wide ? 'onboarding-wide' : ''}">
      <label for="${id}">${onboardingLabel(label, required)}</label>
      <input id="${id}" name="${id}" type="${type}" value="${value}" placeholder="${escapeHtml(placeholder)}"
        ${required ? 'required' : ''} ${options.autocomplete ? `autocomplete="${options.autocomplete}"` : ''}
        ${describedBy ? `aria-describedby="${describedBy}"` : ''} aria-invalid="${Boolean(error)}">
      ${options.helper ? `<small id="${helperId}" class="field-help">${escapeHtml(options.helper)}</small>` : ''}
      ${error ? `<p id="${errorId}" class="field-error" role="alert">${escapeHtml(error)}</p>` : ''}
    </div>
  `;
}

function onboardingTextarea(id, label, placeholder = '', options = {}) {
  const value = escapeHtml(onboardingDraft[id] || '');
  const required = Boolean(options.required);
  const helperId = `${id}Help`;
  const errorId = `${id}Error`;
  const error = onboardingErrors[id] || '';
  const describedBy = [options.helper ? helperId : '', error ? errorId : ''].filter(Boolean).join(' ');
  return `
    <div class="onboarding-field onboarding-wide">
      <label for="${id}">${onboardingLabel(label, required)}</label>
      <textarea id="${id}" name="${id}" placeholder="${escapeHtml(placeholder)}" ${required ? 'required' : ''}
        ${describedBy ? `aria-describedby="${describedBy}"` : ''} aria-invalid="${Boolean(error)}">${value}</textarea>
      ${options.helper ? `<small id="${helperId}" class="field-help">${escapeHtml(options.helper)}</small>` : ''}
      ${error ? `<p id="${errorId}" class="field-error" role="alert">${escapeHtml(error)}</p>` : ''}
    </div>
  `;
}

function onboardingCurriculumField() {
  const error = onboardingErrors.curriculum || '';
  return `
    <div class="onboarding-field">
      <label for="curriculum">${onboardingLabel('School system / curriculum', true)}</label>
      <select id="curriculum" name="curriculum" required aria-describedby="curriculumHelp ${error ? 'curriculumError' : ''}" aria-invalid="${Boolean(error)}">
        <option value="" ${!onboardingDraft.curriculum ? 'selected' : ''} disabled>Choose your school system</option>
        ${curriculumOptions.map((item) => `<option value="${item}" ${onboardingDraft.curriculum === item ? 'selected' : ''}>${item}</option>`).join('')}
      </select>
      <small id="curriculumHelp" class="field-help">Choose the option closest to your current course. You can describe another system.</small>
      ${error ? `<p id="curriculumError" class="field-error" role="alert">${escapeHtml(error)}</p>` : ''}
    </div>
  `;
}

function collectOnboardingStep() {
  const read = (id) => document.getElementById(id)?.value?.trim();
  ['name', 'email', 'password', 'yearGroup', 'curriculum', 'customCurriculum', 'schoolName', 'countryRegion', 'ageRange', 'subjects', 'targetGrades', 'upcomingDeadlines', 'goals', 'weakTopics', 'universityInterests', 'extracurricularInterests', 'dailyStudyTime', 'preferredExplanationStyle'].forEach((id) => {
    const value = read(id);
    if (value !== undefined) onboardingDraft[id] = value;
  });
  const checkedStyles = [...document.querySelectorAll('[name="studyStyle"]:checked')].map((input) => input.value);
  if (checkedStyles.length || document.querySelector('[name="studyStyle"]')) onboardingDraft.studyStyle = checkedStyles;
  const personalization = document.getElementById('personalizationEnabled');
  if (personalization) onboardingDraft.personalizationEnabled = personalization.checked;
}

function onboardingProfileFromDraft() {
  const curriculum = onboardingDraft.curriculum === 'Other'
    ? onboardingDraft.customCurriculum
    : onboardingDraft.curriculum;
  return normalizeStudentProfile({
    name: onboardingDraft.name,
    email: onboardingDraft.email,
    grade: onboardingDraft.yearGroup,
    yearGroup: onboardingDraft.yearGroup,
    curriculumChoice: onboardingDraft.curriculum,
    customCurriculum: onboardingDraft.customCurriculum,
    curriculum,
    schoolName: onboardingDraft.schoolName,
    countryRegion: onboardingDraft.countryRegion,
    ageRange: onboardingDraft.ageRange,
    subjects: toList(onboardingDraft.subjects),
    targetGrades: onboardingDraft.targetGrades,
    upcomingDeadlines: toList(onboardingDraft.upcomingDeadlines),
    goals: toList(onboardingDraft.goals),
    weakTopics: toList(onboardingDraft.weakTopics),
    learningPreferences: onboardingDraft.studyStyle,
    studyStyle: onboardingDraft.studyStyle,
    universityInterests: onboardingDraft.universityInterests,
    extracurricularInterests: onboardingDraft.extracurricularInterests,
    dailyStudyTime: onboardingDraft.dailyStudyTime,
    preferredExplanationStyle: onboardingDraft.preferredExplanationStyle,
    personalizationEnabled: onboardingDraft.personalizationEnabled !== false,
    avatarDataUrl: state.auth.profileComplete ? state.studentProfile.avatarDataUrl : '',
    quizHistory: state.auth.profileComplete ? state.studentProfile.quizHistory : [],
    revisionHistory: state.auth.profileComplete ? state.studentProfile.revisionHistory : [],
  });
}

function onboardingStepMarkup() {
  const steps = ['Account', 'Academic Profile', 'Goals', 'Confirm'];
  const progress = `
    <div class="onboarding-progress">
      ${steps.map((step, index) => `<span class="${index <= onboardingStep ? 'active' : ''}" ${index === onboardingStep ? 'aria-current="step"' : ''}>${index + 1}. ${step}</span>`).join('')}
    </div>
  `;

  if (onboardingStep === 0) {
    return `
      ${progress}
      <div class="onboarding-form-grid">
        ${onboardingField('name', 'Full name', 'text', 'e.g. Alex Morgan', { required: true, autocomplete: 'name' })}
        ${onboardingField('email', 'Email', 'email', 'e.g. alex@example.com', { required: true, autocomplete: 'email', helper: 'Used only for this local demo account.' })}
        ${onboardingMode === 'signup' ? onboardingField('password', 'Password', 'password', 'Create a demo password', { required: true, autocomplete: 'new-password', helper: 'Demo only. It is not saved or sent to the AI.' }) : ''}
      </div>
      <p class="muted">Demo authentication is stored locally only. No real auth service is connected.</p>
    `;
  }

  if (onboardingStep === 1) {
    return `
      ${progress}
      <div class="onboarding-form-grid">
        ${onboardingField('yearGroup', 'Grade / Year', 'text', 'e.g. Grade 10, Year 11, First Year', { required: true, helper: 'Use the wording your school or university uses.' })}
        ${onboardingCurriculumField()}
        <div id="customCurriculumField" class="${onboardingDraft.curriculum === 'Other' ? '' : 'hidden'}">
          ${onboardingField('customCurriculum', 'Your curriculum', 'text', 'e.g. Ontario Secondary School Diploma', { required: onboardingDraft.curriculum === 'Other', helper: 'Enter the name of your school system or course.' })}
        </div>
        ${onboardingField('schoolName', 'School name', 'text', 'e.g. Dartmouth High School', { autocomplete: 'organization' })}
        ${onboardingField('countryRegion', 'Country or region', 'text', 'e.g. Canada, Singapore, California', { autocomplete: 'country-name' })}
        ${onboardingField('ageRange', 'Age range', 'text', 'e.g. 14–16, 18+', { helper: 'A broad range is enough; exact age is not needed.' })}
        ${onboardingTextarea('subjects', 'Subjects', 'e.g. Mathematics, Biology, English Literature', { required: true, helper: 'Add any subjects you study, separated by commas or new lines.' })}
        ${onboardingField('targetGrades', 'Target grades', 'text', 'e.g. A in Chemistry, 6 in IB Biology, 4 in AP Calculus')}
        ${onboardingTextarea('upcomingDeadlines', 'Upcoming exams or deadlines', 'e.g. Biology test on Friday, English essay due Monday')}
      </div>
    `;
  }

  if (onboardingStep === 2) {
    return `
      ${progress}
      <div class="onboarding-form-grid">
        ${onboardingTextarea('goals', 'Main academic goals', 'e.g. Improve my Chemistry grade before final exams')}
        ${onboardingTextarea('weakTopics', 'Weak subjects or topics', 'e.g. Moles, quadratic equations, essay analysis')}
        <fieldset class="onboarding-wide study-style-field">
          <legend>${onboardingLabel('Preferred study style', false)}</legend>
          <div class="study-style-grid">
            ${studyStyleOptions
              .map(
                (item) => `
                  <label class="style-check">
                    <input name="studyStyle" type="checkbox" value="${item}" ${toList(onboardingDraft.studyStyle).includes(item) ? 'checked' : ''}>
                    <span>${item}</span>
                  </label>
                `
              )
              .join('')}
          </div>
          <small class="field-help">e.g. short quizzes, flashcards, step-by-step explanations</small>
        </fieldset>
        ${onboardingField('preferredExplanationStyle', 'Preferred explanation style', 'text', 'e.g. Simple first, then exam terminology', { wide: true })}
        ${onboardingField('universityInterests', 'University or career interests', 'text', 'e.g. Computer Science, Medicine, Business')}
        ${onboardingField('extracurricularInterests', 'Extracurricular interests', 'text', 'e.g. debate, football, coding, music')}
        ${onboardingField('dailyStudyTime', 'Available study time', 'text', 'e.g. 45 minutes on weekdays')}
        <label class="onboarding-wide personalization-choice" for="personalizationEnabled">
          <input id="personalizationEnabled" type="checkbox" ${onboardingDraft.personalizationEnabled !== false ? 'checked' : ''}>
          <span class="personalization-switch" aria-hidden="true"></span>
          <span><strong>Personalize AI responses with my academic profile</strong><small>Learnova sends only relevant academic details. Passwords, account data, and profile photos are never sent.</small></span>
        </label>
      </div>
    `;
  }

  const profile = onboardingProfileFromDraft();
  return `
    ${progress}
    <div class="confirm-grid" tabindex="-1">
      <div class="confirm-card">
        <p class="eyebrow">Student</p>
        <h2>${escapeHtml(profile.name || 'Student')}</h2>
        <p class="muted">${escapeHtml(profile.yearGroup)} - ${escapeHtml(profile.curriculum)}</p>
      </div>
      <div class="confirm-card">
        <p class="eyebrow">Goal</p>
        <h3>${escapeHtml(profile.targetGrades || 'Personal best')}</h3>
        <p class="muted">${escapeHtml(toList(profile.goals).slice(0, 2).join(', ') || 'Build a better study rhythm')}</p>
      </div>
      <div class="confirm-card">
        <p class="eyebrow">Weak topics</p>
        <p>${toList(profile.weakTopics).slice(0, 4).map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join(' ')}</p>
      </div>
      <div class="confirm-card">
        <p class="eyebrow">Learnova will prioritize</p>
        <p class="muted">${escapeHtml(toList(profile.studyStyle).join(', ') || 'quizzes, flashcards, and simple explanations')}</p>
      </div>
      <div class="confirm-card confirm-privacy">
        <p class="eyebrow">AI personalization</p>
        <h3>${profile.personalizationEnabled ? 'On' : 'Off'}</h3>
        <p class="muted">${profile.personalizationEnabled ? 'Relevant academic profile details will shape AI responses.' : 'Learnova AI will work as a general study assistant.'}</p>
      </div>
    </div>
  `;
}

function validateOnboardingStep(step) {
  const errors = {};
  if (step === 0) {
    if (!onboardingDraft.name) errors.name = 'Enter your full name to continue.';
    if (!onboardingDraft.email) errors.email = 'Enter your email address to continue.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(onboardingDraft.email)) {
      errors.email = 'Use an email format like name@example.com.';
    }
    if (onboardingMode === 'signup' && !onboardingDraft.password) {
      errors.password = 'Create a demo password to continue. It will not be stored.';
    }
  }
  if (step === 1 || step === 3) {
    if (!onboardingDraft.yearGroup) errors.yearGroup = 'Enter your grade, year, or current level.';
    if (!onboardingDraft.curriculum) errors.curriculum = 'Choose your school system or curriculum.';
    if (onboardingDraft.curriculum === 'Other' && !onboardingDraft.customCurriculum) {
      errors.customCurriculum = 'Enter the name of your curriculum or school system.';
    }
    if (!toList(onboardingDraft.subjects).length) errors.subjects = 'Add at least one subject you are studying.';
  }
  return errors;
}

function setOnboardingSubmissionState(button, loading) {
  if (!button) return;
  if (loading) {
    button.dataset.idleLabel = button.textContent;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.classList.add('is-submitting');
    button.innerHTML = '<span class="onboarding-submit-spinner" aria-hidden="true"></span><span>Setting up your workspace&hellip;</span>';
    return;
  }
  button.disabled = false;
  button.removeAttribute('aria-busy');
  button.classList.remove('is-submitting');
  button.textContent = button.dataset.idleLabel || 'Enter Learnova';
}

function showOnboardingError(message) {
  const error = document.getElementById('onboardingError');
  if (!error) return;
  error.textContent = message;
  error.classList.remove('hidden');
}

function renderOnboarding(options = {}) {
  onboardingReturnFocus = document.activeElement;
  onboardingMode = options.mode || (state.auth.profileComplete ? 'edit' : 'signup');
  onboardingStep = options.step ?? 0;
  onboardingDraft = { ...onboardingDefaults(), ...(options.prefill || {}) };
  onboardingErrors = {};
  document.body.classList.add('onboarding-active');
  drawOnboarding();
}

function drawOnboarding() {
  onboarding.classList.remove('hidden');
  onboarding.innerHTML = `
    <section class="welcome-card onboarding-card">
      <div class="onboarding-layout">
        <aside class="onboarding-brand">
          <span class="logo-mark onboarding-logo" aria-hidden="true"></span>
          <p class="eyebrow">Learnova</p>
          <h1 id="onboardingTitle">Your AI-powered academic operating system</h1>
          <p class="muted">Set up your profile once. Learnova uses it to personalize your dashboard, study plan, and assistant responses.</p>
          <div class="onboarding-signal">
            <strong>${onboardingMode === 'edit' ? 'Editing profile' : 'Local demo login'}</strong>
            <small>Your data stays in this Chrome extension prototype.</small>
          </div>
        </aside>
        <form id="onboardingForm" class="onboarding-panel" novalidate>
          ${onboardingStepMarkup()}
          <div class="onboarding-actions">
            ${onboardingStep > 0 ? '<button type="button" id="onboardingBack" class="secondary">Back</button>' : ''}
            ${onboardingMode === 'edit' ? '<button type="button" id="onboardingCancel" class="ghost">Cancel</button>' : ''}
            <button type="submit" id="onboardingNext" class="primary">${onboardingStep === 3 ? (onboardingMode === 'edit' ? 'Save profile' : 'Enter Learnova') : 'Continue'}</button>
          </div>
          <p id="onboardingError" class="onboarding-save-error hidden" role="alert"></p>
        </form>
      </div>
    </section>
  `;

  document.getElementById('onboardingBack')?.addEventListener('click', () => {
    collectOnboardingStep();
    onboardingErrors = {};
    onboardingStep -= 1;
    drawOnboarding();
  });
  document.getElementById('onboardingCancel')?.addEventListener('click', () => {
    onboarding.classList.add('hidden');
    document.body.classList.remove('onboarding-active');
    onboardingReturnFocus?.focus?.();
  });
  document.getElementById('curriculum')?.addEventListener('change', (event) => {
    const selectedCurriculum = event.target.value;
    collectOnboardingStep();
    onboardingDraft.curriculum = selectedCurriculum;
    onboardingErrors = {};
    drawOnboarding();
    requestAnimationFrame(() => {
      (selectedCurriculum === 'Other'
        ? document.getElementById('customCurriculum')
        : document.getElementById('curriculum'))?.focus();
    });
  });
  const nextButton = document.getElementById('onboardingNext');
  document.getElementById('onboardingForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (nextButton.disabled) return;
    collectOnboardingStep();
    onboardingErrors = validateOnboardingStep(onboardingStep);
    if (Object.keys(onboardingErrors).length) {
      drawOnboarding();
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }
    if (onboardingStep < 3) {
      onboardingErrors = {};
      onboardingStep += 1;
      drawOnboarding();
      return;
    }
    const profile = onboardingProfileFromDraft();
    setOnboardingSubmissionState(nextButton, true);
    try {
      await saveProfile(profile, { email: profile.email });
    } catch (error) {
      setOnboardingSubmissionState(nextButton, false);
      showOnboardingError('We could not save your profile. Please try again; your answers are still here.');
      return;
    }

    if (onboardingMode === 'edit') {
      onboarding.classList.add('hidden');
      document.body.classList.remove('onboarding-active');
      setRoute('dashboard');
      showToast('Profile updated.');
      return;
    }

    try {
      const transitionResult = await OnboardingTransition.startOnboardingCompletionTransition(profile, {
        onboardingElement: onboarding,
        prepareDashboard: async () => setRoute('dashboard'),
        onComplete: () => showToast(`Welcome to Learnova, ${profile.name}. Your workspace is ready.`),
      });
      if (!transitionResult.played) showToast(`Welcome to Learnova, ${profile.name}.`);
    } catch (error) {
      setOnboardingSubmissionState(nextButton, false);
      showOnboardingError('Your profile was saved, but the workspace could not open. Please try again.');
    }
  });
  requestAnimationFrame(() => {
    const focusTarget = onboardingStep === 3
      ? onboarding.querySelector('.confirm-grid')
      : onboarding.querySelector('.onboarding-form-grid input:not([type="checkbox"]), .onboarding-form-grid select, .onboarding-form-grid textarea');
    focusTarget?.focus();
  });
}

function setupRevealAnimations(scope = stage) {
  const reducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !globalThis.IntersectionObserver) return;
  revealObserver?.disconnect();
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.08 }
  );
  [...scope.children].forEach((item, index) => {
    item.classList.add('reveal-item');
    item.style.setProperty('--reveal-delay', `${Math.min(index * 45, 180)}ms`);
    revealObserver.observe(item);
  });
}

function render() {
  const pages = {
    dashboard: renderHome,
    library: renderLibrary,
    studyset: renderStudySet,
    capture: renderCapture,
    assistant: renderAssistant,
    quiz: renderQuiz,
    flashcards: renderFlashcards,
    mastery: renderMastery,
    planner: renderPlanner,
    focus: renderFocusControls,
    profile: renderProfile,
    settings: renderSettings,
    pricing: renderPricing,
    roadmap: renderRoadmap,
  };

  (pages[activeRoute] || pages.dashboard)();
  renderInsights();
  bindRouteLinks(stage);
  bindStudySetActions(stage);
  bindHomeActions(stage);
  setupRevealAnimations(stage);
  globalThis.LearnovaCompanion?.update();
}

async function init() {
  state = await storage.get();
  applyThemePreference(state.theme, false);
  ThemeManager.subscribe((theme) => {
    state = normalizeState({ ...state, theme });
    updateThemeControls();
  });
  planLabel.textContent = state.plan;
  updateProfileChip();
  renderRail();
  profileButton.addEventListener('click', () => setRoute('profile'));
  commandButton.addEventListener('click', openCommandPalette);
  resetOnboarding.addEventListener('click', () => renderOnboarding({ mode: 'edit' }));
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openCommandPalette();
    }
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });
  window.addEventListener('hashchange', () => {
    const nextRoute = location.hash.replace('#', '');
    if (routes.some((route) => route.id === nextRoute) && nextRoute !== activeRoute) {
      setRoute(nextRoute, { syncHash: false });
    }
  });
  const hashRoute = location.hash.replace('#', '');
  setRoute(routes.some((route) => route.id === hashRoute) ? hashRoute : 'dashboard');
  mountCompanion();
  if (!state.auth.profileComplete) {
    renderOnboarding({ mode: 'signup' });
  } else {
    await OnboardingTransition?.revealDashboard({ firstTime: false, focus: false });
  }
}

init();

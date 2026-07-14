(function () {
  const PROFILE_KEY = 'learnovaProfile';
  const AUTH_KEY = 'learnovaAuth';
  const extensionStorage = globalThis.chrome?.storage?.local || null;

  function text(value) {
    return String(value ?? '').trim();
  }

  function toList(value) {
    if (Array.isArray(value)) return value.map((item) => text(item)).filter(Boolean);
    return text(value)
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function normalizeAuth(raw = {}) {
    return {
      isLoggedIn: Boolean(raw.isLoggedIn),
      profileComplete: Boolean(raw.profileComplete),
      email: text(raw.email),
      createdAt: text(raw.createdAt),
    };
  }

  function normalizeStudentProfile(raw = {}) {
    const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const curriculumChoice = text(source.curriculumChoice || source.curriculum);
    const customCurriculum = text(source.customCurriculum);
    const curriculum = curriculumChoice === 'Other' && customCurriculum
      ? customCurriculum
      : text(source.curriculum || customCurriculum || curriculumChoice);
    const yearGroup = text(source.yearGroup || source.grade || source.year);
    const schoolName = text(source.schoolName || source.school);
    const upcomingDeadlines = toList(
      source.upcomingDeadlines || source.upcomingExams || source.deadlines
    );
    const goals = toList(source.goals || source.academicGoals);
    const weakTopics = toList(source.weakTopics || source.weakSubjects);
    const studyStyle = toList(
      source.studyStyle || source.preferredStudyStyle || source.learningPreferences
    );
    const preferredExplanationStyle = text(source.preferredExplanationStyle);
    const universityInterests = text(
      source.universityInterests || source.universityCareerInterests
    );
    const careerInterests = text(source.careerInterests || universityInterests);
    const dailyStudyTime = text(source.dailyStudyTime || source.availableStudyTime);

    return {
      name: text(source.name || source.fullName),
      fullName: text(source.fullName || source.name),
      email: text(source.email),
      grade: text(source.grade || yearGroup),
      yearGroup,
      ageRange: text(source.ageRange),
      countryRegion: text(source.countryRegion || source.country || source.region),
      curriculumChoice: curriculumChoice || curriculum,
      customCurriculum,
      curriculum,
      schoolName,
      school: schoolName,
      subjects: toList(source.subjects),
      targetGrades: text(source.targetGrades),
      upcomingDeadlines,
      upcomingExams: upcomingDeadlines,
      goals,
      academicGoals: goals,
      weakTopics,
      weakSubjects: weakTopics,
      strengths: toList(source.strengths),
      learningPreferences: studyStyle,
      studyStyle,
      preferredStudyStyle: studyStyle,
      preferredExplanationStyle,
      universityInterests,
      careerInterests,
      extracurricularInterests: text(source.extracurricularInterests),
      dailyStudyTime,
      availableStudyTime: dailyStudyTime,
      quizHistory: Array.isArray(source.quizHistory) ? source.quizHistory : [],
      revisionHistory: Array.isArray(source.revisionHistory)
        ? source.revisionHistory
        : toList(source.revisionHistory),
      avatarDataUrl: text(source.avatarDataUrl),
      personalizationEnabled: source.personalizationEnabled !== false,
    };
  }

  async function read(keys) {
    if (extensionStorage) return extensionStorage.get(keys);
    return Object.fromEntries(
      Object.keys(keys).map((key) => {
        try {
          return [key, JSON.parse(localStorage.getItem(key) || 'null') ?? keys[key]];
        } catch {
          return [key, keys[key]];
        }
      })
    );
  }

  async function write(values) {
    if (extensionStorage) return extensionStorage.set(values);
    Object.entries(values).forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
  }

  async function remove(keys) {
    if (extensionStorage) return extensionStorage.remove(keys);
    keys.forEach((key) => localStorage.removeItem(key));
  }

  function announce(profile, auth) {
    globalThis.dispatchEvent?.(
      new CustomEvent('learnova:profile-changed', {
        detail: { profile, auth },
      })
    );
  }

  async function getStudentProfile() {
    const stored = await read({ [PROFILE_KEY]: null, [AUTH_KEY]: null });
    const rawProfile = stored[PROFILE_KEY];
    const profile = normalizeStudentProfile(rawProfile || {});
    const auth = normalizeAuth(stored[AUTH_KEY] || {});
    return {
      profile,
      auth,
      profileLoaded: Boolean(rawProfile && auth.profileComplete),
      personalizationEnabled: Boolean(
        rawProfile && auth.profileComplete && profile.personalizationEnabled
      ),
    };
  }

  async function saveStudentProfile(profile, authChanges = {}) {
    const existing = await getStudentProfile();
    const normalizedProfile = normalizeStudentProfile(profile);
    const normalizedAuth = normalizeAuth({
      ...existing.auth,
      ...authChanges,
      email: normalizedProfile.email || authChanges.email || existing.auth.email,
      isLoggedIn: true,
      profileComplete: true,
      createdAt: existing.auth.createdAt || new Date().toISOString(),
    });
    await write({
      [PROFILE_KEY]: normalizedProfile,
      [AUTH_KEY]: normalizedAuth,
    });
    announce(normalizedProfile, normalizedAuth);
    return { profile: normalizedProfile, auth: normalizedAuth };
  }

  async function updateStudentProfile(changes) {
    const existing = await getStudentProfile();
    return saveStudentProfile(
      { ...existing.profile, ...changes },
      existing.auth
    );
  }

  async function clearStudentProfile() {
    await remove([PROFILE_KEY, AUTH_KEY]);
    const auth = normalizeAuth();
    const profile = normalizeStudentProfile();
    announce(profile, auth);
    return { profile, auth };
  }

  async function getStudentSubjects(profile) {
    const source = profile
      ? normalizeStudentProfile(profile)
      : (await getStudentProfile()).profile;
    return [...new Set(source.subjects.map((subject) => text(subject)).filter(Boolean))];
  }

  async function hasSubject(subject, profile) {
    const target = text(subject).toLowerCase();
    if (!target) return false;
    const subjects = await getStudentSubjects(profile);
    return subjects.some((item) => item.toLowerCase() === target);
  }

  function buildStudentContext(profile) {
    const normalized = normalizeStudentProfile(profile);
    if (!normalized.personalizationEnabled) return {};

    const context = {
      name: normalized.name,
      grade: normalized.grade,
      yearGroup: normalized.yearGroup,
      ageRange: normalized.ageRange,
      countryRegion: normalized.countryRegion,
      curriculum: normalized.curriculum,
      school: normalized.schoolName,
      subjects: normalized.subjects,
      targetGrades: normalized.targetGrades,
      weakTopics: normalized.weakTopics,
      upcomingDeadlines: normalized.upcomingDeadlines,
      academicGoals: normalized.goals,
      preferredStudyStyle: normalized.studyStyle,
      preferredExplanationStyle: normalized.preferredExplanationStyle,
      universityInterests: normalized.universityInterests,
      careerInterests: normalized.careerInterests,
      extracurricularInterests: normalized.extracurricularInterests,
      availableStudyTime: normalized.dailyStudyTime,
      quizHistory: normalized.quizHistory,
      revisionHistory: normalized.revisionHistory,
      personalizationEnabled: true,
    };

    return Object.fromEntries(
      Object.entries(context).filter(([, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== '' && value !== null && value !== undefined;
      })
    );
  }

  function validateStudentProfile(profile, options = {}) {
    const normalized = normalizeStudentProfile(profile);
    const errors = {};
    if (!normalized.name) errors.name = 'Enter your full name so Learnova can personalize your workspace.';
    if (options.requireEmail !== false) {
      if (!normalized.email) errors.email = 'Enter an email address to continue.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
        errors.email = 'Enter an email address in a format like name@example.com.';
      }
    }
    if (!normalized.yearGroup) errors.yearGroup = 'Enter your grade, year, or current level.';
    if (!normalized.curriculum) errors.curriculum = 'Choose your school system, or select Other and describe it.';
    if (normalized.curriculumChoice === 'Other' && !normalized.customCurriculum) {
      errors.customCurriculum = 'Tell us which curriculum or school system you use.';
    }
    if (!normalized.subjects.length) errors.subjects = 'Add at least one subject you are studying.';
    return { valid: Object.keys(errors).length === 0, errors, profile: normalized };
  }

  globalThis.LearnovaProfile = Object.freeze({
    PROFILE_KEY,
    AUTH_KEY,
    toList,
    normalizeAuth,
    normalizeStudentProfile,
    getStudentProfile,
    saveStudentProfile,
    updateStudentProfile,
    clearStudentProfile,
    getStudentSubjects,
    hasSubject,
    buildStudentContext,
    validateStudentProfile,
  });
})();

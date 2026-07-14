(function () {
  const SCHEMA_KEY = 'learnovaDataSchemaVersion';
  const TARGET_SCHEMA_VERSION = 4;
  const extensionStorage = globalThis.chrome?.storage?.local || null;

  const SAMPLE_MATERIAL_TITLES = new Set([
    'Chemistry moles revision sheet',
    'Quadratics class notes',
    'Electric circuits slides',
    'English summary examples',
  ]);
  const SAMPLE_QUIZ_TITLES = new Set(['Quadratics checkpoint', 'Moles basics', 'Energy stores']);
  const SAMPLE_FLASHCARD_FRONTS = new Set([
    'What is Avogadro constant?',
    'What do waves transfer?',
  ]);
  const SAMPLE_REVISION_ENTRIES = new Set([
    'Reviewed Chemistry moles yesterday',
    'Completed Math quadratics flashcards this week',
    'Skipped Physics electricity planner task',
  ]);

  function emptyFocusAnalytics() {
    return {
      todayKey: '',
      todayMinutes: 0,
      byDomain: {},
      weekly: [0, 0, 0, 0, 0, 0, 0],
      monthly: [0, 0, 0, 0, 0, 0, 0, 0],
      focusSessions: [],
      interventions: 0,
      timeSavedWeek: 0,
      mostProductiveDay: '',
    };
  }

  async function read(keys) {
    if (extensionStorage) return extensionStorage.get(keys);
    return Object.fromEntries(Object.entries(keys).map(([key, fallback]) => {
      try {
        return [key, JSON.parse(localStorage.getItem(key) || 'null') ?? fallback];
      } catch {
        return [key, fallback];
      }
    }));
  }

  async function write(values) {
    if (extensionStorage) return extensionStorage.set(values);
    Object.entries(values).forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
  }

  function isRealQuizRecord(record = {}) {
    return Boolean(record.id || record.completedAt || record.timestamp) && Number.isFinite(Number(record.score));
  }

  function quizEvent(record = {}) {
    return {
      eventId: `migration-quiz-${record.id || encodeURIComponent(`${record.title}-${record.completedAt || record.timestamp}`)}`,
      type: 'QUIZ_COMPLETED',
      timestamp: record.completedAt || record.timestamp || new Date().toISOString(),
      subject: record.subject || '',
      topic: record.topic || '',
      studySetId: record.studySetId || '',
      score: Number(record.score),
      result: `${record.correct ?? ''}/${record.total ?? ''}`,
      metadata: {
        migrated: true,
        title: record.title || 'Completed quiz',
        correct: record.correct ?? null,
        total: record.total ?? null,
      },
    };
  }

  function isKnownSampleFocus(analytics = {}) {
    return Number(analytics.todayMinutes) === 0 &&
      Number(analytics.byDomain?.['youtube.com']) === 31 &&
      Number(analytics.timeSavedWeek) === 75;
  }

  async function run() {
    const stored = await read({
      [SCHEMA_KEY]: 0,
      learnovaState: {},
      learnovaFocus: null,
    });
    if (Number(stored[SCHEMA_KEY]) >= TARGET_SCHEMA_VERSION) {
      return { migrated: false, version: TARGET_SCHEMA_VERSION };
    }

    const legacyState = stored.learnovaState && typeof stored.learnovaState === 'object'
      ? stored.learnovaState
      : {};
    const existingStudySets = await globalThis.LearnovaStudySets.getStudySets();
    const legacyUploads = [
      ...(Array.isArray(legacyState.studySets) ? legacyState.studySets : []),
      ...(Array.isArray(legacyState.assistantUploads) ? legacyState.assistantUploads : []),
    ];
    const legacyMaterials = (Array.isArray(legacyState.materials) ? legacyState.materials : [])
      .filter((item) => !SAMPLE_MATERIAL_TITLES.has(String(item?.title || '').trim()))
      .map((item) => ({
        ...item,
        sourceType: item.sourceType || 'legacy_upload',
        processingStatus: item.processingStatus || 'Uploaded - processing unavailable',
        extractionStatus: item.extractedText ? 'extracted' : 'unavailable',
        sourceAvailable: Boolean(item.sourceAvailable || item.extractedText),
        activityStatus: item.activityStatus || 'Not started',
      }));
    const migratedStudySets = await globalThis.LearnovaStudySets.saveStudySets([
      ...existingStudySets,
      ...legacyUploads,
      ...legacyMaterials,
    ]);

    const existingEvents = await globalThis.LearnovaActivity.getEvents();
    const legacyQuizzes = [
      ...(Array.isArray(legacyState.previousQuizzes) ? legacyState.previousQuizzes : []),
      ...(Array.isArray(legacyState.studentProfile?.quizHistory) ? legacyState.studentProfile.quizHistory : []),
    ];
    const realQuizRecords = legacyQuizzes.filter(isRealQuizRecord);
    const migratedEvents = await globalThis.LearnovaActivity.saveEvents([
      ...existingEvents,
      ...realQuizRecords.map(quizEvent),
    ]);

    const realPreviousQuizzes = (Array.isArray(legacyState.previousQuizzes) ? legacyState.previousQuizzes : [])
      .filter((item) => isRealQuizRecord(item) && !SAMPLE_QUIZ_TITLES.has(String(item.title || '').trim()));
    const realFlashcards = (Array.isArray(legacyState.flashcardMemory) ? legacyState.flashcardMemory : [])
      .filter((item) => !SAMPLE_FLASHCARD_FRONTS.has(String(item?.front || '').trim()));
    const focus = stored.learnovaFocus || legacyState.focus || null;
    const cleanedFocus = focus && isKnownSampleFocus(focus.analytics)
      ? { ...focus, analytics: emptyFocusAnalytics() }
      : focus;
    const browserContext = legacyState.browserContext?.url === 'https://example.com/physics/waves'
      ? {}
      : (legacyState.browserContext || {});

    const storedProfile = await globalThis.LearnovaProfile.getStudentProfile();
    if (storedProfile.profileLoaded) {
      const quizHistory = storedProfile.profile.quizHistory.filter(
        (item) => !SAMPLE_QUIZ_TITLES.has(String(item?.title || '').trim()) || isRealQuizRecord(item)
      );
      const revisionHistory = storedProfile.profile.revisionHistory.filter(
        (item) => !SAMPLE_REVISION_ENTRIES.has(String(item).trim())
      );
      if (
        quizHistory.length !== storedProfile.profile.quizHistory.length ||
        revisionHistory.length !== storedProfile.profile.revisionHistory.length
      ) {
        await globalThis.LearnovaProfile.saveStudentProfile(
          { ...storedProfile.profile, quizHistory, revisionHistory },
          storedProfile.auth
        );
      }
    }

    const cleanedState = {
      ...legacyState,
      materials: [],
      assistantUploads: migratedStudySets,
      studySets: migratedStudySets,
      mastery: [],
      activityEvents: migratedEvents,
      previousQuizzes: realPreviousQuizzes,
      flashcardMemory: realFlashcards,
      browserContext,
      ...(cleanedFocus ? { focus: cleanedFocus } : {}),
    };

    await write({
      [SCHEMA_KEY]: TARGET_SCHEMA_VERSION,
      learnovaState: cleanedState,
      ...(cleanedFocus ? { learnovaFocus: cleanedFocus } : {}),
      learnovaBrowserContext: browserContext,
    });

    return {
      migrated: true,
      version: TARGET_SCHEMA_VERSION,
      studySetCount: migratedStudySets.length,
      activityEventCount: migratedEvents.length,
    };
  }

  globalThis.LearnovaDataMigration = Object.freeze({
    SCHEMA_KEY,
    TARGET_SCHEMA_VERSION,
    run,
  });
})();

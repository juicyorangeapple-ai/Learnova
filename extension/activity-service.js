(function () {
  const STORAGE_KEY = 'learnovaActivityEvents';
  const extensionStorage = globalThis.chrome?.storage?.local || null;

  const EVENT_TYPES = Object.freeze({
    QUIZ_COMPLETED: 'QUIZ_COMPLETED',
    QUIZ_ANSWER_CORRECT: 'QUIZ_ANSWER_CORRECT',
    QUIZ_ANSWER_INCORRECT: 'QUIZ_ANSWER_INCORRECT',
    FLASHCARD_REVIEWED: 'FLASHCARD_REVIEWED',
    FLASHCARD_MASTERED: 'FLASHCARD_MASTERED',
    STUDY_SESSION_COMPLETED: 'STUDY_SESSION_COMPLETED',
    STUDY_SET_OPENED: 'STUDY_SET_OPENED',
    TOPIC_MARKED_COMPLETE: 'TOPIC_MARKED_COMPLETE',
  });

  const VALID_TYPES = new Set(Object.values(EVENT_TYPES));

  function text(value) {
    return String(value ?? '').trim();
  }

  function numberOrNull(value) {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function createId(prefix = 'activity') {
    if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function normalizeEvent(raw = {}) {
    const type = text(raw.type).toUpperCase();
    if (!VALID_TYPES.has(type)) return null;
    const score = numberOrNull(raw.score);
    const duration = numberOrNull(raw.duration);
    return {
      eventId: text(raw.eventId || raw.id) || createId(),
      type,
      timestamp: text(raw.timestamp || raw.completedAt) || new Date().toISOString(),
      subject: text(raw.subject),
      topic: text(raw.topic),
      studySetId: text(raw.studySetId),
      score: score === null ? null : Math.max(0, Math.min(100, score)),
      result: text(raw.result),
      duration: duration === null ? null : Math.max(0, duration),
      metadata: raw.metadata && typeof raw.metadata === 'object' && !Array.isArray(raw.metadata)
        ? { ...raw.metadata }
        : {},
    };
  }

  async function read() {
    if (extensionStorage) {
      const stored = await extensionStorage.get({ [STORAGE_KEY]: [] });
      return stored[STORAGE_KEY];
    }
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  async function write(events) {
    if (extensionStorage) return extensionStorage.set({ [STORAGE_KEY]: events });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }

  async function getEvents() {
    const stored = await read();
    return (Array.isArray(stored) ? stored : [])
      .map(normalizeEvent)
      .filter(Boolean)
      .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp));
  }

  async function saveEvents(events) {
    const normalized = (Array.isArray(events) ? events : []).map(normalizeEvent).filter(Boolean);
    const deduplicated = [...new Map(normalized.map((event) => [event.eventId, event])).values()]
      .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp));
    await write(deduplicated);
    globalThis.dispatchEvent?.(new CustomEvent('learnova:activity-changed', { detail: deduplicated }));
    return deduplicated;
  }

  async function recordEvents(events) {
    const current = await getEvents();
    return saveEvents([...(Array.isArray(events) ? events : []), ...current]);
  }

  async function recordEvent(event) {
    const normalized = normalizeEvent(event);
    if (!normalized) throw new Error('A recognized activity event type is required.');
    await recordEvents([normalized]);
    return normalized;
  }

  async function clearEvents() {
    await write([]);
    globalThis.dispatchEvent?.(new CustomEvent('learnova:activity-changed', { detail: [] }));
  }

  function topicKey(subject, topic) {
    return `${text(subject).toLowerCase()}::${text(topic).toLowerCase()}`;
  }

  function calculateTopicProgress(events = []) {
    const groups = new Map();
    (Array.isArray(events) ? events : []).map(normalizeEvent).filter(Boolean).forEach((event) => {
      if (!event.subject) return;
      const topic = event.topic || 'General';
      const key = topicKey(event.subject, topic);
      const group = groups.get(key) || {
        subject: event.subject,
        topic,
        correct: 0,
        incorrect: 0,
        quizScores: [],
        masteredCards: 0,
        reviewedCards: 0,
        completed: false,
        eventCount: 0,
        lastActivityAt: '',
      };

      group.eventCount += 1;
      if (!group.lastActivityAt || new Date(event.timestamp) > new Date(group.lastActivityAt)) {
        group.lastActivityAt = event.timestamp;
      }
      if (event.type === EVENT_TYPES.QUIZ_ANSWER_CORRECT) group.correct += 1;
      if (event.type === EVENT_TYPES.QUIZ_ANSWER_INCORRECT) group.incorrect += 1;
      if (event.type === EVENT_TYPES.QUIZ_COMPLETED && event.score !== null) group.quizScores.push(event.score);
      if (event.type === EVENT_TYPES.FLASHCARD_REVIEWED) group.reviewedCards += 1;
      if (event.type === EVENT_TYPES.FLASHCARD_MASTERED) group.masteredCards += 1;
      if (event.type === EVENT_TYPES.TOPIC_MARKED_COMPLETE) group.completed = true;
      groups.set(key, group);
    });

    return [...groups.values()].flatMap((group) => {
      const answered = group.correct + group.incorrect;
      let score = null;
      let source = '';
      if (answered > 0) {
        score = Math.round((group.correct / answered) * 100);
        source = `${answered} quiz answer${answered === 1 ? '' : 's'}`;
      } else if (group.quizScores.length) {
        score = Math.round(group.quizScores.reduce((sum, value) => sum + value, 0) / group.quizScores.length);
        source = `${group.quizScores.length} completed quiz${group.quizScores.length === 1 ? '' : 'zes'}`;
      } else if (group.completed) {
        score = 100;
        source = 'Marked complete';
      } else if (group.reviewedCards > 0 && group.masteredCards > 0) {
        score = Math.round((group.masteredCards / group.reviewedCards) * 100);
        source = `${group.reviewedCards} flashcard review${group.reviewedCards === 1 ? '' : 's'}`;
      }

      if (score === null) return [];
      return [{ ...group, score, source }];
    }).sort((left, right) => left.score - right.score);
  }

  function summarize(events = []) {
    const normalized = (Array.isArray(events) ? events : []).map(normalizeEvent).filter(Boolean);
    const progress = calculateTopicProgress(normalized);
    const completedQuizzes = normalized.filter((event) => event.type === EVENT_TYPES.QUIZ_COMPLETED);
    const completedSessions = normalized.filter((event) => event.type === EVENT_TYPES.STUDY_SESSION_COMPLETED);
    const averageQuizScore = completedQuizzes.length
      ? Math.round(completedQuizzes.reduce((sum, event) => sum + (event.score || 0), 0) / completedQuizzes.length)
      : null;
    return {
      progress,
      weakTopics: progress.filter((item) => item.score < 70),
      strongTopics: progress.filter((item) => item.score >= 80),
      completedQuizCount: completedQuizzes.length,
      completedSessionCount: completedSessions.length,
      averageQuizScore,
    };
  }

  globalThis.LearnovaActivity = Object.freeze({
    STORAGE_KEY,
    EVENT_TYPES,
    normalizeEvent,
    getEvents,
    saveEvents,
    recordEvent,
    recordEvents,
    clearEvents,
    calculateTopicProgress,
    summarize,
  });
})();

(function () {
  const STORAGE_KEY = 'learnovaStudySets';
  const extensionStorage = globalThis.chrome?.storage?.local || null;

  function text(value) {
    return String(value ?? '').trim();
  }

  function list(value) {
    if (Array.isArray(value)) return value.map(text).filter(Boolean);
    return text(value).split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
  }

  function createId() {
    if (globalThis.crypto?.randomUUID) return `study-set-${globalThis.crypto.randomUUID()}`;
    return `study-set-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function displayTitleFromFilename(filename) {
    return text(filename).replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Untitled study set';
  }

  function normalizeStudySet(raw = {}) {
    const studySetId = text(raw.studySetId || raw.id) || createId();
    const originalFilename = text(raw.originalFilename || raw.name || raw.title);
    const detectedTopics = list(raw.detectedTopics || raw.topics || raw.topic);
    const subject = text(raw.subject || raw.detectedSubject);
    const topic = text(raw.topic) || detectedTopics[0] || '';
    const uploadedAt = text(raw.uploadedAt || raw.uploadTimestamp || raw.addedAt) || new Date().toISOString();
    const processingStatus = text(raw.processingStatus || raw.status) || 'ready';
    const extractionStatus = text(raw.extractionStatus) || (raw.extractedText ? 'extracted' : 'available_on_request');
    return {
      studySetId,
      id: studySetId,
      originalFilename,
      name: originalFilename,
      displayTitle: text(raw.displayTitle || raw.title) || displayTitleFromFilename(originalFilename),
      title: text(raw.displayTitle || raw.title) || displayTitleFromFilename(originalFilename),
      fileType: text(raw.fileType || raw.type) || 'File',
      type: text(raw.fileType || raw.type) || 'File',
      fileSize: Number.isFinite(Number(raw.fileSize ?? raw.size)) ? Number(raw.fileSize ?? raw.size) : 0,
      size: Number.isFinite(Number(raw.fileSize ?? raw.size)) ? Number(raw.fileSize ?? raw.size) : 0,
      uploadedAt,
      addedAt: uploadedAt,
      subject,
      detectedSubject: subject,
      topic,
      detectedTopics,
      processingStatus,
      status: processingStatus,
      extractionStatus,
      extractedText: text(raw.extractedText).slice(0, 20_000),
      sourceType: text(raw.sourceType) || 'upload',
      sourceAvailable: raw.sourceAvailable !== false,
      activityStatus: text(raw.activityStatus) || 'Not started',
      lastStudiedAt: text(raw.lastStudiedAt || raw.lastStudiedDate),
      errorMessage: text(raw.errorMessage),
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

  async function write(studySets) {
    if (extensionStorage) return extensionStorage.set({ [STORAGE_KEY]: studySets });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(studySets));
  }

  async function getStudySets() {
    const stored = await read();
    return (Array.isArray(stored) ? stored : [])
      .map(normalizeStudySet)
      .sort((left, right) => new Date(right.uploadedAt) - new Date(left.uploadedAt));
  }

  async function saveStudySets(studySets) {
    const normalized = (Array.isArray(studySets) ? studySets : []).map(normalizeStudySet);
    const deduplicated = [...new Map(normalized.map((item) => [item.studySetId, item])).values()]
      .sort((left, right) => new Date(right.uploadedAt) - new Date(left.uploadedAt));
    await write(deduplicated);
    globalThis.dispatchEvent?.(new CustomEvent('learnova:study-sets-changed', { detail: deduplicated }));
    return deduplicated;
  }

  async function upsertStudySet(studySet) {
    const normalized = normalizeStudySet(studySet);
    const current = await getStudySets();
    return saveStudySets([normalized, ...current.filter((item) => item.studySetId !== normalized.studySetId)]);
  }

  async function updateStudySet(studySetId, changes) {
    const current = await getStudySets();
    const existing = current.find((item) => item.studySetId === String(studySetId));
    if (!existing) throw new Error('Study set not found.');
    const updated = normalizeStudySet({ ...existing, ...changes, studySetId: existing.studySetId });
    await saveStudySets(current.map((item) => item.studySetId === updated.studySetId ? updated : item));
    return updated;
  }

  async function removeStudySet(studySetId) {
    const current = await getStudySets();
    const next = current.filter((item) => item.studySetId !== String(studySetId));
    await saveStudySets(next);
    return next;
  }

  globalThis.LearnovaStudySets = Object.freeze({
    STORAGE_KEY,
    normalizeStudySet,
    getStudySets,
    saveStudySets,
    upsertStudySet,
    updateStudySet,
    removeStudySet,
  });
})();

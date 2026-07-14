import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const ROOT = new URL('../', import.meta.url);
const SERVICE_FILES = [
  'extension/profile-service.js',
  'extension/study-set-service.js',
  'extension/activity-service.js',
  'extension/study-material-service.js',
  'extension/data-migration.js',
];

function storageArea(backing) {
  return {
    async get(defaults = {}) {
      if (Array.isArray(defaults)) {
        return Object.fromEntries(defaults.map((key) => [key, backing[key]]));
      }
      return Object.fromEntries(
        Object.entries(defaults).map(([key, fallback]) => [key, key in backing ? backing[key] : fallback])
      );
    },
    async set(values) {
      Object.assign(backing, structuredClone(values));
    },
    async remove(keys) {
      for (const key of keys) delete backing[key];
    },
  };
}

async function runtime(backing = {}) {
  class CustomEvent {
    constructor(type, options = {}) {
      this.type = type;
      this.detail = options.detail;
    }
  }
  const context = vm.createContext({
    chrome: { storage: { local: storageArea(backing) } },
    console,
    crypto,
    Blob,
    File,
    Date,
    Math,
    Map,
    Set,
    URL,
    CustomEvent,
    dispatchEvent() {},
    structuredClone,
  });
  context.globalThis = context;
  for (const file of SERVICE_FILES) {
    const source = await readFile(new URL(file, ROOT), 'utf8');
    vm.runInContext(source, context, { filename: file });
  }
  return context;
}

test('a clean user has no study sets, activity, subjects, or progress', async () => {
  const context = await runtime();
  const stored = await context.LearnovaProfile.getStudentProfile();
  assert.equal(stored.profileLoaded, false);
  assert.deepEqual([...stored.profile.subjects], []);
  assert.deepEqual([...(await context.LearnovaStudySets.getStudySets())], []);
  assert.deepEqual([...(await context.LearnovaActivity.getEvents())], []);
  assert.deepEqual([...context.LearnovaActivity.calculateTopicProgress([])], []);
});

test('the onboarding profile remains the single source of selected subjects', async () => {
  const backing = {};
  const context = await runtime(backing);
  await context.LearnovaProfile.saveStudentProfile({
    name: 'Test Student',
    email: 'test@example.com',
    yearGroup: 'Year 10',
    curriculum: 'IGCSE',
    subjects: ['Chemistry', 'Mathematics', 'English'],
    weakTopics: ['Moles'],
  });
  assert.deepEqual([...(await context.LearnovaProfile.getStudentSubjects())], ['Chemistry', 'Mathematics', 'English']);
  assert.equal(await context.LearnovaProfile.hasSubject('Chemistry'), true);
  assert.equal(await context.LearnovaProfile.hasSubject('Physics'), false);
});

test('study-set metadata survives a fresh extension runtime', async () => {
  const backing = {};
  const firstRuntime = await runtime(backing);
  await firstRuntime.LearnovaStudySets.upsertStudySet({
    studySetId: 'study-set-chemistry',
    originalFilename: 'chemistry-moles.txt',
    displayTitle: 'Chemistry moles',
    fileType: 'text/plain',
    fileSize: 240,
    subject: 'Chemistry',
    topic: 'Moles',
    detectedTopics: ['Moles'],
    processingStatus: 'Study set ready',
    extractionStatus: 'extracted',
    extractedText: 'One mole contains Avogadro constant particles.',
    activityStatus: 'Not started',
  });

  const restartedRuntime = await runtime(backing);
  const [studySet] = await restartedRuntime.LearnovaStudySets.getStudySets();
  assert.equal(studySet.studySetId, 'study-set-chemistry');
  assert.equal(studySet.subject, 'Chemistry');
  assert.equal(studySet.activityStatus, 'Not started');
  assert.equal(studySet.extractedText, 'One mole contains Avogadro constant particles.');
});

test('uploading or opening a study set does not create a mastery percentage', async () => {
  const context = await runtime();
  const events = await context.LearnovaActivity.recordEvents([{
    type: 'STUDY_SET_OPENED',
    subject: 'Chemistry',
    topic: 'Moles',
    studySetId: 'study-set-chemistry',
  }]);
  assert.deepEqual([...context.LearnovaActivity.calculateTopicProgress(events)], []);
});

test('quiz answers create persistent, event-derived progress', async () => {
  const backing = {};
  const context = await runtime(backing);
  await context.LearnovaActivity.recordEvents([
    { type: 'QUIZ_ANSWER_CORRECT', subject: 'Chemistry', topic: 'Moles', studySetId: 'study-set-chemistry' },
    { type: 'QUIZ_ANSWER_CORRECT', subject: 'Chemistry', topic: 'Moles', studySetId: 'study-set-chemistry' },
    { type: 'QUIZ_ANSWER_INCORRECT', subject: 'Chemistry', topic: 'Moles', studySetId: 'study-set-chemistry' },
    { type: 'QUIZ_COMPLETED', subject: 'Chemistry', topic: 'Moles', studySetId: 'study-set-chemistry', score: 67 },
  ]);

  const restartedRuntime = await runtime(backing);
  const events = await restartedRuntime.LearnovaActivity.getEvents();
  const [progress] = restartedRuntime.LearnovaActivity.calculateTopicProgress(events);
  assert.equal(progress.subject, 'Chemistry');
  assert.equal(progress.topic, 'Moles');
  assert.equal(progress.score, 67);
  assert.equal(progress.correct, 2);
  assert.equal(progress.incorrect, 1);
});

test('migration removes known samples while retaining a real upload and quiz', async () => {
  const backing = {
    learnovaState: {
      materials: [
        { title: 'Chemistry moles revision sheet', subject: 'Chemistry', type: 'PDF', topic: 'Moles' },
      ],
      assistantUploads: [{
        id: 'real-upload',
        name: 'my-moles-notes.txt',
        type: 'text/plain',
        detectedSubject: 'Chemistry',
        detectedTopics: ['Moles'],
        extractedText: 'Moles equal mass divided by molar mass.',
        status: 'Ready for an AI quiz',
      }],
      mastery: [{ subject: 'Chemistry', topic: 'Moles', score: 42 }],
      previousQuizzes: [
        { title: 'Moles basics', subject: 'Chemistry', topic: 'Moles', score: 62 },
        { id: 'real-quiz', title: 'My moles quiz', subject: 'Chemistry', topic: 'Moles', score: 80, completedAt: '2026-07-14T12:00:00.000Z' },
      ],
    },
  };
  const context = await runtime(backing);
  const result = await context.LearnovaDataMigration.run();
  assert.equal(result.migrated, true);
  const sets = await context.LearnovaStudySets.getStudySets();
  assert.equal(sets.length, 1);
  assert.equal(sets[0].studySetId, 'real-upload');
  const events = await context.LearnovaActivity.getEvents();
  assert.equal(events.filter((event) => event.type === 'QUIZ_COMPLETED').length, 1);
  assert.deepEqual(backing.learnovaState.mastery, []);
  assert.equal(backing.learnovaState.materials.length, 0);
});

test('content detection recognizes a Chemistry moles upload without adding unrelated courses', async () => {
  const context = await runtime();
  const detected = context.LearnovaStudyMaterials.detectStudyContext(
    'chemistry-moles.txt',
    'Calculate moles using molar mass and Avogadro constant.'
  );
  assert.equal(detected.detectedSubject, 'Chemistry');
  assert.equal(detected.detectedTopics[0], 'Moles');
});

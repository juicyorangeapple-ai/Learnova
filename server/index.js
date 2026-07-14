import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import OpenAI from 'openai';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local development reads the project-root file. Deployed hosts supply process.env directly.
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local'), quiet: true });
dotenv.config({ quiet: true });

const app = express();
const port = positiveInteger(process.env.PORT, 3001, 65_535);
const model = String(process.env.OPENAI_MODEL || 'gpt-4.1-mini').trim();
const apiKey = String(process.env.OPENAI_API_KEY || '').trim();
const openAITimeoutMs = positiveInteger(process.env.OPENAI_TIMEOUT_MS, 30_000, 60_000);
const maxOutputTokens = positiveInteger(process.env.OPENAI_MAX_OUTPUT_TOKENS, 700, 1_200);
const quizMaxOutputTokens = positiveInteger(process.env.OPENAI_QUIZ_MAX_OUTPUT_TOKENS, 3_200, 5_000);
const rateLimitWindowMs = positiveInteger(process.env.RATE_LIMIT_WINDOW_MS, 10 * 60 * 1000, 60 * 60 * 1000);
const rateLimitMax = positiveInteger(process.env.RATE_LIMIT_MAX, 30, 500);
const trustProxyHops = positiveInteger(process.env.TRUST_PROXY_HOPS, 1, 10);

const LIMITS = Object.freeze({
  jsonBody: '64kb',
  messageCharacters: 4_000,
  historyEntries: 12,
  historyEntryCharacters: 2_000,
  listEntries: 20,
  contextDepth: 4,
  contextKeys: 40,
  contextArrayEntries: 24,
  contextStringCharacters: 2_000,
  contextSerializedCharacters: 18_000,
  quizQuestions: 8,
  quizFiles: 3,
  quizFileBytes: 10 * 1024 * 1024,
  quizExtractedTextCharacters: 16_000,
});

const DEFAULT_ALLOWED_ORIGINS = [
  'http://127.0.0.1:8787',
  'http://localhost:8787',
];
const allowedOrigins = new Set([
  ...DEFAULT_ALLOWED_ORIGINS,
  ...commaSeparated(process.env.ALLOWED_ORIGINS),
]);
const allowedExtensionIds = new Set(commaSeparated(process.env.ALLOWED_EXTENSION_IDS));
const allowAnyChromeExtension = booleanFromEnv(process.env.ALLOW_ANY_CHROME_EXTENSION, true);
const isProduction = process.env.NODE_ENV === 'production';
const deploymentCommit = String(process.env.RENDER_GIT_COMMIT || '').trim().slice(0, 12) || null;

app.disable('x-powered-by');
app.set('trust proxy', trustProxyHops);
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Request-ID', crypto.randomUUID());
  next();
});
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      const error = new Error('Origin is not allowed.');
      error.code = 'CORS_NOT_ALLOWED';
      callback(error);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    maxAge: 600,
  })
);
app.use(express.json({ limit: LIMITS.jsonBody, strict: true }));

const chatRateLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  limit: rateLimitMax,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'Too many AI requests. Please wait a few minutes and try again.',
    code: 'RATE_LIMITED',
  },
});

const acceptedQuizExtensions = new Set(['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.webp', '.gif']);
const quizUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: LIMITS.quizFiles,
    fileSize: LIMITS.quizFileBytes,
    fields: 4,
    fieldSize: 64 * 1024,
  },
  fileFilter(req, file, callback) {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const acceptedType =
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'text/plain' ||
      file.mimetype?.startsWith('image/');
    callback(null, acceptedType || acceptedQuizExtensions.has(extension));
  },
});

const SYSTEM_INSTRUCTIONS = `
You are Learnova Assistant, a calm and encouraging AI study coach for students across middle school, high school, college, university, and homeschool settings.
Use the provided student profile, weak topics, saved materials, uploaded-file metadata, and browser context when relevant.
Keep responses concise, useful, and student-facing. Never shame the student.
Do not assume a country, age, grade system, curriculum, or level that was not supplied.
If the student asks for quizzes, flashcards, revision plans, explanations, essay help, motivation, or study strategy, give practical next steps.
Treat uploaded-file metadata as metadata. Use extracted text only when it is explicitly present in the request.
This prototype does not connect to real school systems, Google Drive, Calendar, Notion, or private accounts.
Do not reveal private profile fields such as email unless the student explicitly asks about their account details.
`;

const QUIZ_SYSTEM_INSTRUCTIONS = `
You are Learnova's assessment generator. Create a quiz about the student's actual academic content, never a generic study-skills quiz.
Ground every question in the supplied files, extracted text, file title, detected subject, detected topics, or an explicit subject/topic entered by the student.
Never ask about revision strategies, learning methods, time management, or study habits unless the source material itself is about those topics.
Adapt terminology, command words, depth, and calculations to the supplied curriculum and level. Do not assume a curriculum that was not supplied.
Test a useful mix of recall, understanding, and application. Avoid repeated questions and duplicate answer choices.
Use calculation questions for quantitative material when appropriate. For literature, test the actual work, characters, themes, language, plot, symbolism, and analysis present in the source.
Each question must include a correct answer and a concise teaching explanation. Do not fabricate quotations, source facts, or profile details.
When four or more questions are requested, use at least three suitable question types unless the material genuinely supports fewer.
`;

const QUIZ_QUESTION_TYPES = [
  'multiple_choice',
  'true_false',
  'fill_blank',
  'short_answer',
  'calculation',
  'matching',
  'definition',
  'scenario',
];

const QUIZ_RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'title',
    'subject',
    'topics',
    'curriculum',
    'sourceSummary',
    'needsClarification',
    'clarificationQuestion',
    'questions',
  ],
  properties: {
    title: { type: 'string' },
    subject: { type: 'string' },
    topics: { type: 'array', items: { type: 'string' } },
    curriculum: { type: 'string' },
    sourceSummary: { type: 'string' },
    needsClarification: { type: 'boolean' },
    clarificationQuestion: { type: 'string' },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'type',
          'question',
          'options',
          'answer',
          'acceptableAnswers',
          'explanation',
          'topic',
          'difficulty',
        ],
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: QUIZ_QUESTION_TYPES },
          question: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
          answer: { type: 'string' },
          acceptableAnswers: { type: 'array', items: { type: 'string' } },
          explanation: { type: 'string' },
          topic: { type: 'string' },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
        },
      },
    },
  },
};

function positiveInteger(value, fallback, maximum) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, maximum);
}

function booleanFromEnv(value, fallback) {
  if (value === undefined || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

function commaSeparated(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isAllowedOrigin(origin) {
  // Requests without an Origin header include curl and server-to-server health checks.
  if (!origin) return true;
  if (!isProduction && origin === 'null') return true;
  if (allowedOrigins.has(origin)) return true;

  try {
    const parsed = new URL(origin);
    if (
      !isProduction &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
      (parsed.protocol === 'http:' || parsed.protocol === 'https:')
    ) {
      return true;
    }
    if (parsed.protocol !== 'chrome-extension:') return false;
    const extensionId = parsed.hostname;
    if (!/^[a-p]{32}$/.test(extensionId)) return false;
    return allowAnyChromeExtension || allowedExtensionIds.has(extensionId);
  } catch {
    return false;
  }
}

function createOpenAIClient() {
  if (!apiKey || apiKey === 'your_key_here') return null;
  return new OpenAI({
    apiKey,
    timeout: openAITimeoutMs,
    maxRetries: 1,
  });
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeList(value, limit = LIMITS.listEntries) {
  const items = Array.isArray(value) ? value : String(value || '').split(/[\n,]/);
  return items
    .map((item) => safeText(item, 300))
    .filter(Boolean)
    .slice(0, limit);
}

function safeText(value, max = 500) {
  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') return '';
  return String(value).trim().slice(0, max);
}

function sanitizeStructuredValue(value, depth = 0) {
  if (depth > LIMITS.contextDepth || value === null || value === undefined) return null;
  if (typeof value === 'string') return safeText(value, LIMITS.contextStringCharacters);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    return value
      .slice(0, LIMITS.contextArrayEntries)
      .map((item) => sanitizeStructuredValue(item, depth + 1));
  }
  if (typeof value !== 'object') return null;

  return Object.fromEntries(
    Object.entries(value)
      .slice(0, LIMITS.contextKeys)
      .map(([key, item]) => [safeText(key, 80), sanitizeStructuredValue(item, depth + 1)])
      .filter(([key]) => Boolean(key))
  );
}

function boundedContext(value) {
  const sanitized = sanitizeStructuredValue(value) || {};
  const serialized = JSON.stringify(sanitized);
  if (serialized.length <= LIMITS.contextSerializedCharacters) return sanitized;
  return {
    notice: 'Attached context was shortened to fit the demo request limit.',
    preview: serialized.slice(0, LIMITS.contextSerializedCharacters),
  };
}

function normalizeStudentProfile(profile = {}) {
  const safeProfile = profile && typeof profile === 'object' && !Array.isArray(profile) ? profile : {};
  return {
    name: safeText(safeProfile.name, 120),
    grade: safeText(safeProfile.grade, 80),
    yearGroup: safeText(safeProfile.yearGroup || safeProfile.year, 80),
    ageRange: safeText(safeProfile.ageRange, 80),
    countryRegion: safeText(
      safeProfile.countryRegion || safeProfile.country || safeProfile.region,
      120
    ),
    curriculum: safeText(safeProfile.curriculum, 120),
    school: safeText(safeProfile.school || safeProfile.schoolName, 160),
    subjects: safeList(safeProfile.subjects),
    targetGrades: safeText(safeProfile.targetGrades, 160),
    weakTopics: safeList(safeProfile.weakTopics || safeProfile.weakSubjects),
    upcomingDeadlines: safeList(
      safeProfile.upcomingDeadlines || safeProfile.upcomingExams || safeProfile.deadlines
    ),
    academicGoals: safeList(safeProfile.academicGoals || safeProfile.goals),
    preferredStudyStyle: safeList(
      safeProfile.preferredStudyStyle || safeProfile.studyStyle || safeProfile.learningPreferences
    ),
    preferredExplanationStyle: safeText(safeProfile.preferredExplanationStyle, 180),
    universityInterests: safeText(safeProfile.universityInterests, 220),
    careerInterests: safeText(safeProfile.careerInterests || safeProfile.universityInterests, 220),
    extracurricularInterests: safeText(safeProfile.extracurricularInterests, 220),
    availableStudyTime: safeText(
      safeProfile.availableStudyTime || safeProfile.dailyStudyTime,
      120
    ),
  };
}

function normalizeConversationHistory(value) {
  if (!Array.isArray(value)) return null;
  return value.slice(-LIMITS.historyEntries).map((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
    const role = entry.role === 'assistant' ? 'assistant' : entry.role === 'user' ? 'user' : null;
    const content = safeText(entry.content, LIMITS.historyEntryCharacters);
    return role && content ? { role, content } : null;
  }).filter(Boolean);
}

function buildSystemInstructions(studentProfile) {
  const profile = normalizeStudentProfile(studentProfile);
  const hasProfile = Object.values(profile).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  );
  return [
    SYSTEM_INSTRUCTIONS.trim(),
    '',
    hasProfile
      ? 'Hidden student profile context for personalization:'
      : 'No student profile context is available for this request.',
    JSON.stringify(profile, null, 2),
    '',
    hasProfile
      ? 'Use profile details naturally when they are relevant to the request. Adapt terminology, question style, and study recommendations to the supplied curriculum, subjects, goals, weak topics, preferences, deadlines, and available time.'
      : 'Respond as a capable general study assistant. Ask one short clarification when important academic context is missing.',
    'Never invent profile details that were not supplied.',
    'Do not repeat or summarize the full profile unless the student explicitly asks.',
    'When the student asks what to study, recommend a specific next session using only the available signals.',
  ].join('\n');
}

function textFromResponse(response) {
  if (response.output_text) return response.output_text;
  return safeArray(response.output)
    .flatMap((item) => safeArray(item.content))
    .map((content) => content.text || '')
    .filter(Boolean)
    .join('\n')
    .trim();
}

function buildPrompt({ message, conversationHistory, attachedContext, studentProfile }) {
  return [
    'Student message:',
    message,
    '',
    'Recent conversation history:',
    JSON.stringify(conversationHistory, null, 2),
    '',
    'Student profile context:',
    JSON.stringify(normalizeStudentProfile(studentProfile), null, 2),
    '',
    'Attached Learnova study context:',
    JSON.stringify(attachedContext, null, 2),
  ].join('\n');
}

function requestError(status, error, code) {
  return { status, body: { error, code } };
}

function classifyOpenAIError(error) {
  const status = Number(error?.status || 0);
  const name = String(error?.name || 'OpenAIError');
  if (status === 401 || status === 403) {
    return requestError(503, 'Learnova AI is temporarily unavailable.', 'AI_SERVICE_UNAVAILABLE');
  }
  if (status === 429) {
    return requestError(429, 'Learnova AI is busy. Please wait a moment and try again.', 'AI_BUSY');
  }
  if (status === 408 || name === 'APIConnectionTimeoutError' || name === 'AbortError') {
    return requestError(504, 'Learnova AI took too long to respond. Please try again.', 'AI_TIMEOUT');
  }
  return requestError(502, 'Learnova could not complete that AI request. Please try again.', 'AI_REQUEST_FAILED');
}

function parseQuizRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {};
  if (!body.request) return body;
  try {
    const parsed = JSON.parse(body.request);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    const error = new Error('Quiz request metadata must be valid JSON.');
    error.code = 'INVALID_QUIZ_REQUEST';
    throw error;
  }
}

function normalizeQuizRequest(raw = {}) {
  const material = raw.material && typeof raw.material === 'object' && !Array.isArray(raw.material)
    ? raw.material
    : {};
  const requestedCount = Number.parseInt(raw.questionCount, 10);
  const difficulty = ['easy', 'medium', 'hard'].includes(String(raw.difficulty || '').toLowerCase())
    ? String(raw.difficulty).toLowerCase()
    : 'medium';
  return {
    subject: safeText(raw.subject || material.detectedSubject, 120),
    topic: safeText(raw.topic, 160),
    difficulty,
    questionCount: Math.max(2, Math.min(Number.isFinite(requestedCount) ? requestedCount : 5, LIMITS.quizQuestions)),
    curriculum: safeText(raw.curriculum, 120),
    weakTopics: safeList(raw.weakTopics, 12),
    studentProfile: normalizeStudentProfile(raw.studentProfile || {}),
    material: {
      id: safeText(material.id, 120),
      title: safeText(material.title || material.name, 240),
      type: safeText(material.type, 120),
      detectedSubject: safeText(material.detectedSubject, 120),
      detectedTopics: safeList(material.detectedTopics, 12),
      extractedText: safeText(material.extractedText, LIMITS.quizExtractedTextCharacters),
    },
  };
}

function quizFileMime(file) {
  const extension = path.extname(file.originalname || '').toLowerCase();
  const byExtension = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  return file.mimetype && file.mimetype !== 'application/octet-stream'
    ? file.mimetype
    : byExtension[extension] || 'application/octet-stream';
}

function quizInputContent(request, files) {
  const fileContent = files.map((file) => {
    const mime = quizFileMime(file);
    const dataUrl = `data:${mime};base64,${file.buffer.toString('base64')}`;
    if (mime.startsWith('image/')) {
      return { type: 'input_image', image_url: dataUrl, detail: 'auto' };
    }
    return {
      type: 'input_file',
      filename: safeText(file.originalname, 240) || 'study-material',
      file_data: dataUrl,
    };
  });

  const topicSignals = [request.topic, ...request.material.detectedTopics].filter(Boolean);
  const prompt = [
    `Create exactly ${request.questionCount} questions at ${request.difficulty} difficulty.`,
    `Requested subject: ${request.subject || 'Infer this from the supplied study material.'}`,
    `Requested/detected topics: ${topicSignals.join(', ') || 'Infer these from the supplied study material.'}`,
    `Curriculum or level: ${request.curriculum || request.studentProfile.curriculum || request.studentProfile.yearGroup || request.studentProfile.grade || 'Not supplied; use the material itself to judge level.'}`,
    `File title: ${request.material.title || files.map((file) => file.originalname).join(', ') || 'No file supplied.'}`,
    `File type: ${request.material.type || files.map(quizFileMime).join(', ') || 'Not supplied.'}`,
    `Detected subject: ${request.material.detectedSubject || 'Not supplied.'}`,
    `Detected topics: ${request.material.detectedTopics.join(', ') || 'Not supplied.'}`,
    `Student weak topics: ${request.weakTopics.join(', ') || request.studentProfile.weakTopics.join(', ') || 'Not supplied.'}`,
    '',
    'Extracted text supplied by the extension:',
    request.material.extractedText || 'No local text preview. Inspect the attached file or image directly.',
    '',
    'Return only the requested structured quiz. Ground the questions in academic subject matter. Generic questions about how to study or revise are forbidden unless this source is explicitly about study techniques.',
  ].join('\n');

  return [...fileContent, { type: 'input_text', text: prompt }];
}

function genericStudyQuestion(text) {
  return /(best study|best revision|study method|revision strategy|how should you revise|learning strategy|improves? .*mastery|after a low .*score)/i.test(text);
}

function sourceIsAboutStudySkills(request) {
  const source = [
    request.subject,
    request.topic,
    request.material.title,
    request.material.extractedText,
    ...request.material.detectedTopics,
  ].join(' ');
  return /(study skills|revision methods?|learning strateg|time management|active recall|spaced repetition)/i.test(source);
}

function sanitizeQuizResponse(raw, request) {
  const parsed = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const allowStudySkills = sourceIsAboutStudySkills(request);
  const questions = safeArray(parsed.questions)
    .slice(0, request.questionCount)
    .map((question, index) => {
      const type = QUIZ_QUESTION_TYPES.includes(question?.type) ? question.type : 'short_answer';
      const prompt = safeText(question?.question, 1_000);
      const answer = safeText(question?.answer, 1_000);
      if (!prompt || !answer || (!allowStudySkills && genericStudyQuestion(prompt))) return null;
      let options = safeList(question.options, 8);
      if (type === 'true_false') options = ['True', 'False'];
      return {
        id: safeText(question.id, 80) || `question-${index + 1}`,
        type,
        question: prompt,
        options,
        answer,
        acceptableAnswers: [...new Set([answer, ...safeList(question.acceptableAnswers, 12)])],
        explanation: safeText(question.explanation, 1_500) || `The correct answer is ${answer}.`,
        topic: safeText(question.topic, 160) || request.topic || request.material.detectedTopics[0] || 'Core content',
        difficulty: ['easy', 'medium', 'hard'].includes(question.difficulty)
          ? question.difficulty
          : request.difficulty,
      };
    })
    .filter(Boolean);

  return {
    title: safeText(parsed.title, 240) || `${request.topic || request.subject || 'Study material'} quiz`,
    subject: safeText(parsed.subject, 120) || request.subject || request.material.detectedSubject,
    topics: safeList(parsed.topics, 12).length
      ? safeList(parsed.topics, 12)
      : [request.topic, ...request.material.detectedTopics].filter(Boolean),
    curriculum: safeText(parsed.curriculum, 120) || request.curriculum || request.studentProfile.curriculum,
    sourceSummary: safeText(parsed.sourceSummary, 500),
    needsClarification: Boolean(parsed.needsClarification),
    clarificationQuestion: safeText(parsed.clarificationQuestion, 300),
    questions,
  };
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'learnova-ai',
    openAIConfigured: Boolean(createOpenAIClient()),
    commit: deploymentCommit,
  });
});

app.post('/api/chat', chatRateLimiter, async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'A JSON request body is required.', code: 'INVALID_REQUEST' });
  }
  if (Object.prototype.hasOwnProperty.call(body, 'model')) {
    return res.status(400).json({
      error: 'Model selection is controlled by the Learnova service.',
      code: 'MODEL_NOT_ALLOWED',
    });
  }

  if (typeof body.message !== 'string') {
    return res.status(400).json({ error: 'message must be a string.', code: 'INVALID_MESSAGE' });
  }
  const message = safeText(body.message, LIMITS.messageCharacters + 1);
  if (!message) {
    return res.status(400).json({ error: 'A non-empty message is required.', code: 'MESSAGE_REQUIRED' });
  }
  if (message.length > LIMITS.messageCharacters) {
    return res.status(400).json({
      error: `Messages must be ${LIMITS.messageCharacters} characters or fewer.`,
      code: 'MESSAGE_TOO_LONG',
    });
  }

  const conversationHistory = normalizeConversationHistory(body.conversationHistory ?? []);
  if (!conversationHistory) {
    return res.status(400).json({
      error: 'conversationHistory must be an array.',
      code: 'INVALID_HISTORY',
    });
  }
  if (body.attachedContext !== undefined && (!body.attachedContext || typeof body.attachedContext !== 'object' || Array.isArray(body.attachedContext))) {
    return res.status(400).json({
      error: 'attachedContext must be an object.',
      code: 'INVALID_CONTEXT',
    });
  }
  if (body.studentProfile !== undefined && (!body.studentProfile || typeof body.studentProfile !== 'object' || Array.isArray(body.studentProfile))) {
    return res.status(400).json({
      error: 'studentProfile must be an object.',
      code: 'INVALID_PROFILE',
    });
  }

  const client = createOpenAIClient();
  if (!client) {
    return res.status(503).json({
      error: 'Learnova AI is not configured.',
      code: 'AI_NOT_CONFIGURED',
    });
  }

  const studentProfile = normalizeStudentProfile(body.studentProfile || {});
  const attachedContext = boundedContext(body.attachedContext || {});

  try {
    const response = await client.responses.create({
      model,
      instructions: buildSystemInstructions(studentProfile),
      input: buildPrompt({ message, conversationHistory, attachedContext, studentProfile }),
      max_output_tokens: maxOutputTokens,
    });

    return res.json({
      text: textFromResponse(response) || 'Learnova could not generate a response.',
      model,
      responseId: response.id,
    });
  } catch (error) {
    const classified = classifyOpenAIError(error);
    console.error('OpenAI request failed', {
      requestId: res.getHeader('X-Request-ID'),
      status: Number(error?.status || 0) || undefined,
      type: String(error?.name || 'OpenAIError'),
    });
    return res.status(classified.status).json(classified.body);
  }
});

app.post('/api/quiz', chatRateLimiter, quizUpload.array('files', LIMITS.quizFiles), async (req, res) => {
  let request;
  try {
    request = normalizeQuizRequest(parseQuizRequest(req.body));
  } catch (error) {
    return res.status(400).json({
      error: error.message || 'Quiz request metadata is invalid.',
      code: error.code || 'INVALID_QUIZ_REQUEST',
    });
  }

  const files = safeArray(req.files);
  const hasStudyMaterial = files.length > 0 || Boolean(request.material.extractedText);
  const hasRequestedContent = Boolean(request.subject || request.topic || request.material.detectedSubject || request.material.detectedTopics.length);
  if (!hasStudyMaterial && !hasRequestedContent) {
    return res.json({
      title: '',
      subject: '',
      topics: [],
      curriculum: request.curriculum || request.studentProfile.curriculum,
      sourceSummary: '',
      needsClarification: true,
      clarificationQuestion: 'What subject or topic would you like to be quizzed on?',
      questions: [],
    });
  }

  const client = createOpenAIClient();
  if (!client) {
    return res.status(503).json({
      error: 'Learnova AI is not configured.',
      code: 'AI_NOT_CONFIGURED',
    });
  }

  try {
    const response = await client.responses.create({
      model,
      instructions: [
        QUIZ_SYSTEM_INSTRUCTIONS.trim(),
        '',
        'Hidden student profile context (use only when relevant):',
        JSON.stringify(request.studentProfile, null, 2),
      ].join('\n'),
      input: [{ role: 'user', content: quizInputContent(request, files) }],
      text: {
        format: {
          type: 'json_schema',
          name: 'learnova_content_quiz',
          strict: true,
          schema: QUIZ_RESPONSE_SCHEMA,
        },
      },
      max_output_tokens: quizMaxOutputTokens,
    });
    const output = textFromResponse(response);
    const quiz = sanitizeQuizResponse(JSON.parse(output), request);
    if (!quiz.needsClarification && quiz.questions.length < 2) {
      return res.status(502).json({
        error: 'Learnova could not create enough content-based questions. Please try again or choose a more specific topic.',
        code: 'QUIZ_QUALITY_CHECK_FAILED',
      });
    }
    return res.json({ ...quiz, model, responseId: response.id });
  } catch (error) {
    const classified = classifyOpenAIError(error);
    console.error('OpenAI quiz request failed', {
      requestId: res.getHeader('X-Request-ID'),
      status: Number(error?.status || 0) || undefined,
      type: String(error?.name || 'OpenAIError'),
    });
    return res.status(classified.status).json(classified.body);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.', code: 'NOT_FOUND' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error?.code === 'CORS_NOT_ALLOWED') {
    return res.status(403).json({ error: 'Origin is not allowed.', code: 'ORIGIN_NOT_ALLOWED' });
  }
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.', code: 'BODY_TOO_LARGE' });
  }
  if (error instanceof multer.MulterError) {
    const tooLarge = error.code === 'LIMIT_FILE_SIZE' || error.code === 'LIMIT_FILE_COUNT';
    return res.status(413).json({
      error: tooLarge
        ? 'Study files must be 10 MB or smaller, with no more than three files per quiz.'
        : 'The study material upload could not be processed.',
      code: tooLarge ? 'STUDY_FILES_TOO_LARGE' : 'INVALID_STUDY_FILES',
    });
  }
  if (error instanceof SyntaxError) {
    return res.status(400).json({ error: 'Request body must be valid JSON.', code: 'INVALID_JSON' });
  }
  console.error('Unhandled server error', {
    requestId: res.getHeader('X-Request-ID'),
    type: String(error?.name || 'Error'),
  });
  return res.status(500).json({ error: 'Learnova encountered a server error.', code: 'SERVER_ERROR' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Learnova AI service listening on 0.0.0.0:${port}`);
});

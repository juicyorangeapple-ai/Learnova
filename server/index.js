import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
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

const SYSTEM_INSTRUCTIONS = `
You are Learnova Assistant, a calm and encouraging AI study coach for high school students.
Use the provided student profile, weak topics, saved materials, uploaded-file metadata, and browser context when relevant.
Keep responses concise, useful, and student-facing. Never shame the student.
If the student asks for quizzes, flashcards, revision plans, explanations, essay help, motivation, or study strategy, give practical next steps.
This prototype does not parse uploaded file contents or connect to real school systems, Google Drive, Calendar, Notion, or private files. Never claim that metadata is file content.
Do not reveal private profile fields such as email unless the student explicitly asks about their account details.
`;

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
    email: safeText(safeProfile.email, 180),
    grade: safeText(safeProfile.grade, 80),
    yearGroup: safeText(safeProfile.yearGroup || safeProfile.year, 80),
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
  return [
    SYSTEM_INSTRUCTIONS.trim(),
    '',
    'Hidden student profile context for personalization:',
    JSON.stringify(profile, null, 2),
    '',
    'Use this profile to tailor answers to the curriculum, subjects, weak topics, academic goals, preferred study style, upcoming deadlines, and available study time.',
    'When the student asks what to study, recommend a specific next session using those signals.',
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

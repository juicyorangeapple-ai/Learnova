(function () {
  const futureIntegrations = [
    'Google Drive',
    'Google Classroom',
    'Canvas',
    'Moodle',
    'Notion',
    'OneDrive',
    'PowerSchool',
  ];

  function tokenize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  }

  function scoreText(queryTokens, text) {
    const haystack = tokenize(text);
    if (!queryTokens.length || !haystack.length) return 0;
    return queryTokens.reduce((score, token) => score + (haystack.includes(token) ? 1 : 0), 0);
  }

  function topItems(items, limit = 5) {
    return items
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  function asList(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    return String(value || '')
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  class KnowledgeSource {
    constructor(id, label) {
      this.id = id;
      this.label = label;
    }

    retrieve() {
      return [];
    }
  }

  class GeneralKnowledgeSource extends KnowledgeSource {
    constructor() {
      super('general', 'General AI Knowledge');
    }

    retrieve(query) {
      const queryTokens = tokenize(query);
      const concepts = [
        {
          title: 'Study strategy',
          text: 'Use active recall, spaced repetition, short focused sessions, and feedback loops before rereading notes.',
        },
        {
          title: 'Time management',
          text: 'Break revision into small sessions, prioritize weak topics, and use a realistic weekly plan.',
        },
        {
          title: 'Explanations',
          text: 'Good academic explanations should start simple, connect to examples, then build toward exam language.',
        },
        {
          title: 'Essay writing',
          text: 'Strong essays use a clear thesis, evidence, analysis, and a conclusion tied back to the question.',
        },
        {
          title: 'Exam strategy',
          text: 'Practice command words, timed questions, mark schemes, and post-quiz correction logs.',
        },
        {
          title: 'Motivation',
          text: 'Encouraging reminders should be specific, small, and non-shaming: one useful next step is enough.',
        },
      ];
      const scored = concepts.map((item) => ({
        source: this.id,
        sourceLabel: this.label,
        title: item.title,
        snippet: item.text,
        score: scoreText(queryTokens, `${item.title} ${item.text}`) || 0.25,
      }));
      return topItems(scored, 3);
    }
  }

  class StudentProfileSource extends KnowledgeSource {
    constructor() {
      super('profile', 'Student Profile');
    }

    retrieve(query, state) {
      const profile = state.studentProfile || {};
      const queryTokens = tokenize(query);
      const mastery = [...(state.mastery || [])].sort((a, b) => a.score - b.score);
      const profileWeakTopics = asList(profile.weakTopics);
      const weak = profileWeakTopics.length
        ? profileWeakTopics.map((topic) => ({ subject: 'Profile priority', topic, score: 'student flagged' }))
        : mastery.slice(0, 4);
      const strong = mastery.slice(-3).reverse();
      const records = [
        {
          title: 'Student overview',
          text: `${profile.name || 'Student'} is in ${profile.yearGroup || `Grade ${profile.grade || 10}`}, studying ${profile.curriculum || 'a high school curriculum'} with target grades ${profile.targetGrades || 'not set'} and goals: ${asList(profile.goals).join(', ')}.`,
        },
        {
          title: 'Weak topics',
          text: weak.map((item) => `${item.subject}: ${item.topic}${Number.isFinite(item.score) ? ` (${item.score}%)` : ''}`).join('; '),
        },
        {
          title: 'Upcoming tasks',
          text: asList(profile.upcomingDeadlines).join('; '),
        },
        {
          title: 'Strengths',
          text: asList(profile.strengths).join('; ') || strong.map((item) => `${item.subject}: ${item.topic} (${item.score}%)`).join('; '),
        },
        {
          title: 'Learning preferences',
          text: [...asList(profile.learningPreferences), ...asList(profile.studyStyle)].join(', '),
        },
        {
          title: 'Interests and available study time',
          text: `University/career interests: ${profile.universityInterests || 'not set'}. Extracurricular interests: ${profile.extracurricularInterests || 'not set'}. Daily available study time: ${profile.dailyStudyTime || 'not set'}.`,
        },
        {
          title: 'Quiz history',
          text: asList(profile.quizHistory).map((item) => (typeof item === 'string' ? item : `${item.title}: ${item.score}%`)).join('; '),
        },
        {
          title: 'Revision history',
          text: asList(profile.revisionHistory).join('; '),
        },
      ];
      return topItems(
        records.map((item) => ({
          source: this.id,
          sourceLabel: this.label,
          title: item.title,
          snippet: item.text,
          score: scoreText(queryTokens, `${item.title} ${item.text}`) || (item.title === 'Weak topics' ? 0.8 : 0.35),
        })),
        5
      );
    }
  }

  class SavedMaterialsSource extends KnowledgeSource {
    constructor() {
      super('materials', 'Saved Study Materials');
    }

    retrieve(query, state) {
      const queryTokens = tokenize(query);
      const materials = [
        ...(state.materials || []).map((item) => ({
          title: item.title,
          text: `${item.subject} ${item.topic || item.type} ${item.type || ''}`,
          kind: 'Material',
        })),
        ...(state.savedPages || []).map((item) => ({
          title: item.title,
          text: `${item.subject} ${item.topic} ${item.notes || ''} ${item.url || ''}`,
          kind: 'Saved webpage',
        })),
        ...(state.flashcardMemory || []).map((item) => ({
          title: item.front,
          text: `${item.subject} ${item.topic} ${item.back}`,
          kind: 'Flashcard',
        })),
        ...(state.previousQuizzes || []).map((item) => ({
          title: item.title,
          text: `${item.subject} ${item.topic} ${item.score}`,
          kind: 'Previous quiz',
        })),
        ...(state.assistantUploads || []).map((item) => ({
          title: item.name,
          text: `${item.name} ${item.type} ${item.status}`,
          kind: 'Uploaded file',
        })),
      ];
      return topItems(
        materials.map((item) => ({
          source: this.id,
          sourceLabel: this.label,
          title: `${item.kind}: ${item.title}`,
          snippet: item.text,
          score: scoreText(queryTokens, `${item.title} ${item.text}`),
        })),
        5
      );
    }
  }

  class BrowserContextSource extends KnowledgeSource {
    constructor() {
      super('browser', 'Browser Context');
    }

    retrieve(query, state) {
      const context = state.browserContext || {};
      const queryTokens = tokenize(query);
      const records = [
        {
          title: 'Current page',
          text: `${context.title || 'No current page captured'} ${context.url || ''}`,
        },
        {
          title: 'Selected text',
          text: context.selectedText || 'No selected text captured yet.',
        },
        {
          title: 'Current study website',
          text: context.studyWebsite || context.url || 'No study website captured yet.',
        },
        {
          title: 'Current assignment',
          text: context.assignment || 'No assignment detected in this prototype.',
        },
      ];
      return topItems(
        records.map((item) => ({
          source: this.id,
          sourceLabel: this.label,
          title: item.title,
          snippet: item.text,
          score: scoreText(queryTokens, `${item.title} ${item.text}`) || (context.title ? 0.4 : 0),
        })),
        4
      );
    }
  }

  class IntegrationRegistrySource extends KnowledgeSource {
    constructor() {
      super('integrations', 'Future Integrations');
    }

    retrieve(query) {
      const queryTokens = tokenize(query);
      const text = `Provider-ready architecture for ${futureIntegrations.join(', ')}. These sources are placeholders until secure accounts and consent are added.`;
      return [
        {
          source: this.id,
          sourceLabel: this.label,
          title: 'Integration-ready context',
          snippet: text,
          score: scoreText(queryTokens, text) || 0.15,
        },
      ];
    }
  }

  const providers = {
    openai: {
      id: 'openai',
      label: 'Learnova AI Service',
      async generate({ query, contextBundle }) {
        const config = globalThis.LearnovaConfig;
        if (!config?.fetchApi) {
          const configurationError = new Error('Learnova AI configuration is unavailable.');
          configurationError.code = 'BACKEND_CONFIGURATION';
          throw configurationError;
        }

        let response;
        try {
          response = await config.fetchApi('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: query,
              conversationHistory: contextBundle.conversationHistory || [],
              studentProfile: contextBundle.studentProfile || contextBundle.profile || {},
              attachedContext: contextBundle,
            }),
            timeoutMs: 35_000,
          });
        } catch {
          const message = config.mode === 'development'
            ? 'AI backend is not connected. Please start the local server.'
            : 'Learnova AI is temporarily unavailable. Please try again shortly.';
          const backendError = new Error(message);
          backendError.code = 'BACKEND_DISCONNECTED';
          throw backendError;
        }

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          const messages = {
            400: payload.error || 'That request could not be sent. Please shorten it and try again.',
            413: 'That study context is too large. Remove a few attachments and try again.',
            429: 'Learnova AI has reached its demo request limit. Please wait a few minutes and try again.',
            503: 'Learnova AI is temporarily unavailable. Please try again shortly.',
            504: 'Learnova AI took too long to respond. Please try again.',
          };
          const backendError = new Error(messages[response.status] || 'Learnova could not complete that AI request. Please try again.');
          backendError.code = response.status === 429 ? 'RATE_LIMITED' : 'BACKEND_ERROR';
          throw backendError;
        }

        return {
          text: payload.text || 'Learnova could not generate a response.',
          model: payload.model || 'learnova-ai-service',
        };
      },
    },
    mock: {
      id: 'mock',
      label: 'Local Mock Provider',
      async generate({ query, contextBundle }) {
        const weak = contextBundle.profile.weakTopics[0] || contextBundle.profile.masteryWeakTopics?.[0] || 'your weakest topic';
        const weakLabel = typeof weak === 'string' ? weak : `${weak.subject}: ${weak.topic}`;
        const weakScore = typeof weak === 'string' || !Number.isFinite(weak.score) ? '' : ` at ${weak.score}% mastery`;
        const page = contextBundle.browser.title;
        const material = contextBundle.evidence.find((item) => item.source === 'materials');
        const asksForPlan = /plan|schedule|revise|revision|time/i.test(query);
        const asksForExplain = /explain|what is|help|understand|simple/i.test(query);
        const asksForEssay = /essay|writing|paragraph|analysis/i.test(query);

        let opening = `I pulled this from ${contextBundle.sourcesUsed.join(', ')}.`;
        if (page) {
          opening = `I noticed you're currently on "${page}", and I checked your profile, saved materials, and recent weak topics before answering.`;
        }

        let body = `Your weakest current signal is ${weakLabel}${weakScore}. `;
        if (material) {
          body += `I also found a relevant saved item: "${material.title}". `;
        }

        if (asksForPlan) {
          body += 'Here is a focused plan: 8 minutes reviewing the simplest explanation, 10 minutes of active recall questions, then 5 minutes correcting mistakes.';
        } else if (asksForEssay) {
          body += 'For writing, start with a one-sentence claim, add precise evidence, then explain how the evidence proves the claim. Keep each paragraph tied to the question.';
        } else if (asksForExplain) {
          body += 'Here is the simpler version: start with the core idea, connect it to one familiar example, then add the exam term only after the intuition is clear.';
        } else {
          body += 'The useful next step is small: do one short practice task, check feedback, and update the revision plan from the mistake you find.';
        }

        return {
          text: `${opening}\n\n${body}\n\nRecommended next action: start a quick quiz or ask me to turn this into flashcards.`,
          model: 'mock-orchestrated-response',
        };
      },
    },
  };

  class AssistantOrchestrator {
    constructor({ provider = providers.mock, sources = [] } = {}) {
      this.provider = provider;
      this.sources = sources.length
        ? sources
        : [
            new GeneralKnowledgeSource(),
            new StudentProfileSource(),
            new SavedMaterialsSource(),
            new BrowserContextSource(),
            new IntegrationRegistrySource(),
          ];
    }

    async answer(query, state) {
      const sourceResults = this.sources.map((source) => ({
        source,
        results: source.retrieve(query, state),
      }));
      const evidence = sourceResults.flatMap((entry) => entry.results).sort((a, b) => b.score - a.score);
      const sourcesUsed = [...new Set(evidence.map((item) => item.sourceLabel))];
      const contextBundle = this.composeContext(query, state, evidence, sourcesUsed);
      const providerResponse = await this.provider.generate({ query, contextBundle });
      return {
        ...providerResponse,
        query,
        evidence,
        contextBundle,
        provider: this.provider,
        pipeline: sourceResults.map((entry) => ({
          id: entry.source.id,
          label: entry.source.label,
          count: entry.results.length,
          top: entry.results[0]?.title || 'No direct match',
        })),
      };
    }

    composeContext(query, state, evidence, sourcesUsed) {
      const mastery = [...(state.mastery || [])].sort((a, b) => a.score - b.score);
      const profile = state.studentProfile || {};
      const profileWeakTopics = asList(profile.weakTopics);
      return {
        query,
        sourcesUsed,
        evidence: evidence.slice(0, 10),
        studentProfile: state.studentProfile || {},
        profileDebug: state.profileDebug || null,
        isDevelopment: Boolean(state.isDevelopment),
        profile: {
          name: profile.name || 'Student',
          grade: profile.grade || 10,
          yearGroup: profile.yearGroup || `Grade ${profile.grade || 10}`,
          curriculum: profile.curriculum || 'High school demo curriculum',
          schoolName: profile.schoolName || '',
          subjects: profile.subjects || Object.keys(state.subjects || {}),
          targetGrades: profile.targetGrades || '',
          upcomingDeadlines: asList(profile.upcomingDeadlines),
          goals: asList(profile.goals),
          weakTopics: profileWeakTopics.length ? profileWeakTopics : mastery.slice(0, 4),
          masteryWeakTopics: mastery.slice(0, 4),
          strengths: asList(profile.strengths).length ? asList(profile.strengths) : mastery.slice(-3).reverse(),
          learningPreferences: asList(profile.learningPreferences),
          studyStyle: asList(profile.studyStyle),
          universityInterests: profile.universityInterests || '',
          extracurricularInterests: profile.extracurricularInterests || '',
          dailyStudyTime: profile.dailyStudyTime || '',
          quizHistory: profile.quizHistory || [],
          revisionHistory: profile.revisionHistory || [],
        },
        profileContext: state.profileContext || {},
        browser: state.browserContext || {},
        conversationHistory: state.conversationHistory || [],
        uploadedFiles: (state.assistantUploads || []).slice(0, 12).map((file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          status: file.status,
          addedAt: file.addedAt,
        })),
        integrations: futureIntegrations,
      };
    }
  }

  globalThis.LearnovaAssistant = {
    AssistantOrchestrator,
    providers,
    sources: {
      GeneralKnowledgeSource,
      StudentProfileSource,
      SavedMaterialsSource,
      BrowserContextSource,
      IntegrationRegistrySource,
    },
    create(providerId = 'openai') {
      return new AssistantOrchestrator({ provider: providers[providerId] || providers.openai });
    },
  };
})();

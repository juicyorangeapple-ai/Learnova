(function () {
  function asList(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    return String(value || '')
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function firstName(profile) {
    return String(profile?.name || 'there').split(/\s+/)[0] || 'there';
  }

  function weakest(state) {
    return [...(state?.mastery || [])].sort((a, b) => a.score - b.score)[0] || null;
  }

  function build({ state = {}, route = 'dashboard', studySet = null }) {
    const profile = state.studentProfile || {};
    const weak = weakest(state);
    const uploads = state.assistantUploads || [];
    const sets = state.materials || [];
    return {
      route,
      profile: {
        firstName: firstName(profile),
        yearGroup: profile.yearGroup || profile.grade || '',
        curriculum: profile.curriculum || '',
        availableTime: profile.dailyStudyTime || profile.availableStudyTime || '',
        weakTopics: asList(profile.weakTopics),
        upcomingDeadlines: asList(profile.upcomingDeadlines),
      },
      weak,
      studySet,
      uploads,
      savedMaterialCount: sets.length + (state.savedPages || []).length,
      browserContext: state.browserContext || {},
    };
  }

  function fallback(context) {
    const { profile, weak, route, studySet, uploads } = context;
    const topic = weak?.topic || profile.weakTopics[0] || 'your next topic';
    const subject = weak?.subject ? `${weak.subject}: ` : '';
    const actions = {
      dashboard: ['start-quiz', 'make-plan', 'continue-set', 'ask-tutor'],
      library: ['continue-set', 'flashcards', 'start-quiz', 'ask-tutor'],
      studyset: ['flashcards', 'start-quiz', 'ask-tutor', 'make-plan'],
      assistant: ['explain-weakest', 'make-plan', 'flashcards', 'continue-set'],
      quiz: ['explain-weakest', 'flashcards', 'continue-set', 'ask-tutor'],
      flashcards: ['start-quiz', 'continue-set', 'make-plan', 'ask-tutor'],
      mastery: ['explain-weakest', 'start-quiz', 'make-plan', 'ask-tutor'],
      profile: ['make-plan', 'continue-set', 'ask-tutor'],
      settings: ['ask-tutor', 'continue-set', 'make-plan'],
    };

    if (route === 'studyset' && studySet) {
      return {
        message: `I can turn ${studySet.title} into a focused study session.`,
        actions: actions.studyset,
      };
    }
    if (route === 'assistant') {
      return {
        message: 'Want me to make the next explanation shorter or more practical?',
        actions: actions.assistant,
      };
    }
    if (route === 'quiz') {
      return {
        message: `A quick review of ${subject}${topic} can make the next attempt easier.`,
        actions: actions.quiz,
      };
    }
    if (route === 'mastery') {
      return {
        message: `Your next confidence boost is ${subject}${topic}.`,
        actions: actions.mastery,
      };
    }
    if (uploads.length) {
      return {
        message: `Your ${uploads.length === 1 ? 'attached file is' : 'attached files are'} ready to study with.`,
        actions: ['flashcards', 'start-quiz', 'ask-tutor', 'make-plan'],
      };
    }
    if (profile.availableTime) {
      return {
        message: `You have ${profile.availableTime} available. A short ${topic} session is a good place to start.`,
        actions: actions[route] || actions.dashboard,
      };
    }
    return {
      message: `A small ${topic} study step is ready when you are.`,
      actions: actions[route] || actions.dashboard,
    };
  }

  globalThis.LearnovaCompanionContext = { build, fallback };
})();

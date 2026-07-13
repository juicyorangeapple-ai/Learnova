(function () {
  const labels = {
    'start-quiz': 'Start a quick quiz',
    'explain-weakest': 'Explain my weakest topic',
    'continue-set': 'Continue last study set',
    'make-plan': "Make today's plan",
    flashcards: 'Create flashcards',
    'ask-tutor': 'Ask Learnova',
  };

  function label(id) {
    return labels[id] || 'Ask Learnova';
  }

  async function execute(id, context, handlers = {}) {
    if (typeof handlers[id] !== 'function') return false;
    await handlers[id](context);
    return true;
  }

  globalThis.LearnovaCompanionActions = { execute, label };
})();

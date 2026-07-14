(function () {
  const DATABASE_NAME = 'learnova-study-materials';
  const DATABASE_VERSION = 1;
  const STORE_NAME = 'files';
  const memoryFiles = new Map();
  let databasePromise = null;

  const topicDefinitions = [
    {
      subject: 'Chemistry',
      subjectTerms: ['chemistry', 'chemical', 'atom', 'element', 'compound', 'reaction'],
      topics: {
        Moles: ['mole', 'moles', 'avogadro', 'stoichiometry', 'molar mass'],
        Bonding: ['bonding', 'ionic bond', 'covalent bond', 'metallic bond', 'electronegativity'],
        'Rates of reaction': ['rate of reaction', 'reaction rate', 'collision theory', 'catalyst'],
        Electrolysis: ['electrolysis', 'electrolyte', 'anode', 'cathode'],
        'Acids and bases': ['acid', 'alkali', 'base', 'ph scale', 'neutralisation'],
        'Organic chemistry': ['organic chemistry', 'alkane', 'alkene', 'polymer', 'hydrocarbon'],
      },
    },
    {
      subject: 'Biology',
      subjectTerms: ['biology', 'biological', 'organism', 'cell', 'enzyme', 'ecosystem'],
      topics: {
        Photosynthesis: ['photosynthesis', 'chlorophyll', 'chloroplast', 'glucose', 'limiting factor'],
        Respiration: ['respiration', 'aerobic', 'anaerobic', 'mitochondria'],
        Cells: ['cell membrane', 'nucleus', 'cytoplasm', 'organelle', 'cell structure'],
        Genetics: ['genetics', 'dna', 'gene', 'chromosome', 'inheritance', 'allele'],
        Ecology: ['ecology', 'ecosystem', 'food chain', 'population', 'biodiversity'],
        'Human biology': ['circulatory', 'digestive', 'homeostasis', 'nervous system', 'hormone'],
      },
    },
    {
      subject: 'History',
      subjectTerms: ['history', 'historical', 'empire', 'revolution', 'treaty', 'war'],
      topics: {
        'World War I': ['world war i', 'world war 1', 'wwi', 'versailles', 'trench warfare'],
        'World War II': ['world war ii', 'world war 2', 'wwii', 'axis powers', 'allied powers'],
        'Cold War': ['cold war', 'soviet union', 'iron curtain', 'cuban missile crisis'],
        'Industrial Revolution': ['industrial revolution', 'industrialisation', 'factory system'],
        'Civil rights': ['civil rights', 'segregation', 'martin luther king', 'suffrage'],
        'Roman history': ['roman empire', 'ancient rome', 'julius caesar', 'augustus'],
      },
    },
    {
      subject: 'English Literature',
      subjectTerms: ['english literature', 'literature', 'novel', 'poem', 'poetry', 'playwright'],
      topics: {
        'Romeo and Juliet': ['romeo and juliet', 'romeo', 'juliet', 'capulet', 'montague'],
        Macbeth: ['macbeth', 'lady macbeth', 'banquo', 'witches'],
        Poetry: ['poem', 'poetry', 'stanza', 'speaker', 'poet'],
        'Character analysis': ['character', 'protagonist', 'antagonist', 'characterisation'],
        'Themes and symbolism': ['theme', 'symbolism', 'motif', 'imagery'],
      },
    },
    {
      subject: 'Mathematics',
      subjectTerms: ['mathematics', 'maths', 'math', 'equation', 'calculate', 'theorem'],
      topics: {
        Quadratics: ['quadratic', 'discriminant', 'factorise', 'parabola', 'completing the square'],
        Algebra: ['algebra', 'variable', 'simultaneous equation', 'inequality', 'expression'],
        Trigonometry: ['trigonometry', 'sine', 'cosine', 'tangent', 'sohcahtoa'],
        Calculus: ['calculus', 'differentiate', 'derivative', 'integral', 'integration'],
        Geometry: ['geometry', 'circle theorem', 'angle', 'congruence', 'similarity'],
        Probability: ['probability', 'sample space', 'independent event', 'conditional probability'],
        Statistics: ['statistics', 'mean', 'median', 'standard deviation', 'histogram'],
      },
    },
    {
      subject: 'Physics',
      subjectTerms: ['physics', 'force', 'energy', 'electricity', 'wave'],
      topics: {
        Forces: ['force', 'newton', 'momentum', 'acceleration', 'free body diagram'],
        Energy: ['energy', 'work done', 'power', 'kinetic', 'potential energy'],
        Electricity: ['electricity', 'current', 'voltage', 'resistance', 'ohm'],
        Waves: ['wave', 'frequency', 'wavelength', 'amplitude', 'electromagnetic spectrum'],
      },
    },
    {
      subject: 'Computer Science',
      subjectTerms: ['computer science', 'computing', 'algorithm', 'programming', 'software'],
      topics: {
        Binary: ['binary', 'denary', 'hexadecimal', 'bit', 'byte'],
        Networks: ['network', 'protocol', 'tcp', 'ip address', 'router'],
        CPU: ['cpu', 'processor', 'fetch decode execute', 'register', 'clock speed'],
        Programming: ['programming', 'variable', 'loop', 'function', 'array', 'pseudocode'],
      },
    },
  ];

  function openDatabase() {
    if (!globalThis.indexedDB) return Promise.resolve(null);
    if (databasePromise) return databasePromise;

    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Could not open the study material store.'));
    }).catch(() => null);

    return databasePromise;
  }

  async function saveFile(id, file) {
    if (!id || !(file instanceof Blob)) throw new Error('A valid study file is required.');
    const record = {
      id: String(id),
      blob: file,
      name: file.name || 'Study material',
      type: file.type || 'application/octet-stream',
      size: file.size,
      updatedAt: new Date().toISOString(),
    };
    memoryFiles.set(record.id, record);
    const database = await openDatabase();
    if (!database) return record;

    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(record);
      transaction.oncomplete = () => resolve(record);
      transaction.onerror = () => reject(transaction.error || new Error('Could not save the study file.'));
    });
  }

  async function getRecord(id) {
    const key = String(id || '');
    if (!key) return null;
    if (memoryFiles.has(key)) return memoryFiles.get(key);
    const database = await openDatabase();
    if (!database) return null;

    return new Promise((resolve) => {
      const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
      request.onsuccess = () => {
        if (request.result) memoryFiles.set(key, request.result);
        resolve(request.result || null);
      };
      request.onerror = () => resolve(null);
    });
  }

  async function getFile(id) {
    const record = await getRecord(id);
    if (!record?.blob) return null;
    if (record.blob instanceof File) return record.blob;
    return new File([record.blob], record.name, { type: record.type, lastModified: Date.now() });
  }

  async function removeFile(id) {
    const key = String(id || '');
    memoryFiles.delete(key);
    const database = await openDatabase();
    if (!database || !key) return;

    return new Promise((resolve) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
  }

  async function appendFiles(formData, ids, fieldName = 'files', limit = 3) {
    const attached = [];
    for (const id of [...new Set(ids || [])].slice(0, limit)) {
      const file = await getFile(id);
      if (!file) continue;
      formData.append(fieldName, file, file.name);
      attached.push(id);
    }
    return attached;
  }

  function occurrences(text, term) {
    if (!term || !text.includes(term)) return 0;
    return text.split(term).length - 1;
  }

  function detectStudyContext(name, extractedText = '') {
    const haystack = `${name || ''} ${extractedText || ''}`.toLowerCase().replace(/[_-]+/g, ' ');
    const ranked = topicDefinitions.map((definition) => {
      const topicScores = Object.entries(definition.topics).map(([topic, terms]) => ({
        topic,
        score: terms.reduce((sum, term) => sum + occurrences(haystack, term.toLowerCase()) * 3, 0),
      }));
      const subjectScore = definition.subjectTerms.reduce(
        (sum, term) => sum + occurrences(haystack, term.toLowerCase()) * 2,
        0
      );
      return {
        subject: definition.subject,
        score: subjectScore + topicScores.reduce((sum, item) => sum + item.score, 0),
        topics: topicScores.filter((item) => item.score > 0).sort((left, right) => right.score - left.score),
      };
    }).sort((left, right) => right.score - left.score);

    const best = ranked[0];
    if (!best || best.score <= 0) return { detectedSubject: '', detectedTopics: [] };
    return {
      detectedSubject: best.subject,
      detectedTopics: best.topics.slice(0, 4).map((item) => item.topic),
    };
  }

  async function readTextPreview(file, maxCharacters = 12_000) {
    const isText = file?.type === 'text/plain' || /\.txt$/i.test(file?.name || '');
    if (!isText) return '';
    return (await file.text()).trim().slice(0, maxCharacters);
  }

  globalThis.LearnovaStudyMaterials = Object.freeze({
    saveFile,
    getFile,
    removeFile,
    appendFiles,
    detectStudyContext,
    readTextPreview,
  });
})();

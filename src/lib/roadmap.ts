import type { Difficulty, Resource, SkillLevel } from './types';

export interface GeneratedTopic {
  title: string;
  description: string;
  learning_objective: string;
  estimated_minutes: number;
  difficulty: Difficulty;
  resources: Resource[];
}

export interface GeneratedDay {
  day: number;
  topics: GeneratedTopic[];
}

export interface GeneratedWeek {
  week: number;
  days: GeneratedDay[];
}

export interface GeneratedMonth {
  month: number;
  phase: string;
  weeks: GeneratedWeek[];
}

export interface GeneratedRoadmap {
  months: GeneratedMonth[];
  totalTopics: number;
}

interface GoalTemplate {
  match: string[];
  phases: string[];
  topics: string[][];
}

const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    match: ['mern', 'mongo', 'express', 'react', 'node'],
    phases: ['Web Development Fundamentals', 'Frontend with React', 'Backend with Node & Express', 'Full Stack Integration', 'Projects & Interview Prep'],
    topics: [
      ['HTML5 semantics', 'CSS3 & Flexbox', 'CSS Grid & Responsive Design', 'JavaScript ES6+ fundamentals', 'DOM manipulation & events', 'Async JS: promises & async/await', 'Git & GitHub basics', 'npm & package management'],
      ['React JSX & components', 'React props & state', 'React hooks: useState & useEffect', 'React hooks: useContext & useReducer', 'React Router & navigation', 'State management with Redux Toolkit', 'Form handling & validation', 'Tailwind CSS for React'],
      ['Node.js runtime & modules', 'Express.js server basics', 'REST API design principles', 'MongoDB & Mongoose ODM', 'JWT authentication', 'File uploads & middleware', 'Error handling & validation', 'Environment config & deployment'],
      ['Connecting React to Express APIs', 'CORS & proxy configuration', 'User auth flow end-to-end', 'Database schema design', 'API testing with Postman', 'Socket.io real-time features', 'Docker containerization basics', 'CI/CD pipeline overview'],
      ['Build a social media app', 'Build an e-commerce API', 'Build a real-time chat app', 'Code review & best practices', 'Resume & portfolio preparation', 'Common MERN interview questions', 'System design basics', 'Mock interview practice'],
    ],
  },
  {
    match: ['java', 'spring', 'hibernate', 'servlet'],
    phases: ['Java Fundamentals', 'Advanced Java & OOP', 'Java Web Development', 'Spring Boot Framework', 'Projects & Interview Prep'],
    topics: [
      ['Java syntax & data types', 'Control flow & loops', 'OOP: classes & objects', 'Inheritance & polymorphism', 'Encapsulation & abstraction', 'Exception handling', 'Collections framework', 'Generics & lambdas'],
      ['Streams API', 'Multithreading & concurrency', 'File I/O & serialization', 'JDBC & database connectivity', 'Design patterns in Java', 'Memory model & JVM basics', 'Annotations & reflection', 'Unit testing with JUnit'],
      ['Servlets & JSP basics', 'MVC architecture', 'Web app with Servlets', 'Hibernate ORM introduction', 'Hibernate mappings & queries', 'RESTful web services with JAX-RS', 'Maven build tool', 'Tomcat server deployment'],
      ['Spring Core & DI', 'Spring Boot starter projects', 'Spring MVC & REST controllers', 'Spring Data JPA repositories', 'Spring Security authentication', 'Microservices with Spring Cloud', 'API gateway & service registry', 'Docker for Java apps'],
      ['Build a REST CRUD API', 'Build a microservices system', 'Build a banking web app', 'Code optimization techniques', 'Resume & LinkedIn preparation', 'Java interview question drilling', 'Spring Boot interview prep', 'Mock technical interviews'],
    ],
  },
  {
    match: ['dsa', 'data structure', 'algorithm', 'competitive', 'coding'],
    phases: ['Arrays & Basic Data Structures', 'Trees & Hashing', 'Graphs & Dynamic Programming', 'Advanced Algorithms', 'Contest & Interview Practice'],
    topics: [
      ['Arrays & operations', 'Strings & pattern matching', 'Two pointers technique', 'Sliding window technique', 'Linked lists (singly & doubly)', 'Stacks & their applications', 'Queues & deque', 'Big-O complexity analysis'],
      ['Recursion fundamentals', 'Backtracking patterns', 'Binary trees & traversals', 'BST operations', 'Heaps & priority queues', 'Hash tables & collision handling', 'Greedy algorithm basics', 'Divide & conquer strategy'],
      ['Graph representations', 'BFS & DFS traversal', 'Shortest path algorithms', 'Minimum spanning trees', 'Dynamic programming intro', 'DP on 1D & 2D arrays', 'DP on strings', 'DP on trees & graphs'],
      ['Advanced graph algorithms', 'Disjoint set union (DSU)', 'Segment trees & BIT', 'Trie data structure', 'String algorithms (KMP, Rabin-Karp)', 'Bit manipulation tricks', 'Number theory for CP', 'Game theory basics'],
      ['Solve 50 Easy problems', 'Solve 40 Medium problems', 'Solve 20 Hard problems', 'Virtual contests on Codeforces', 'Company-specific problem sets', 'Mock coding interviews', 'Contest strategies & tips', 'Final review & weak areas'],
    ],
  },
  {
    match: ['python', 'django', 'flask', 'pandas'],
    phases: ['Python Fundamentals', 'Intermediate Python', 'Web Development with Python', 'Data & APIs', 'Projects & Interview Prep'],
    topics: [
      ['Python syntax & variables', 'Data types & operators', 'Control flow & loops', 'Functions & scope', 'Lists, tuples & sets', 'Dictionaries & comprehensions', 'String methods & formatting', 'File handling & exceptions'],
      ['OOP in Python', 'Classes & inheritance', 'Magic methods & dunder', 'Decorators & generators', 'Context managers', 'Virtual environments & pip', 'Modules & packages', 'Unit testing with pytest'],
      ['Flask web framework basics', 'Flask routing & templates', 'Flask with databases', 'Django introduction', 'Django models & ORM', 'Django views & templates', 'Django REST framework', 'Authentication in Django'],
      ['Requests library & REST APIs', 'Working with JSON data', 'Pandas for data analysis', 'NumPy arrays & operations', 'Matplotlib & data visualization', 'Web scraping with BeautifulSoup', 'Selenium for automation', 'API rate limiting & caching'],
      ['Build a blog with Django', 'Build a REST API with Flask', 'Build a data dashboard', 'Deploy Python apps to cloud', 'Code quality & linting tools', 'Python interview questions', 'System design for Python apps', 'Mock interview practice'],
    ],
  },
  {
    match: ['data science', 'machine learning', 'ml', 'ai', 'deep learning'],
    phases: ['Math & Python Foundations', 'Data Analysis & Visualization', 'Machine Learning Core', 'Deep Learning & NLP', 'Projects & Portfolio'],
    topics: [
      ['Python for data science', 'NumPy arrays & vectorization', 'Pandas DataFrames', 'Descriptive statistics', 'Probability distributions', 'Linear algebra essentials', 'Calculus for ML', 'Hypothesis testing'],
      ['Data cleaning & preprocessing', 'Exploratory data analysis', 'Matplotlib & Seaborn', 'Plotly & interactive charts', 'Feature engineering', 'Handling missing data', 'Outlier detection', 'SQL for data science'],
      ['Linear regression', 'Logistic regression', 'Decision trees & random forests', 'Gradient boosting (XGBoost)', 'KNN & SVM algorithms', 'K-means clustering', 'Model evaluation metrics', 'Cross-validation & tuning'],
      ['Neural networks fundamentals', 'TensorFlow & Keras basics', 'CNNs for image data', 'RNNs & LSTMs', 'Transformers & attention', 'NLP with NLTK & spaCy', 'Word embeddings & BERT', 'Model deployment basics'],
      ['End-to-end ML project', 'Build a recommendation system', 'Computer vision project', 'NLP sentiment analysis', 'Deploy model with FastAPI', 'ML model monitoring', 'Kaggle competition practice', 'Portfolio & interview prep'],
    ],
  },
  {
    match: ['gate', 'exam', 'psu'],
    phases: ['Engineering Mathematics', 'Core Subject Fundamentals', 'Advanced Core Subjects', 'Aptitude & Reasoning', 'Mock Tests & Revision'],
    topics: [
      ['Linear algebra', 'Calculus & differential equations', 'Probability & statistics', 'Discrete mathematics', 'Numerical methods', 'Graph theory basics', 'Set theory & logic', 'Combinatorics'],
      ['Data structures review', 'Algorithms & complexity', 'Operating systems concepts', 'Computer organization', 'DBMS fundamentals', 'Computer networks basics', 'Digital logic design', 'Theory of computation'],
      ['Advanced OS: scheduling & memory', 'Advanced DBMS: normalization & SQL', 'Advanced networks: TCP/IP & routing', 'Compiler design basics', 'Software engineering principles', 'Web technologies overview', 'Information systems & security', 'Advanced algorithms practice'],
      ['Quantitative aptitude', 'Logical reasoning', 'Verbal ability & comprehension', 'Spatial reasoning', 'Data interpretation', 'Time & work problems', 'Number series & patterns', 'Speed-solving techniques'],
      ['Full mock test 1 & analysis', 'Full mock test 2 & analysis', 'Subject-wise mock tests', 'Previous year paper solving', 'Weak area revision', 'Formula sheets & quick notes', 'Time management strategy', 'Final revision & exam tips'],
    ],
  },
  {
    match: ['placement', 'interview', 'job', 'career'],
    phases: ['Aptitude & Resume Building', 'DSA for Interviews', 'Core CS Subjects', 'Projects & System Design', 'Mock Interviews & Company Prep'],
    topics: [
      ['Quantitative aptitude basics', 'Logical reasoning patterns', 'Verbal ability practice', 'Resume building & formatting', 'LinkedIn profile optimization', 'GitHub portfolio setup', 'Email & communication etiquette', 'Job search strategy'],
      ['Arrays & string problems', 'Linked list problems', 'Trees & graph problems', 'Dynamic programming patterns', 'Hashing & two pointers', 'Stack & queue problems', 'Greedy & backtracking', 'Contest-level problem solving'],
      ['Operating systems interview Q&A', 'DBMS interview Q&A', 'Computer networks interview Q&A', 'OOP concepts & design patterns', 'Computer architecture basics', 'Software engineering processes', 'Version control with Git', 'Cloud computing basics'],
      ['Build 2 portfolio projects', 'Project documentation & README', 'System design fundamentals', 'Scalability & load balancing', 'Database design for scale', 'Caching strategies', 'API design principles', 'Deployment & DevOps basics'],
      ['HR interview preparation', 'Technical mock interview 1', 'Technical mock interview 2', 'Company-specific research', 'Salary negotiation basics', 'Common HR questions', 'Final resume review', 'Interview day checklist'],
    ],
  },
  {
    match: ['communication', 'soft skill', 'speaking', 'presentation'],
    phases: ['Foundations of Communication', 'Verbal & Non-verbal Skills', 'Professional Communication', 'Public Speaking & Presentations', 'Practice & Mastery'],
    topics: [
      ['Communication models & process', 'Active listening skills', 'Barriers to communication', 'Body language basics', 'Tone & voice modulation', 'Clarity & conciseness', 'Empathy in communication', 'Self-awareness assessment'],
      ['Vocabulary building techniques', 'Pronunciation & accent neutralization', 'Grammar for spoken English', 'Storytelling fundamentals', 'Questioning techniques', 'Giving & receiving feedback', 'Assertiveness training', 'Conflict resolution basics'],
      ['Email writing best practices', 'Business etiquette', 'Meeting participation skills', 'Negotiation skills', 'Cross-cultural communication', 'Networking conversation skills', 'Telephone & video call etiquette', 'Professional writing basics'],
      ['Overcoming stage fear', 'Speech structure & outline', 'PowerPoint design principles', 'Engaging an audience', 'Handling Q&A sessions', 'Persuasive speaking techniques', 'Group discussion strategies', 'Personal branding'],
      ['Record & review 5 speeches', 'Join a Toastmasters session', 'Mock group discussions', 'Interview communication practice', 'Daily journaling habit', 'Peer feedback sessions', 'Final self-assessment', 'Long-term improvement plan'],
    ],
  },
];

const DEFAULT_TEMPLATE: GoalTemplate = {
  match: [],
  phases: ['Fundamentals', 'Building Core Skills', 'Advanced Concepts', 'Practical Projects', 'Mastery & Review'],
  topics: [
    ['Introduction & overview', 'Core terminology', 'Setting up your environment', 'Basic concepts & theory', 'First hands-on exercise', 'Common pitfalls to avoid', 'Best practices intro', 'Recap & self-assessment'],
    ['Deep dive: key skill area 1', 'Deep dive: key skill area 2', 'Practical exercise set A', 'Practical exercise set B', 'Common patterns & techniques', 'Tooling & workflow', 'Reading & resources', 'Mini-project: apply basics'],
    ['Advanced topic: architecture', 'Advanced topic: optimization', 'Advanced topic: scaling', 'Industry standards & trends', 'Case study analysis', 'Performance considerations', 'Security considerations', 'Advanced hands-on lab'],
    ['Plan a capstone project', 'Build project: part 1', 'Build project: part 2', 'Build project: part 3', 'Testing & quality assurance', 'Documentation & deployment', 'Code review & refactoring', 'Project showcase'],
    ['Review all key concepts', 'Identify & fix weak areas', 'Interview preparation', 'Portfolio finalization', 'Community engagement tips', 'Continuous learning plan', 'Final assessment', 'Next steps roadmap'],
  ],
};

function pickTemplate(goal: string): GoalTemplate {
  const lower = goal.toLowerCase();
  for (const t of GOAL_TEMPLATES) {
    if (t.match.some((kw) => lower.includes(kw))) return t;
  }
  return DEFAULT_TEMPLATE;
}

function difficultyForPhase(phaseIndex: number, totalPhases: number): Difficulty {
  const ratio = phaseIndex / Math.max(1, totalPhases - 1);
  if (ratio < 0.4) return 'beginner';
  if (ratio < 0.75) return 'intermediate';
  return 'advanced';
}

function resourcesFor(topic: string, difficulty: Difficulty): Resource[] {
  const q = encodeURIComponent(topic);
  return [
    { type: 'docs', title: `${topic} — Official Docs`, url: `https://developer.mozilla.org/en-US/search?q=${q}` },
    { type: 'video', title: `${topic} — YouTube Playlist`, url: `https://www.youtube.com/results?search_query=${q}+tutorial` },
    { type: 'practice', title: `${topic} — Practice`, url: `https://www.google.com/search?q=${q}+practice+exercises` },
    { type: 'article', title: `${topic} — Article`, url: `https://www.google.com/search?q=${q}+explained` },
  ];
}

export function generateRoadmap(
  goal: string,
  skillLevel: SkillLevel,
  durationMonths: number,
  dailyStudyTime: number,
): GeneratedRoadmap {
  const template = pickTemplate(goal);
  const phases = template.phases;
  const topicsPerPhase = template.topics;

  // Distribute months across phases proportionally
  const months: GeneratedMonth[] = [];
  let totalTopics = 0;

  // How many topics per day depends on daily study time (rough: 45 min per topic)
  const topicsPerDay = Math.max(1, Math.round(dailyStudyTime / 45));
  // Days per week: assume 6 study days per week
  const daysPerWeek = 6;
  const topicsPerWeek = topicsPerDay * daysPerWeek;

  // Skip beginner topics if the student is intermediate/advanced
  const phaseOffset = skillLevel === 'advanced' ? 1 : skillLevel === 'intermediate' ? 0 : 0;
  const effectivePhases = phases.slice(phaseOffset);
  const effectiveTopics = topicsPerPhase.slice(phaseOffset);

  // Allocate months to phases
  const phaseMonthCount = Math.max(1, Math.floor(durationMonths / effectivePhases.length));

  let topicCursor = 0;
  for (let p = 0; p < effectivePhases.length; p++) {
    const phaseTopics = effectiveTopics[p] ?? DEFAULT_TEMPLATE.topics[p % 5];
    const isLastPhase = p === effectivePhases.length - 1;
    const monthsForThisPhase = isLastPhase
      ? durationMonths - phaseMonthCount * (effectivePhases.length - 1)
      : phaseMonthCount;

    for (let m = 0; m < Math.max(1, monthsForThisPhase); m++) {
      const weeks: GeneratedWeek[] = [];
      const weeksInMonth = 4;

      for (let w = 0; w < weeksInMonth; w++) {
        const days: GeneratedDay[] = [];
        for (let d = 0; d < daysPerWeek; d++) {
          const dayTopics: GeneratedTopic[] = [];
          for (let t = 0; t < topicsPerDay; t++) {
            const topicName = phaseTopics[topicCursor % phaseTopics.length];
            if (!topicName) break;
            const diff = difficultyForPhase(p, effectivePhases.length);
            dayTopics.push({
              title: topicName,
              description: `Study and practice ${topicName.toLowerCase()} as part of the ${effectivePhases[p]} phase.`,
              learning_objective: `Understand and apply ${topicName} confidently in real scenarios.`,
              estimated_minutes: Math.round(dailyStudyTime / topicsPerDay),
              difficulty: diff,
              resources: resourcesFor(topicName, diff),
            });
            topicCursor++;
            totalTopics++;
          }
          if (dayTopics.length === 0) break;
          days.push({ day: d + 1, topics: dayTopics });
        }
        if (days.length === 0) break;
        weeks.push({ week: w + 1, days });
      }

      if (weeks.length === 0) break;
      const monthNumber = months.length + 1;
      months.push({
        month: monthNumber,
        phase: effectivePhases[p],
        weeks,
      });
    }
  }

  return { months, totalTopics };
}

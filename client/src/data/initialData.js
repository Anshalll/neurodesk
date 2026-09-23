export const COLOR_THEMES = {
  indigo: {
    id: 'indigo',
    name: 'Electric Indigo',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    fill: 'bg-indigo-500',
    ring: 'focus:ring-indigo-500',
    glow: 'rgba(99, 102, 241, 0.25)',
    gradient: 'from-indigo-500 to-cyan-500',
    badge: 'bg-indigo-950/60 text-indigo-300 border-indigo-700/50'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Mint',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    fill: 'bg-emerald-500',
    ring: 'focus:ring-emerald-500',
    glow: 'rgba(16, 185, 129, 0.25)',
    gradient: 'from-emerald-500 to-teal-400',
    badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
  },
  violet: {
    id: 'violet',
    name: 'Cyber Violet',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    text: 'text-violet-400',
    fill: 'bg-violet-500',
    ring: 'focus:ring-violet-500',
    glow: 'rgba(139, 92, 246, 0.25)',
    gradient: 'from-violet-500 to-fuchsia-500',
    badge: 'bg-violet-950/60 text-violet-300 border-violet-700/50'
  },
  cyan: {
    id: 'cyan',
    name: 'Neon Cyan',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    fill: 'bg-cyan-500',
    ring: 'focus:ring-cyan-500',
    glow: 'rgba(6, 182, 212, 0.25)',
    gradient: 'from-cyan-500 to-blue-500',
    badge: 'bg-cyan-950/60 text-cyan-300 border-cyan-700/50'
  },
  amber: {
    id: 'amber',
    name: 'Solar Amber',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    fill: 'bg-amber-500',
    ring: 'focus:ring-amber-500',
    glow: 'rgba(245, 158, 11, 0.25)',
    gradient: 'from-amber-500 to-orange-500',
    badge: 'bg-amber-950/60 text-amber-300 border-amber-700/50'
  },
  rose: {
    id: 'rose',
    name: 'Velvet Rose',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    fill: 'bg-rose-500',
    ring: 'focus:ring-rose-500',
    glow: 'rgba(244, 63, 94, 0.25)',
    gradient: 'from-rose-500 to-pink-500',
    badge: 'bg-rose-950/60 text-rose-300 border-rose-700/50'
  }
};

export const INITIAL_SKILLS = [
  {
    id: 'skill_cpp_01',
    name: 'C++ Systems Programming',
    category: 'Computer Science',
    description: 'Master low-level memory control, modern C++20 idioms, RAII, smart pointers, and STL algorithms.',
    color: 'indigo',
    icon: 'Terminal',
    progressMode: 'auto',
    manualProgress: 40,
    targetDate: '2026-11-20',
    createdAt: '2026-09-01',
    updatedAt: '2026-09-23',
    subtopics: [
      {
        id: 'sub_cpp_1',
        title: '1. Pointers, Memory & Reference Semantics',
        emoji: '⚡',
        completed: true,
        status: 'mastered',
        content: ''
      },
      {
        id: 'sub_cpp_2',
        title: '2. RAII & Smart Pointers (unique_ptr, shared_ptr)',
        emoji: '🛡️',
        completed: true,
        status: 'mastered',
        content: ''
      },
      {
        id: 'sub_cpp_3',
        title: '3. STL Containers, Iterators & Ranges',
        emoji: '📦',
        completed: false,
        status: 'in_progress',
        content: ''
      },
      {
        id: 'sub_cpp_4',
        title: '4. Object-Oriented Polymorphism & Virtual Tables',
        emoji: '🧬',
        completed: false,
        status: 'not_started',
        content: ''
      },
      {
        id: 'sub_cpp_5',
        title: '5. Concurrency, Threads & Atomic Operations',
        emoji: '⚡',
        completed: false,
        status: 'not_started',
        content: ''
      }
    ]
  },
  {
    id: 'skill_dsa_02',
    name: 'Data Structures & Algorithms',
    category: 'Computer Science',
    description: 'Master binary search trees, graph traversals (BFS/DFS), dynamic programming, and heaps for coding interviews.',
    color: 'emerald',
    icon: 'BrainCircuit',
    progressMode: 'auto',
    manualProgress: 66,
    targetDate: '2026-10-30',
    createdAt: '2026-08-20',
    updatedAt: '2026-09-22',
    subtopics: [
      {
        id: 'sub_dsa_1',
        title: '1. Binary Trees, BST & Tree Traversals',
        emoji: '🌲',
        completed: true,
        status: 'mastered',
        content: ''
      },
      {
        id: 'sub_dsa_2',
        title: '2. Graph Algorithms: Dijkstra & Topological Sort',
        emoji: '🕸️',
        completed: true,
        status: 'mastered',
        content: ''
      },
      {
        id: 'sub_dsa_3',
        title: '3. Dynamic Programming & Memoization',
        emoji: '🧩',
        completed: false,
        status: 'in_progress',
        content: ''
      }
    ]
  },
  {
    id: 'skill_web_03',
    name: 'Full-Stack System Architecture',
    category: 'Software Engineering',
    description: 'High-availability backend design, caching layers (Redis), relational indexing, and message streaming with Kafka.',
    color: 'violet',
    icon: 'Layers',
    progressMode: 'auto',
    manualProgress: 33,
    targetDate: '2026-12-15',
    createdAt: '2026-09-05',
    updatedAt: '2026-09-20',
    subtopics: [
      {
        id: 'sub_web_1',
        title: '1. Database Indexing & Query Optimization',
        emoji: '🗄️',
        completed: true,
        status: 'mastered',
        content: ''
      },
      {
        id: 'sub_web_2',
        title: '2. Distributed Caching with Redis',
        emoji: '⚡',
        completed: false,
        status: 'in_progress',
        content: ''
      },
      {
        id: 'sub_web_3',
        title: '3. Event-Driven Architecture & Message Queues',
        emoji: '📨',
        completed: false,
        status: 'not_started',
        content: ''
      }
    ]
  }
];

export const CATEGORIES = [
  'All Categories',
  'Computer Science',
  'Software Engineering',
  'Data Science & AI',
  'Design & UI/UX',
  'Mathematics'
];

export const AVAILABLE_ICONS = [
  { id: 'Terminal', label: 'Terminal / C++' },
  { id: 'Code2', label: 'Code & Dev' },
  { id: 'BrainCircuit', label: 'Algorithms' },
  { id: 'Layers', label: 'Architecture' },
  { id: 'Cpu', label: 'Hardware' },
  { id: 'Database', label: 'Databases' },
  { id: 'Compass', label: 'Exploration' },
  { id: 'Sparkles', label: 'Creative' }
];

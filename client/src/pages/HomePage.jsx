import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown, ArrowRight, ArrowUpRight, AudioLines, BookOpen, BrainCircuit,
  BadgeCheck, Check, ChevronRight, CircleDollarSign, CirclePlay, Code2,
  Compass, FileText, GraduationCap, Image, MessageSquareText, NotebookPen,
  Share2, Sparkles, WandSparkles,
} from 'lucide-react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import MarketingLayout from '../components/MarketingLayout';

const courses = [
  { category: 'Development', title: 'Java, from first line to OOP', author: 'Maya Chen', level: 'Beginner', icon: Code2, color: 'indigo', price: 'Free', lessons: '12 note pages' },
  { category: 'Design', title: 'Design systems that scale', author: 'Theo Brooks', level: 'Intermediate', icon: Compass, color: 'pink', price: '$12', lessons: '8 note pages' },
  { category: 'Data', title: 'A practical guide to SQL', author: 'Priya Shah', level: 'Beginner', icon: AudioLines, color: 'cyan', price: '$8', lessons: '10 note pages' },
];

const filters = ['Featured', 'Development', 'Design', 'Data'];
const featureColors = {
  indigo: 'border-indigo-300/15 bg-indigo-400/10 text-indigo-300',
  violet: 'border-violet-300/15 bg-violet-400/10 text-violet-300',
  cyan: 'border-cyan-300/15 bg-cyan-400/10 text-cyan-300',
  pink: 'border-pink-300/15 bg-pink-400/10 text-pink-300',
};
const courseColors = {
  indigo: { background: 'from-indigo-500/20', glow: 'bg-indigo-400/10', icon: 'text-indigo-200' },
  pink: { background: 'from-pink-500/20', glow: 'bg-pink-400/10', icon: 'text-pink-200' },
  cyan: { background: 'from-cyan-500/20', glow: 'bg-cyan-400/10', icon: 'text-cyan-200' },
};

function HeroWorkspace() {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(pointerY, { stiffness: 120, damping: 22 });
  const rotateY = useSpring(pointerX, { stiffness: 120, damping: 22 });

  const handlePointerMove = (event) => {
    if (reduceMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 10);
    pointerY.set((0.5 - (event.clientY - bounds.top) / bounds.height) * 8);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <div className="hero-scene relative mx-auto w-full max-w-[570px]" onPointerMove={handlePointerMove} onPointerLeave={resetPointer}>
      <motion.div
        className="hero-workspace relative"
        style={{ rotateX, rotateY }}
        initial={reduceMotion ? false : { opacity: 0, y: 22, rotateY: -8 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ duration: 0.9, ease: [0.2, 0.75, 0.2, 1] }}
      >
        <div className="overflow-hidden rounded-[22px] border border-white/[0.12] bg-[#12131a]/95 shadow-[0_35px_110px_-45px_rgba(74,76,255,0.55)]">
          <div className="flex h-11 items-center gap-1.5 border-b border-white/[0.07] px-4">
            <span className="h-2 w-2 rounded-full bg-[#ff625a]" />
            <span className="h-2 w-2 rounded-full bg-[#f7bd4f]" />
            <span className="h-2 w-2 rounded-full bg-[#42c66b]" />
            <span className="ml-3 text-[10px] text-zinc-500">nurodesk / java fundamentals</span>
          </div>
          <div className="grid min-h-[330px] grid-cols-[116px_1fr] sm:grid-cols-[145px_1fr]">
            <aside className="border-r border-white/[0.07] p-3 sm:p-4">
              <div className="mb-4 flex items-center gap-2 text-[10px] font-bold text-zinc-300">
                <BookOpen size={12} className="text-indigo-300" /> Java path
              </div>
              <div className="space-y-1.5 text-[9px] text-zinc-500">
                <div className="rounded-md bg-indigo-500/15 px-2 py-1.5 text-indigo-200">01 · Inheritance</div>
                <div className="px-2 py-1">02 · Polymorphism</div>
                <div className="px-2 py-1">03 · Interfaces</div>
              </div>
              <div className="mt-7 rounded-lg border border-white/[0.07] bg-white/[0.025] p-2.5">
                <div className="mb-2 flex items-center gap-1.5 text-[9px] font-semibold text-zinc-300">
                  <BrainCircuit size={11} className="text-violet-300" /> Quick quiz
                </div>
                <div className="h-1 rounded-full bg-white/10"><div className="h-1 w-2/3 rounded-full bg-violet-400" /></div>
                <p className="mt-1.5 text-[8px] text-zinc-600">4 of 6 questions</p>
              </div>
            </aside>
            <div className="relative p-4 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2 py-1 text-[8px] font-semibold text-indigo-200">JAVA · OBJECT-ORIENTED</span>
                <button type="button" aria-label="Share note preview" className="text-zinc-600"><Share2 size={12} /></button>
              </div>
              <h3 className="text-[21px] font-bold tracking-tight text-white sm:text-[25px]">Inheritance</h3>
              <p className="mt-2 max-w-[300px] text-[10px] leading-5 text-zinc-400 sm:text-[11px]">
                Build on what you already know. A child class can reuse and extend the behavior of its parent.
              </p>
              <div className="mt-4 rounded-lg border border-white/[0.07] bg-[#0c0d12] p-3 font-mono text-[9px] leading-5 sm:text-[10px]">
                <div><span className="text-violet-300">class</span> <span className="text-sky-200">Animal</span> {'{'}</div>
                <div className="pl-4 text-zinc-400">void speak() {'{'} ... {'}'}</div>
                <div>{'}'}</div>
                <div className="mt-1"><span className="text-violet-300">class</span> <span className="text-sky-200">Dog</span> <span className="text-zinc-500">extends</span> <span className="text-sky-200">Animal</span> {'{'}</div>
                <div>{'}'}</div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-violet-400/15 bg-violet-400/[0.06] px-3 py-2.5">
                <Sparkles size={12} className="shrink-0 text-violet-300" />
                <p className="text-[9px] leading-4 text-violet-100/80">AI helped you understand this. Save the explanation to your notes.</p>
                <ArrowDown size={12} className="ml-auto shrink-0 text-violet-300" />
              </div>
            </div>
          </div>
        </div>

        <motion.div
          className="absolute -left-7 top-[24%] hidden rounded-xl border border-white/10 bg-[#181922]/95 p-3 shadow-xl sm:block"
          animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transform: 'translateZ(55px)' }}
        >
          <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300"><Check size={14} /></span><div><p className="text-[9px] font-bold text-white">Knowledge saved</p><p className="mt-0.5 text-[8px] text-zinc-500">Added to your notes</p></div></div>
        </motion.div>
        <motion.div
          className="absolute -right-4 bottom-[-18px] hidden rounded-xl border border-indigo-300/20 bg-[#1a1b27]/95 px-3.5 py-3 shadow-xl sm:block"
          animate={reduceMotion ? undefined : { y: [0, 7, 0] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transform: 'translateZ(70px)' }}
        >
          <div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-400/15 text-indigo-200"><BrainCircuit size={15} /></span><div><p className="text-[9px] font-bold text-white">Your AI study buddy</p><p className="mt-0.5 text-[8px] text-zinc-500">Ready when you are</p></div><span className="ml-2 h-1.5 w-1.5 rounded-full bg-emerald-400" /></div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, centered = false }) {
  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-xl'}>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300">{eyebrow}</p>
      <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl">{title}</h2>
      <p className="mt-4 text-sm leading-6 text-zinc-400 sm:text-[15px]">{description}</p>
    </div>
  );
}

function HomePage() {
  const [activeFilter, setActiveFilter] = useState('Featured');
  const visibleCourses = activeFilter === 'Featured' ? courses : courses.filter((course) => course.category === activeFilter);

  return (
    <MarketingLayout>
      <main>
        <section className="marketing-grid relative">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-indigo-600/10 blur-[130px]" />
            <div className="absolute right-0 top-40 h-[360px] w-[360px] rounded-full bg-violet-500/[0.08] blur-[120px]" />
          </div>
          <div className="relative mx-auto grid min-h-[650px] max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.94fr_1.06fr] lg:gap-6 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="relative z-10"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] font-medium text-zinc-300 sm:text-xs">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-400/15 text-indigo-300"><Sparkles size={11} /></span>
                Your knowledge, in one place
                <ChevronRight size={12} className="text-zinc-600" />
              </div>
              <h1 className="max-w-[620px] text-[48px] font-semibold leading-[1.05] tracking-[-0.06em] text-white sm:text-[62px] lg:text-[70px]">
                Learn it.
                <br />
                <span className="hero-gradient-text">Make it yours.</span>
              </h1>
              <p className="mt-6 max-w-[490px] text-[15px] leading-7 text-zinc-400 sm:text-base">
                A home for everything you&apos;re learning. Build beautiful notes, learn with AI, and turn your knowledge into something worth sharing.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/register" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/60 transition hover:-translate-y-0.5 hover:bg-indigo-400">
                  Create your learning space <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-5 py-3.5 text-sm font-semibold text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.06]">
                  Explore the workspace <CirclePlay size={16} className="text-zinc-400" />
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-zinc-500 sm:text-xs">
                <span className="inline-flex items-center gap-1.5"><Check size={13} className="text-emerald-400" /> Your notes stay yours</span>
                <span className="inline-flex items-center gap-1.5"><Check size={13} className="text-emerald-400" /> Learn at your own pace</span>
              </div>
            </motion.div>
            <HeroWorkspace />
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-7 sm:grid-cols-4 sm:px-8">
            {[
              ['01', 'Create a skill space'],
              ['02', 'Capture what clicks'],
              ['03', 'Learn with your AI'],
              ['04', 'Share what you know'],
            ].map(([number, text]) => (
              <div key={number} className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-indigo-300/70">{number}</span>
                <span className="text-xs font-medium text-zinc-300 sm:text-sm">{text}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <SectionHeading
              eyebrow="A better way to learn"
              title="From curious to confident, one note at a time."
              description="Your learning space grows with you. Bring together your own ideas, AI-powered explanations, and notes shared by people who know their stuff."
            />
            <Link to="/about" className="group hidden items-center gap-2 pb-1 text-sm font-semibold text-zinc-300 hover:text-white sm:inline-flex">
              Get to know Nurodesk <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: NotebookPen, title: 'Notes that feel like yours', copy: 'Shape every page to the way you think, with flexible, expressive note spaces.', tint: 'indigo' },
              { icon: MessageSquareText, title: 'An AI that teaches with you', copy: 'Ask the questions you have. Save the explanations that make it click.', tint: 'violet' },
              { icon: BrainCircuit, title: 'Practice what you learn', copy: 'Turn your notes into quizzes and come back to concepts with confidence.', tint: 'cyan' },
              { icon: Share2, title: 'Knowledge is better shared', copy: 'Invite a friend to read or edit, or share your skill notes with learners.', tint: 'pink' },
            ].map(({ icon: Icon, title, copy, tint }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-2xl border border-white/[0.07] bg-[#12131a]/80 p-5 transition hover:-translate-y-1 hover:border-white/[0.14] sm:p-6"
              >
                <div className={`mb-7 flex h-10 w-10 items-center justify-center rounded-xl border ${featureColors[tint]}`}><Icon size={18} /></div>
                <h3 className="text-sm font-bold text-white">{title}</h3>
                <p className="mt-2.5 text-xs leading-5 text-zinc-500 sm:text-[13px]">{copy}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-[#101117]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="grid items-end gap-7 lg:grid-cols-[1fr_auto]">
              <SectionHeading
                eyebrow="Learn it. Test it. Teach it."
                title="Your next skill can take you somewhere."
                description="Explore free and paid skill courses, check your understanding with quizzes, and celebrate what you finish. Have knowledge to share? Your notes can become someone else’s starting point."
              />
              <Link to="/register" className="group inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 transition hover:text-indigo-200">
                Join the learning community <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Compass, label: 'Discover', title: 'Free or paid, find your path', copy: 'Browse public skill courses from learners and instructors, and choose a learning path that fits you.', color: 'indigo' },
                { icon: BrainCircuit, label: 'Practice', title: 'Quizzes from your notes', copy: 'Generate quizzes from course notes, then use them to check what you understand and what to revisit.', color: 'violet' },
                { icon: BadgeCheck, label: 'Achieve', title: 'Earn a certificate', copy: 'Complete a learning path and its quiz to celebrate your progress with a shareable certificate.', color: 'cyan' },
                { icon: CircleDollarSign, label: 'Create', title: 'Share notes. Earn from them.', copy: 'Anyone can publish a skill course from their notes, set a price, and share what they know.', color: 'pink' },
              ].map(({ icon: Icon, label, title, copy, color }, index) => (
                <motion.article
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="rounded-2xl border border-white/[0.07] bg-[#15161e] p-5 transition hover:-translate-y-1 hover:border-white/[0.14] sm:p-6"
                >
                  <div className={`mb-7 flex h-10 w-10 items-center justify-center rounded-xl border ${featureColors[color]}`}><Icon size={18} /></div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-600">{label}</p>
                  <h3 className="mt-2 text-sm font-bold text-white">{title}</h3>
                  <p className="mt-2.5 text-xs leading-5 text-zinc-500 sm:text-[13px]">{copy}</p>
                </motion.article>
              ))}
            </div>
            <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-indigo-300/15 bg-indigo-400/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-300/15 bg-indigo-300/[0.08] text-indigo-200"><GraduationCap size={17} /></span>
                <p className="text-xs leading-5 text-zinc-300 sm:text-sm">You don&apos;t have to be an instructor to teach. If you have notes worth sharing, you can create a course.</p>
              </div>
              <Link to="/register" className="group inline-flex shrink-0 items-center gap-2 text-xs font-bold text-indigo-200 transition hover:text-white">
                Start creating <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-[#101117]">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Your AI study buddy"
                title="A good question can change everything."
                description="Get unstuck, go deeper, and turn a helpful answer into a lasting part of your learning space."
              />
              <div className="mt-8 space-y-4">
                {[
                  [WandSparkles, 'Ask about any topic in your skill'],
                  [FileText, 'Save useful answers straight to a page'],
                  [Image, 'Explore visual references for tricky ideas'],
                ].map(([Icon, text]) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-zinc-300">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-400/15 bg-indigo-400/[0.08] text-indigo-300"><Icon size={15} /></span>
                    {text}
                  </div>
                ))}
              </div>
              <Link to="/pricing" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 transition hover:text-indigo-200">
                See AI token packs <ArrowRight size={15} />
              </Link>
            </div>
            <div className="rounded-[22px] border border-white/[0.08] bg-[#15161e] p-4 shadow-[0_30px_90px_-50px_rgba(105,90,255,0.4)] sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-400/15 text-indigo-300"><Sparkles size={14} /></span>Study buddy</div>
                <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-2.5 py-1 text-[9px] font-medium text-emerald-300">Java · Inheritance</span>
              </div>
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-500/15 px-4 py-3 text-xs leading-5 text-indigo-100">
                Can you explain inheritance with a simple real-world example?
              </div>
              <div className="mt-4 flex gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-400/10 text-violet-300"><Sparkles size={13} /></span>
                <div className="rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.025] p-4">
                  <p className="text-xs leading-6 text-zinc-300">Think of a <span className="font-semibold text-white">Vehicle</span> as a parent class. A <span className="font-semibold text-white">Bicycle</span> can inherit shared traits like wheels and a move() method, then add its own unique behavior.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300/20 bg-indigo-300/[0.07] px-2.5 py-2 text-[10px] font-semibold text-indigo-200"><NotebookPen size={12} /> Add to notes</button>
                    <button type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 py-2 text-[10px] font-medium text-zinc-400"><Image size={12} /> Find a visual</button>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2 rounded-xl border border-white/[0.07] bg-[#0e0f15] px-3 py-2.5 text-[10px] text-zinc-600">
                <span>Ask about your skill...</span><span className="ml-auto flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500 text-white"><ArrowRight size={12} /></span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="The learning marketplace"
              title="A good place to find your next skill."
              description="Browse public free and paid skill courses made by the community. Learn from someone else, or turn your own notes into a course."
            />
            <Link to="/register" className="group inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 transition hover:text-white">
              Browse all skills <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="mt-9 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                type="button"
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${activeFilter === filter ? 'bg-white text-[#101117]' : 'border border-white/[0.08] text-zinc-400 hover:border-white/20 hover:text-white'}`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleCourses.map(({ category, title, author, level, icon: Icon, color, price, lessons }, index) => (
              <motion.article
                key={title}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12131a] transition hover:-translate-y-1 hover:border-white/[0.16]"
              >
                <div className={`relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br ${courseColors[color].background} via-[#161720] to-[#111219]`}>
                  <div className={`absolute h-28 w-28 rounded-full ${courseColors[color].glow} blur-2xl`} />
                  <div className={`relative flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/10 bg-[#171821]/80 shadow-xl transition duration-300 group-hover:scale-110 group-hover:-rotate-3 ${courseColors[color].icon}`}><Icon size={28} /></div>
                  <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[9px] font-semibold text-zinc-300">{category}</span>
                  <span className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[9px] font-semibold text-zinc-300">{price}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500"><span>{level}</span><span>·</span><span>{lessons}</span></div>
                  <h3 className="mt-2 text-base font-bold tracking-tight text-white">{title}</h3>
                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
                    <span className="text-[11px] text-zinc-400">by {author}</span>
                    <Link to="/register" aria-label={`Explore ${title}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-400 transition group-hover:border-indigo-400/30 group-hover:bg-indigo-400/10 group-hover:text-indigo-200"><ArrowUpRight size={15} /></Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-center">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white">
              Discover more skills <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-indigo-300/15 bg-[#151621] px-6 py-12 sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -right-10 -top-32 h-80 w-80 rounded-full bg-indigo-500/15 blur-[90px]" />
            <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div className="max-w-xl">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">Your next idea is waiting</p>
                <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">Make room for what you&apos;ll learn next.</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">Create your first skill space and start collecting the things that make sense to you.</p>
              </div>
              <Link to="/register" className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#111116] transition hover:bg-indigo-100">
                Get started for free <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </MarketingLayout>
  );
}

export default HomePage;

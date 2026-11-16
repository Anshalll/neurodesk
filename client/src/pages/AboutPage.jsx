import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, BrainCircuit, Compass, Heart, Lightbulb,
  MessageCircle, NotebookPen, Sparkles, Users,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import MarketingLayout from '../components/MarketingLayout';

const principles = [
  { icon: Lightbulb, title: 'Curiosity comes first', copy: 'Learning begins with a question. Your space should make it easier to follow the ones that matter to you.' },
  { icon: Heart, title: 'Knowledge is personal', copy: 'There is no one right way to understand something. Make notes that fit the way your own mind works.' },
  { icon: Users, title: 'We learn better together', copy: 'Share an explanation, learn from another perspective, or build something useful with a friend.' },
];

function AboutPage() {
  const reduceMotion = useReducedMotion();

  return (
    <MarketingLayout>
      <main>
        <section className="relative overflow-hidden px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[760px] -translate-x-1/2 rounded-full bg-violet-600/[0.1] blur-[130px]" />
          <div className="relative mx-auto max-w-4xl text-center">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/10 text-violet-200"><BookOpen size={20} /></span>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-300">A little about us</p>
              <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.055em] text-white sm:text-6xl">
                Learning shouldn&apos;t disappear when the tab closes.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
                Nurodesk is a place to bring your learning together: the notes you make, the questions you ask, and the ideas you discover along the way.
              </p>
            </motion.div>
            <div className="relative mx-auto mt-16 max-w-3xl">
              <motion.div
                className="about-orbit-card rounded-[26px] border border-white/[0.09] bg-[#13141b]/85 p-5 shadow-[0_30px_100px_-50px_rgba(124,92,255,0.5)] sm:p-8"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.97, rotateX: 6 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    [Compass, 'Choose a skill', 'Start anywhere'],
                    [NotebookPen, 'Make it yours', 'Keep what clicks'],
                    [BrainCircuit, 'Keep exploring', 'Ask, practice, share'],
                  ].map(([Icon, title, caption], index) => (
                    <motion.div
                      key={title}
                      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: 0.24 + index * 0.12 }}
                      className="relative rounded-2xl border border-white/[0.07] bg-[#191a23] p-5 text-left"
                    >
                      <span className="mb-8 flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-300/15 bg-indigo-300/[0.08] text-indigo-200"><Icon size={17} /></span>
                      <p className="text-xs font-bold text-white">{title}</p>
                      <p className="mt-1 text-[10px] text-zinc-500">{caption}</p>
                      {index < 2 && <ArrowRight size={14} className="absolute right-3 top-1/2 hidden -translate-y-1/2 text-zinc-700 sm:block" />}
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-black/15 p-3 text-left">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-300/10 text-violet-200"><Sparkles size={14} /></span>
                  <span className="text-[10px] text-zinc-400">Each skill becomes a living space for your ideas.</span>
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-[#101117]">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">Why Nurodesk</p>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl">Learning is more than collecting answers.</h2>
            </div>
            <div className="space-y-5 text-sm leading-7 text-zinc-400">
              <p>It is the moment a tricky idea finally makes sense. The note you write in your own words. The question you were a little nervous to ask. Those small moments add up, but they can get scattered across tabs, notebooks, and conversations.</p>
              <p>Nurodesk brings those moments into one workspace. Create a space for a skill, shape notes around your understanding, and ask AI for help when you need another perspective. Then revisit, practice, or share what you have learned.</p>
              <p>And because useful knowledge should travel, learners and instructors can share their skill notes with the community. There is always more than one way to learn something well.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">What we believe</p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">A few ideas we keep coming back to.</h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, copy }, index) => (
              <motion.article
                key={title}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                className="rounded-2xl border border-white/[0.07] bg-[#12131a] p-6 sm:p-7"
              >
                <span className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-300/15 bg-indigo-300/[0.08] text-indigo-200"><Icon size={18} /></span>
                <h3 className="text-sm font-bold text-white">{title}</h3>
                <p className="mt-3 text-xs leading-6 text-zinc-500 sm:text-[13px]">{copy}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#151621] px-6 py-12 text-center sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute left-1/2 top-0 h-60 w-96 -translate-x-1/2 rounded-full bg-violet-500/10 blur-[90px]" />
            <div className="relative">
              <span className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-300/10 text-violet-200"><MessageCircle size={18} /></span>
              <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">Bring your curiosity. We&apos;ll save you a page.</h2>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-zinc-400">Start building a learning space that feels like your own.</p>
              <Link to="/register" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#111116] transition hover:bg-indigo-100">
                Start learning <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </MarketingLayout>
  );
}

export default AboutPage;

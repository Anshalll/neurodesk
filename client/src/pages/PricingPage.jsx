import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, CircleHelp, Coins, Gift, MessageSquareText, Sparkles, WandSparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import MarketingLayout from '../components/MarketingLayout';

const packs = [
  { name: 'Little boost', tokens: '500', price: '$4', detail: 'A few more curious questions', features: ['500 AI tokens', 'Use across your skill spaces', 'Tokens never expire'], icon: Sparkles },
  { name: 'Study session', tokens: '1,600', price: '$10', detail: 'For a topic you want to go deeper on', features: ['1,400 tokens + 200 bonus', 'Use across your skill spaces', 'Tokens never expire'], icon: WandSparkles, featured: true },
  { name: 'Deep focus', tokens: '4,000', price: '$22', detail: 'More room for big learning goals', features: ['3,400 tokens + 600 bonus', 'Use across your skill spaces', 'Tokens never expire'], icon: Coins },
];

const faqs = [
  ['What are AI tokens?', 'Tokens are credits for Nurodesk AI features, such as asking your study buddy a question or exploring a visual reference.'],
  ['Do I need tokens to write notes?', 'No. Your notes, skill spaces, and shared learning remain yours to use. Tokens are only for AI-powered features.'],
  ['Do tokens expire?', 'No. Purchased tokens stay in your account until you use them.'],
  ['Will a course purchase include tokens?', 'Some skill courses may include AI tokens as a bonus. The amount is shown with that course before you choose to get it.'],
];

function PricingPage() {
  const reduceMotion = useReducedMotion();

  return (
    <MarketingLayout>
      <main>
        <section className="relative overflow-hidden px-5 pb-12 pt-20 sm:px-8 sm:pb-16 sm:pt-28">
          <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[720px] -translate-x-1/2 rounded-full bg-indigo-600/[0.12] blur-[120px]" />
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="relative mx-auto max-w-3xl text-center"
          >
            <span className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-300/20 bg-indigo-300/10 text-indigo-200"><Coins size={19} /></span>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-300">Simple, flexible AI credits</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.05em] text-white sm:text-6xl">More room to wonder.</h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base sm:leading-7">
              Pick up AI tokens when you need them. Use them for thoughtful answers, helpful visuals, and those questions that take you one layer deeper.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[10px] text-zinc-400"><Gift size={12} className="text-emerald-300" /> Some courses may include bonus tokens</p>
          </motion.div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-24">
          <div className="grid items-stretch gap-4 lg:grid-cols-3">
            {packs.map(({ name, tokens, price, detail, features, icon: Icon, featured }, index) => (
              <motion.article
                key={name}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.09 }}
                className={`relative flex flex-col rounded-2xl border p-6 sm:p-7 ${featured ? 'border-indigo-300/35 bg-[#171823] shadow-[0_22px_80px_-50px_rgba(99,102,241,0.7)]' : 'border-white/[0.08] bg-[#12131a]'}`}
              >
                {featured && <span className="absolute right-5 top-5 rounded-full bg-indigo-400/15 px-2.5 py-1 text-[9px] font-bold text-indigo-200">POPULAR</span>}
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${featured ? 'bg-indigo-400/15 text-indigo-200' : 'bg-white/[0.06] text-zinc-300'}`}><Icon size={18} /></div>
                <h2 className="mt-6 text-sm font-bold text-white">{name}</h2>
                <p className="mt-1 text-xs text-zinc-500">{detail}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tracking-[-0.05em] text-white">{price}</span>
                  <span className="text-xs text-zinc-500">one-time</span>
                </div>
                <div className="mt-5 rounded-xl border border-white/[0.07] bg-black/15 px-4 py-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">AI tokens</p>
                  <p className="mt-1 text-xl font-bold text-white">{tokens}</p>
                </div>
                <ul className="mt-5 flex-1 space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-xs text-zinc-400"><Check size={14} className="shrink-0 text-emerald-300" />{feature}</li>
                  ))}
                </ul>
                <Link to="/register" className={`mt-7 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition ${featured ? 'bg-indigo-500 text-white hover:bg-indigo-400' : 'border border-white/10 text-zinc-200 hover:border-white/20 hover:bg-white/[0.04]'}`}>
                  Get {tokens} tokens <ArrowRight size={14} />
                </Link>
              </motion.article>
            ))}
          </div>
          <p className="mt-5 text-center text-[10px] text-zinc-600">Token packs are for AI features. No subscription required. Prices shown in USD.</p>
        </section>

        <section className="border-y border-white/[0.06] bg-[#101117]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-3">
            {[
              [MessageSquareText, 'Ask anything', 'Explore an idea with your AI study buddy, right inside the skill you are learning.'],
              [WandSparkles, 'Save the good bits', 'Bring a clear explanation back into your own notes to keep and revisit.'],
              [Sparkles, 'See it another way', 'Use AI-powered visual exploration to find a fresh perspective on a topic.'],
            ].map(([Icon, title, copy]) => (
              <div key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-300/15 bg-indigo-300/[0.08] text-indigo-200"><Icon size={17} /></span>
                <div><h3 className="text-sm font-bold text-white">{title}</h3><p className="mt-2 text-xs leading-5 text-zinc-500">{copy}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="mb-9 text-center">
            <span className="mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300"><CircleHelp size={17} /></span>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white">A few things to know</h2>
            <p className="mt-3 text-sm text-zinc-500">The details, without the fine-print energy.</p>
          </div>
          <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-zinc-200 marker:hidden">
                  {question}<span className="text-lg font-normal text-zinc-600 transition group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-2xl pt-3 text-xs leading-6 text-zinc-500">{answer}</p>
              </details>
            ))}
          </div>
          <p className="mt-7 text-center text-xs text-zinc-500">Want to know more? <Link to="/about" className="font-semibold text-indigo-300 hover:text-indigo-200">Meet Nurodesk <ArrowRight className="inline" size={12} /></Link></p>
        </section>
      </main>
    </MarketingLayout>
  );
}

export default PricingPage;

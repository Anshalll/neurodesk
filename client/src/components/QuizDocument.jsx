import React, { useState } from 'react';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function QuizDocument({ skill, quiz, onBack }) {
  const [answers, setAnswers] = useState({});
  const questions = quiz.questions || [{
    id: 'sample',
    type: quiz.choices?.length ? 'mcq' : 'text',
    prompt: quiz.sampleQuestion,
    choices: quiz.choices
  }];
  const answeredCount = questions.filter((question) => {
    const answer = answers[question.id];
    return answer?.choice || answer?.text?.trim();
  }).length;

  const updateAnswer = (questionId, answer) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: answer
    }));
  };

  return (
    <div className="Scroller min-h-0 flex-1 overflow-y-auto px-4 pb-12 pt-6 sm:px-8 sm:pt-10">
      <article className="mx-auto min-h-[680px] max-w-[780px] rounded-2xl border border-white/[0.07] bg-[#17171c] px-6 py-8 shadow-[0_24px_90px_rgba(0,0,0,0.28)] sm:px-14 sm:py-12">
        <div className="mb-9 border-b border-white/[0.07] pb-7">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 rounded-lg text-xs font-medium text-[#92929e] transition hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to notes
          </button>
          <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-indigo-300/80">
            <FileQuestion size={13} />
            <span>{skill.name} quiz</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-[2.5rem]">
            {quiz.title}
          </h1>
          <p className="mt-3 text-xs text-[#71717a]">
            {questions.length} {questions.length === 1 ? 'sample question' : 'sample questions'}
            {quiz.duration ? ` · ${quiz.duration}` : ''}
            {' · '}{answeredCount} of {questions.length} answered
          </p>
        </div>

        <div className="space-y-8">
          {questions.map((question, index) => {
            const answer = answers[question.id] || {};
            const isMultipleChoice = question.type === 'mcq';

            return (
              <section key={question.id} className="space-y-4">
                <h2 className="text-base font-semibold leading-7 text-[#e4e4e7]">
                  <span className="mr-2 text-indigo-300">Q{index + 1}.</span>
                  {question.prompt}
                </h2>

                {isMultipleChoice ? (
                  <fieldset className="space-y-2">
                    <legend className="mb-2 text-xs font-medium text-[#92929e]">
                      Choose an answer
                    </legend>
                    {question.choices.map((choice, choiceIndex) => (
                      <label
                        key={choice}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                          answer.choice === choice
                            ? 'border-indigo-400/50 bg-indigo-500/[0.12] text-indigo-100'
                            : 'border-white/[0.07] bg-white/[0.02] text-[#c4c4cc] hover:border-white/15 hover:bg-white/[0.04]'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`quiz-${quiz.id}-${question.id}`}
                          value={choice}
                          checked={answer.choice === choice}
                          onChange={() => updateAnswer(question.id, { choice, text: '' })}
                          className="accent-indigo-400"
                        />
                        <span className="min-w-0 flex-1">{choice}</span>
                        <span className="text-xs text-[#71717a]">
                          {String.fromCharCode(65 + choiceIndex)}
                        </span>
                      </label>
                    ))}
                  </fieldset>
                ) : (
                  <label className="block">
                    <span className="mb-2 block text-xs font-medium text-[#92929e]">
                      Your answer
                    </span>
                    <input
                      type="text"
                      value={answer.text || ''}
                      onChange={(event) => updateAnswer(question.id, {
                        choice: '',
                        text: event.target.value
                      })}
                      placeholder="Write your answer here..."
                      className="w-full rounded-xl border border-white/[0.09] bg-[#121216] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#62626e] focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/10"
                    />
                  </label>
                )}
              </section>
            );
          })}
        </div>
      </article>
    </div>
  );
}

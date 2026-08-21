import { AlertTriangle, CheckCircle, HelpCircle, Lightbulb, ListChecks, Target } from 'lucide-react';
import { RichText } from './RichText';

export function ExplanationResultCard({ aiResponse, titleOverride, showFinalAnswer = true }) {
  if (!aiResponse) return null;
  const finalAnswer = readFinalAnswer(aiResponse.finalAnswer);
  const malformedFinalAnswer = Boolean(aiResponse.finalAnswer) && !finalAnswer;
  const title = titleOverride || resultTitle(aiResponse.resultStatus);
  const warningTitle = aiResponse.resultStatus === 'INCOMPLETE_IMAGE'
    ? 'Upload a clearer photo to continue'
    : 'We used the image as the main question';
  return (
    <article className="fade-in smooth-card workspace-card overflow-hidden">
      <div className="workspace-core overflow-hidden">
      <div className="border-b border-slate-200/80 bg-gradient-to-r from-white to-blue-50/60 px-4 py-4 sm:px-5">
      <div className="flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-ocean shadow-inner">
          <Lightbulb size={19} />
        </span>
        <h2 className="text-xl font-bold text-ink">{title}</h2>
      </div>
      </div>
      <div className="grid gap-3 p-4 sm:p-5">
        {aiResponse.inputWarning ? (
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 shrink-0" size={18} />
            <div>
              <p className="font-extrabold">{warningTitle}</p>
              <p className="mt-1 font-medium leading-5">{aiResponse.inputWarning}</p>
            </div>
          </div>
        ) : null}
        <ResultSection icon={HelpCircle} title="Detected question">
          <RichText>{aiResponse.detectedQuestion}</RichText>
        </ResultSection>
        {showFinalAnswer && finalAnswer ? (
          <ResultSection icon={Target} title="Final answer" accent>
            <FinalAnswerContent answer={finalAnswer} />
          </ResultSection>
        ) : null}
        {aiResponse.explanation ? (
          <ResultSection icon={ListChecks} title={aiResponse.resultStatus === 'QUESTION_SELECTION_REQUIRED' ? 'What to do next' : 'Step-by-step solution'}>
            <StepByStepContent text={aiResponse.explanation} questionNumber={aiResponse.questionNumber} />
          </ResultSection>
        ) : null}
        {malformedFinalAnswer ? (
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 shrink-0" size={18} />
            <p className="font-semibold leading-5">The saved final answer could not be displayed correctly. Try the solution again to generate a clean result.</p>
          </div>
        ) : null}
      </div>
      </div>
    </article>
  );
}

function resultTitle(status) {
  if (status === 'QUESTION_SELECTION_REQUIRED') return 'Choose a question to solve';
  if (status === 'INCOMPLETE_IMAGE') return 'Photo needs attention';
  if (status === 'PARTIAL_RESULT') return 'Partial solution';
  return 'Your solution';
}

function readFinalAnswer(value) {
  if (!value) return '';
  const trimmed = value.trim();
  const candidate = trimmed.startsWith('```json')
    ? trimmed.slice(7).replace(/```\s*$/, '').trim()
    : trimmed;
  if (!candidate.startsWith('{')) return trimmed;
  try {
    const parsed = JSON.parse(candidate);
    return typeof parsed.finalAnswer === 'string' ? parsed.finalAnswer.trim() : '';
  } catch {
    return '';
  }
}

export function GradingResultCard({ result, hideScoreSummary = false, answerKey, onQuestionSelect }) {
  const score = Number(result.score || 0);
  const scoreStyle = score >= 80 ? 'text-ocean bg-sky-50 border-sky-200' : score >= 50 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-red-700 bg-red-50 border-red-200';
  const answerReview = buildAnswerReview(answerKey?.finalAnswer, result.userAnswer);

  return (
    <article className="fade-in smooth-card workspace-card">
      <div className="workspace-core p-4 sm:p-5">
      {!hideScoreSummary ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500">Your score</p>
            <p className="mt-1 text-3xl font-extrabold text-ink">{score}<span className="text-lg text-slate-400">/100</span></p>
          </div>
          <ScoreStatus score={score} scoreStyle={scoreStyle} />
        </div>
      ) : null}
      {result.userAnswerImageUrl ? <img src={result.userAnswerImageUrl} alt="Graded student answer" className={`${hideScoreSummary ? '' : 'mt-4 '}max-h-72 w-full rounded-2xl object-contain shadow-[0_14px_34px_rgba(15,23,42,0.10)]`} /> : null}
      <div className={`${hideScoreSummary ? '' : 'mt-4 '}grid gap-3`}>
        {answerReview.length ? <GradingAnswerGrid choices={answerReview} onQuestionSelect={onQuestionSelect} /> : null}
        {result.userAnswer ? (
          <ResultSection icon={HelpCircle} title="Student answer">
            <RichText>{result.userAnswer}</RichText>
          </ResultSection>
        ) : null}
        <ResultSection icon={CheckCircle} title="Feedback">
          <RichText>{result.feedback}</RichText>
        </ResultSection>
        {result.mistakes ? (
          <ResultSection icon={AlertTriangle} title="Mistakes">
            <RichText>{result.mistakes}</RichText>
          </ResultSection>
        ) : null}
        {result.improvementSuggestions ? (
          <ResultSection icon={Lightbulb} title="How to improve" accent>
            <RichText>{result.improvementSuggestions}</RichText>
          </ResultSection>
        ) : null}
      </div>
      </div>
    </article>
  );
}

function GradingAnswerGrid({ choices, onQuestionSelect }) {
  return (
    <section className="grading-answer-panel" aria-label="Answer review">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Target size={16} className="text-emerald-700" />
          Final answer review
        </div>
        <div className="grading-answer-legend" aria-label="Answer status legend">
          <span className="grading-answer-legend-correct">Correct</span>
          <span className="grading-answer-legend-wrong">Needs review</span>
        </div>
      </div>
      <div className="grading-answer-grid">
        {choices.map((choice) => (
          <button
            key={choice.question}
            type="button"
            className={`grading-answer-card grading-answer-${choice.status}`}
            onClick={() => onQuestionSelect?.(choice.question)}
            aria-label={`Question ${choice.question}, ${choice.status}`}
          >
            <span>Question {choice.question}</span>
            <strong>{choice.answer}</strong>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs font-medium text-slate-500">Select a question to jump to its explanation.</p>
    </section>
  );
}

function buildAnswerReview(answerKey, userAnswer) {
  const correctChoices = parseAnswerChoices(readFinalAnswer(answerKey));
  const studentChoices = new Map(parseAnswerChoices(userAnswer).map((choice) => [choice.question, choice.answer]));

  return correctChoices.map((choice) => {
    const studentAnswer = studentChoices.get(choice.question);
    return {
      question: choice.question,
      answer: choice.answer,
      status: !studentAnswer ? 'unknown' : studentAnswer === choice.answer ? 'correct' : 'wrong',
    };
  });
}

export function LatestGradeSummary({ result }) {
  if (!result) return null;
  const score = Number(result.score || 0);
  const scoreStyle = score >= 80 ? 'border-sky-200 bg-sky-50 text-ocean' : score >= 50 ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-red-200 bg-red-50 text-red-700';

  return (
    <section className="fade-in smooth-card workspace-card overflow-hidden">
      <div className="workspace-core bg-gradient-to-br from-white via-white to-blue-50/70 p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow border-blue-100 bg-blue-50 text-ocean">Latest check</p>
            <p className="mt-4 text-sm font-semibold text-slate-500">Student result</p>
            <p className="mt-1 text-5xl font-extrabold text-ink sm:text-6xl">
              {score}<span className="text-2xl text-slate-400 sm:text-3xl">/100</span>
            </p>
          </div>
          <div className="sm:text-right">
            <ScoreStatus score={score} scoreStyle={scoreStyle} />
            <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-slate-600 sm:ml-auto">
              {score >= 80 ? 'The answer matches the reference well. Review the feedback to keep the approach consistent.' : score >= 50 ? 'Review the feedback below, then try another answer to strengthen the weak points.' : 'Start with the feedback below, then correct the answer and check it again.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScoreStatus({ score, scoreStyle }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${scoreStyle}`}>
      {score >= 80 ? 'Strong work' : score >= 50 ? 'Needs review' : 'Needs correction'}
    </span>
  );
}

function ResultSection({ icon: Icon, title, children, accent = false }) {
  return (
    <section className={`result-section rounded-[1.15rem] border p-3.5 sm:p-4 ${accent ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200/90 bg-slate-50/90'}`}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
        <Icon size={16} className={accent ? 'text-emerald-700' : 'text-ocean'} />
        {title}
      </div>
      {children}
    </section>
  );
}

function StepByStepContent({ text, questionNumber }) {
  const normalizedText = normalizeAiText(text);
  const steps = splitExplanationSteps(normalizedText);

  if (!steps.length) {
    return <div id={questionNumber ? `grade-explain-question-${questionNumber}` : undefined}><RichText>{normalizedText}</RichText></div>;
  }

  return (
    <div className="ai-step-list">
      {steps.map((step, index) => {
        const label = stepLabel(step, index);
        return (
          <div id={`grade-explain-question-${label}`} key={`${label}-${index}`} className="ai-step-item" style={{ '--step-index': index }}>
            <span className="ai-step-index">{label}</span>
            <RichText className="ai-step-copy">{stripStepLabel(step)}</RichText>
          </div>
        );
      })}
    </div>
  );
}

/** Normalize dense AI text into readable blocks without changing the saved answer. */
function splitExplanationSteps(value) {
  const text = normalizeAiText(value)
    .split('\n')
    .filter((line) => !isStandaloneAnswerChoice(line))
    .join('\n')
    .trim();
  if (!text) {
    return [];
  }

  const lineSteps = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (lineSteps.length > 1 && lineSteps.some(isStepStart)) {
    return groupStepLines(lineSteps);
  }

  const parts = text
    .split(/\s(?=(?:\d{1,2}[.)]\s|Câu\s*\d{1,2}[:.)]\s*|Question\s*\d{1,2}[:.)]\s*))/gi)
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length >= 2 ? parts : [];
}

function isStandaloneAnswerChoice(value) {
  return /^\s*[A-D]\s*[,.;:]?\s*$/i.test(value);
}

function normalizeAiText(value) {
  return String(value || '')
    .replace(/\r/g, '')
    .replace(/\\n/g, '\n')
    .trim();
}

function isStepStart(value) {
  return /^(?:\d{1,2}[.)]\s|Câu\s*\d{1,2}[:.)]\s*|Question\s*\d{1,2}[:.)]\s*)/i.test(value);
}

function groupStepLines(lines) {
  const grouped = [];
  lines.forEach((line) => {
    if (isStepStart(line) || !grouped.length) {
      grouped.push(line);
      return;
    }
    grouped[grouped.length - 1] = `${grouped[grouped.length - 1]} ${line}`;
  });
  return grouped;
}

function stepLabel(value, index) {
  const match = String(value).match(/^(?:Câu|Question)?\s*(\d{1,2})/i);
  return match?.[1] || index + 1;
}

function stripStepLabel(value) {
  return String(value).replace(/^(?:\d{1,2}[.)]\s*|(?:Câu|Question)\s*\d{1,2}[:.)]\s*)/i, '').trim();
}

function FinalAnswerContent({ answer }) {
  const choices = parseAnswerChoices(answer);

  if (!choices.length) {
    return <RichText>{answer}</RichText>;
  }

  const compactChoicesOnly = String(answer)
    .replace(/(?:(?:Câu|Question)\s*)?\d{1,2}\s*[:.)-]?\s*[A-D]/gi, '')
    .replace(/[,\s.;:-]/g, '')
    .length === 0;

  return (
    <div className="grid gap-3">
      <div className="answer-choice-grid">
        {choices.map((choice) => (
          <span key={choice.question} className="answer-choice-card">
            <span className="answer-choice-label">Question {choice.question}</span>
            <span className="answer-choice-value">{choice.answer}</span>
          </span>
        ))}
      </div>
      {!compactChoicesOnly ? <RichText>{answer}</RichText> : null}
    </div>
  );
}

function parseAnswerChoices(answer) {
  const matches = [...String(answer || '').matchAll(/(?:^|[\s,;])(?:(?:Câu|Question)\s*)?(\d{1,2})\s*[:.)-]?\s*([A-D])(?=$|[\s,.;])/gi)];
  const seen = new Set();

  return matches.reduce((items, match) => {
    if (seen.has(match[1])) {
      return items;
    }
    seen.add(match[1]);
    items.push({ question: match[1], answer: match[2].toUpperCase() });
    return items;
  }, []);
}

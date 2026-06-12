import { AlertTriangle, CheckCircle, HelpCircle, Lightbulb, ListChecks, Target } from 'lucide-react';
import { RichText } from './RichText';

export function ExplanationResultCard({ aiResponse }) {
  if (!aiResponse) return null;
  const finalAnswer = readFinalAnswer(aiResponse.finalAnswer);
  const malformedFinalAnswer = Boolean(aiResponse.finalAnswer) && !finalAnswer;
  return (
    <article className="app-card overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-ocean">
          <Lightbulb size={19} />
        </span>
        <h2 className="text-lg font-extrabold text-ink">Your solution</h2>
      </div>
      </div>
      <div className="grid gap-3 p-4 sm:p-5">
        {aiResponse.inputWarning ? (
          <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 shrink-0" size={18} />
            <div>
              <p className="font-extrabold">We used the image as the main question</p>
              <p className="mt-1 font-medium leading-5">{aiResponse.inputWarning}</p>
            </div>
          </div>
        ) : null}
        <ResultSection icon={HelpCircle} title="Detected question">
          <RichText>{aiResponse.detectedQuestion}</RichText>
        </ResultSection>
        <ResultSection icon={ListChecks} title="Step-by-step solution">
          <RichText>{aiResponse.explanation}</RichText>
        </ResultSection>
        {finalAnswer ? (
          <ResultSection icon={Target} title="Final answer" accent>
            <RichText>{finalAnswer}</RichText>
          </ResultSection>
        ) : null}
        {malformedFinalAnswer ? (
          <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 shrink-0" size={18} />
            <p className="font-semibold leading-5">The saved final answer could not be displayed correctly. Try the solution again to generate a clean result.</p>
          </div>
        ) : null}
      </div>
    </article>
  );
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

export function GradingResultCard({ result }) {
  const score = Number(result.score || 0);
  const scoreStyle = score >= 80 ? 'text-ocean bg-sky-50 border-sky-200' : score >= 50 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-red-700 bg-red-50 border-red-200';

  return (
    <article className="fade-in smooth-card app-card p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-500">Your score</p>
          <p className="mt-1 text-3xl font-extrabold text-ink">{score}<span className="text-lg text-slate-400">/100</span></p>
        </div>
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${scoreStyle}`}>
          {score >= 80 ? 'Strong work' : score >= 50 ? 'Needs review' : 'Needs correction'}
        </span>
      </div>
      {result.userAnswerImageUrl ? <img src={result.userAnswerImageUrl} alt="Graded student answer" className="mt-4 max-h-72 w-full rounded-lg object-contain" /> : null}
      <div className="mt-4 grid gap-3">
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
    </article>
  );
}

function ResultSection({ icon: Icon, title, children, accent = false }) {
  return (
    <section className={`rounded-lg border p-4 ${accent ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-slate-50'}`}>
      <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-ink">
        <Icon size={16} className={accent ? 'text-emerald-700' : 'text-ocean'} />
        {title}
      </div>
      {children}
    </section>
  );
}

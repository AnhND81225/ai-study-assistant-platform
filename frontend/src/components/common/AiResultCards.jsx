import { AlertTriangle, CheckCircle, HelpCircle, Lightbulb, ListChecks, Target } from 'lucide-react';
import { RichText } from './RichText';

export function ExplanationResultCard({ aiResponse }) {
  if (!aiResponse) return null;
  return (
    <article className="app-card p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-mint text-ocean">
          <Lightbulb size={19} />
        </span>
        <h3 className="text-lg font-black text-ink">AI explanation</h3>
      </div>
      <div className="mt-4 grid gap-3">
        <ResultSection icon={HelpCircle} title="Detected question">
          <RichText>{aiResponse.detectedQuestion}</RichText>
        </ResultSection>
        <ResultSection icon={ListChecks} title="Step-by-step solution">
          <RichText>{aiResponse.explanation}</RichText>
        </ResultSection>
        {aiResponse.finalAnswer ? (
          <ResultSection icon={Target} title="Final answer" accent>
            <RichText>{aiResponse.finalAnswer}</RichText>
          </ResultSection>
        ) : null}
      </div>
    </article>
  );
}

export function GradingResultCard({ result }) {
  const score = Number(result.score || 0);
  const scoreStyle = score >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : score >= 50 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-red-700 bg-red-50 border-red-200';

  return (
    <article className="fade-in smooth-card app-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black text-slate-500">Score</p>
          <p className="mt-1 text-3xl font-black text-ink">{score}/100</p>
        </div>
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${scoreStyle}`}>
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
    <section className={`rounded-lg border p-3 ${accent ? 'border-sky-100 bg-mint/70' : 'border-sky-100 bg-paper'}`}>
      <div className="mb-1 flex items-center gap-2 text-sm font-black text-ink">
        <Icon size={16} className={accent ? 'text-ocean' : 'text-sea'} />
        {title}
      </div>
      {children}
    </section>
  );
}

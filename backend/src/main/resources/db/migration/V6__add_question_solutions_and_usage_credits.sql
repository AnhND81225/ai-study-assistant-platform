CREATE TABLE IF NOT EXISTS public.question_solutions (
    id bigserial PRIMARY KEY,
    submission_id bigint NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    question_number integer NOT NULL CHECK (question_number > 0),
    detected_question text NOT NULL,
    explanation text NOT NULL,
    final_answer text NOT NULL,
    model_name varchar(100),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uk_question_solutions_submission_number UNIQUE (submission_id, question_number)
);

CREATE INDEX IF NOT EXISTS idx_question_solutions_submission
    ON public.question_solutions(submission_id);

ALTER TABLE public.grading_results
    ADD COLUMN IF NOT EXISTS question_solution_id bigint
    REFERENCES public.question_solutions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_grading_results_question_solution
    ON public.grading_results(question_solution_id);

ALTER TABLE public.ai_usage_logs
    ADD COLUMN IF NOT EXISTS credits_used integer NOT NULL DEFAULT 1;

ALTER TABLE public.ai_usage_logs
    DROP CONSTRAINT IF EXISTS ai_usage_logs_request_type_check;

ALTER TABLE public.ai_usage_logs
    ADD CONSTRAINT ai_usage_logs_request_type_check
    CHECK (request_type IN ('SCAN', 'EXPLAIN', 'GRADE'));

ALTER TABLE public.ai_usage_logs
    DROP CONSTRAINT IF EXISTS ai_usage_logs_credits_used_check;

ALTER TABLE public.ai_usage_logs
    ADD CONSTRAINT ai_usage_logs_credits_used_check
    CHECK (credits_used >= 0);

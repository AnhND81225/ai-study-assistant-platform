-- Keep the database status constraint aligned with the SubmissionStatus enum.
-- Flyway applies this once on every environment, including Neon through Render.
DO $$
BEGIN
    IF to_regclass('public.submissions') IS NOT NULL THEN
        ALTER TABLE public.submissions
            DROP CONSTRAINT IF EXISTS submissions_status_check;

        ALTER TABLE public.submissions
            ADD CONSTRAINT submissions_status_check
            CHECK (status IN (
                'UPLOADED',
                'EXPLAINED',
                'QUESTION_SELECTION_REQUIRED',
                'INCOMPLETE_IMAGE',
                'PARTIAL_RESULT',
                'AI_FAILED'
            ));
    END IF;
END $$;

DO $$
BEGIN
    IF to_regclass('public.ai_responses') IS NOT NULL THEN
        ALTER TABLE public.ai_responses
            ADD COLUMN IF NOT EXISTS question_type varchar(40),
            ADD COLUMN IF NOT EXISTS result_status varchar(40),
            ADD COLUMN IF NOT EXISTS solve_mode varchar(40),
            ADD COLUMN IF NOT EXISTS available_questions text,
            ADD COLUMN IF NOT EXISTS selected_question_number integer;

        UPDATE public.ai_responses
        SET result_status = 'SOLUTION_READY'
        WHERE result_status IS NULL;

        UPDATE public.ai_responses
        SET solve_mode = 'AUTO'
        WHERE solve_mode IS NULL;
    END IF;
END $$;

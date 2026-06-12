DO $$
BEGIN
    IF to_regclass('public.ai_responses') IS NOT NULL THEN
        ALTER TABLE public.ai_responses
            ADD COLUMN IF NOT EXISTS input_warning text;
    END IF;
END $$;

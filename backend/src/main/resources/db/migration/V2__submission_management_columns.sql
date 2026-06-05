DO $$
BEGIN
    IF to_regclass('public.submissions') IS NOT NULL THEN
        ALTER TABLE public.submissions
            ADD COLUMN IF NOT EXISTS title varchar(120);

        ALTER TABLE public.submissions
            ADD COLUMN IF NOT EXISTS favorite boolean;

        UPDATE public.submissions
        SET favorite = false
        WHERE favorite IS NULL;

        ALTER TABLE public.submissions
            ALTER COLUMN favorite SET DEFAULT false;

        ALTER TABLE public.submissions
            ALTER COLUMN favorite SET NOT NULL;
    END IF;
END $$;

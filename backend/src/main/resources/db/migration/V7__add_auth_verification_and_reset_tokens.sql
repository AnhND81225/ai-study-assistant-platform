ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS email_verified boolean;

UPDATE public.users
SET email_verified = true
WHERE email_verified IS NULL;

ALTER TABLE public.users
    ALTER COLUMN email_verified SET DEFAULT false,
    ALTER COLUMN email_verified SET NOT NULL;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS auth_provider varchar(30);

UPDATE public.users
SET auth_provider = 'LOCAL'
WHERE auth_provider IS NULL;

ALTER TABLE public.users
    ALTER COLUMN auth_provider SET DEFAULT 'LOCAL',
    ALTER COLUMN auth_provider SET NOT NULL;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS provider_subject varchar(255);

CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
    id bigserial PRIMARY KEY,
    token_hash varchar(64) NOT NULL UNIQUE,
    user_id bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL,
    used_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user
    ON public.email_verification_tokens(user_id);

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id bigserial PRIMARY KEY,
    token_hash varchar(64) NOT NULL UNIQUE,
    user_id bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL,
    used_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user
    ON public.password_reset_tokens(user_id);

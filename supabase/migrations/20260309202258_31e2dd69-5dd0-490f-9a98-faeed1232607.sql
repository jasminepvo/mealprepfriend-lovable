-- Add theme_preference to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'light';

-- Create vault_meals table
CREATE TABLE public.vault_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_name text NOT NULL,
  calories integer NOT NULL,
  protein_g numeric NOT NULL,
  carb_g numeric NOT NULL,
  fat_g numeric NOT NULL,
  prep_time_min integer NOT NULL DEFAULT 0,
  protein_choice text,
  carb_choice text,
  veggie_choice text,
  is_staple boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vault_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own vault meals"
  ON public.vault_meals FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vault meals"
  ON public.vault_meals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vault meals"
  ON public.vault_meals FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vault meals"
  ON public.vault_meals FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
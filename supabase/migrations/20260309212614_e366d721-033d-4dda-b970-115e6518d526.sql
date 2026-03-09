ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cuisine_preferences text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS complexity_level text DEFAULT 'home_chef',
  ADD COLUMN IF NOT EXISTS biggest_meal text DEFAULT 'midday',
  ADD COLUMN IF NOT EXISTS healthy_swaps_enabled boolean DEFAULT true;
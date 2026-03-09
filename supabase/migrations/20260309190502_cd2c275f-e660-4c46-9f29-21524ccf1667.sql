ALTER TABLE public.profiles
  ADD COLUMN unit_preference text DEFAULT 'imperial',
  ADD COLUMN weight_kg numeric,
  ADD COLUMN height_cm numeric;
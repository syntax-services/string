-- Migration to add orderable toggle to services
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_orderable BOOLEAN DEFAULT false;

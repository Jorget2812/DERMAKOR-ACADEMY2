-- 20240224_add_cms_colors.sql
-- Add columns to dashboard_settings for customizable Hero section colors

ALTER TABLE public.dashboard_settings 
ADD COLUMN IF NOT EXISTS hero_bg_color TEXT DEFAULT '#0F172A',
ADD COLUMN IF NOT EXISTS hero_title_color TEXT DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS hero_body_color TEXT DEFAULT '#94A3B8';

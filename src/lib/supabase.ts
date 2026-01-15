import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Prescription = {
  id: string;
  created_at: string;
  updated_at: string;
  image_url: string | null;
  original_filename: string | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
  raw_analysis: Record<string, unknown> | null;
  patient_notes: string | null;
};

export type Medicine = {
  id: string;
  prescription_id: string;
  created_at: string;
  name_en: string;
  name_ar: string | null;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  quantity: number | null;
  instructions: string | null;
  warnings: string[] | null;
  interactions: string[] | null;
  jfda_info: Record<string, unknown> | null;
  category: string | null;
};

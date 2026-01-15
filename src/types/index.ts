export interface Medicine {
  name_en: string;
  name_ar?: string;
  active_ingredient?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity?: number;
  instructions?: string;
  instructions_ar?: string;
  warnings?: string[];
  warnings_ar?: string[];
  interactions?: string[];
  category?: string;
  storage?: string;
  sfda_notes?: string;
}

export interface AnalysisResult {
  medicines: Medicine[];
  general_notes?: string;
  general_notes_ar?: string;
  patient_advice?: string;
  patient_advice_ar?: string;
  raw_response?: string;
}

export interface AnalysisResponse {
  success: boolean;
  analysis: AnalysisResult;
  metadata?: {
    model: string;
    tokens: number;
    response_time_ms: number;
  };
  error?: string;
}

export interface SFDAInfo {
  medicine_name: string;
  medicine_name_ar?: string;
  sfda_status?: string;
  registration_number?: string;
  indications?: string[];
  indications_ar?: string[];
  contraindications?: string[];
  contraindications_ar?: string[];
  warnings?: string[];
  warnings_ar?: string[];
  storage?: string;
  prescription_required?: boolean;
  generic_alternatives?: string[];
  price_range_sar?: string;
  manufacturer?: string;
  additional_notes?: string;
  additional_notes_ar?: string;
}

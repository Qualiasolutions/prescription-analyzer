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
  jfda_notes?: string;
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

export interface JFDAInfo {
  // Trade/Brand name
  trade_name?: string;
  trade_name_ar?: string;
  // Scientific/Generic name
  scientific_name?: string;
  scientific_name_ar?: string;
  // Drug details
  concentration?: string;
  jfda_status?: string;
  registration_number?: string;
  atc_code?: string;
  // Pricing (JOD)
  public_price_jod?: string;
  pharmacy_price_jod?: string;
  hospital_price_jod?: string;
  // Package info
  package_size?: string;
  barcode?: string;
  // Manufacturer info
  manufacturer?: string;
  manufacturer_country?: string;
  marketing_company?: string;
  distributor?: string;
  // Medical info
  prescription_required?: boolean;
  indications?: string[];
  indications_ar?: string[];
  contraindications?: string[];
  contraindications_ar?: string[];
  warnings?: string[];
  warnings_ar?: string[];
  storage?: string;
  generic_alternatives?: string[];
  additional_notes?: string;
  additional_notes_ar?: string;
}

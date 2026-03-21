// ─── Shared primitives ───────────────────────────────────────────────────────

export type MaterialType =
  | 'waste_or_scrap'
  | 'granules_or_powders'
  | 'direct_reduction_sponge_iron'
  | 'pig_iron'
  | 'ferro_alloy'
  | 'steel';

export type MetalForm =
  | 'ingots'
  | 'primary_forms'
  | 'semi_finished'
  | 'flat_rolled'
  | 'bars_rods_hot_rolled_irregular_coils'
  | 'bars_rods_other'
  | 'angles'
  | 'shapes'
  | 'sections'
  | 'hollow_drill_bars'
  | 'wire'
  | 'angles_shapes';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface GoogleAuthRequest {
  id_token: string;
  role?: string | null;
}

export interface MicrosoftAuthRequest {
  id_token: string;
  role?: string | null;
}

export interface AcademicMockRequest {
  email: string;
  name?: string | null;
  role?: string | null;
}

// ─── Calculations ─────────────────────────────────────────────────────────────

export interface Line {
  hs_code: string;
  description?: string | null;
  customs_value?: number | string;
  quantity?: number | string;
  currency?: string;
}

export interface CalculationRequest {
  destination: string;
  origin: string;
  lines: Line[];
  fx_date?: string | null;
}

export interface CalculationListParams {
  limit?: number;
  offset?: number;
  status_q?: string | null;
  from_date?: string | null;
  to_date?: string | null;
}

// ─── Calculation Profiles ─────────────────────────────────────────────────────

export interface ProfileCreate {
  name: string;
  description?: string | null;
  shipment_data: Record<string, unknown>;
  lines_data: Record<string, unknown>[];
}

export interface ProfileUpdate {
  name?: string | null;
  description?: string | null;
  shipment_data?: Record<string, unknown> | null;
  lines_data?: Record<string, unknown>[] | null;
  last_result?: Record<string, unknown> | null;
}

export interface ProfileListParams {
  limit?: number;
  offset?: number;
}

// ─── Autofill ─────────────────────────────────────────────────────────────────

export interface AutofillRequest {
  description: string;
}

export interface HSAlternative {
  hs_code: string;
  confidence: number;
  description: string;
}

export interface AutofillResponse {
  product_description?: string | null;
  hs_code?: string | null;
  hs_confidence?: number | null;
  hs_description?: string | null;
  origin_country?: string | null;
  destination_country?: string | null;
  declared_value?: number | null;
  currency?: string | null;
  incoterms?: string | null;
  parse_confidence: number;
  unparsed_fields: string[];
}

// ─── HS Lookup ────────────────────────────────────────────────────────────────

export interface HSLookupRequest {
  product_description: string;
  origin_country?: string | null;
}

export interface HSLookupResponse {
  hs_code: string;
  confidence: number;
  description: string;
  chapter: string;
  chapter_description: string;
  alternatives: HSAlternative[];
  cached: boolean;
  source: string;
}

// ─── Duty Rate ────────────────────────────────────────────────────────────────

export interface DutyRateParams {
  hs_code: string;
  origin_country: string;
  destination_country: string;
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

export interface InvoiceUploadResponse {
  [key: string]: unknown;
}

// ─── KYB ──────────────────────────────────────────────────────────────────────

export interface UKCompanySnapshotRequest {
  company_number: string;
}

export interface CompanySnapshot {
  company_number: string;
  company_name?: string | null;
  status?: string | null;
  sic_codes: string[];
  registered_office_address?: Record<string, unknown> | null;
  filing_history?: Record<string, unknown> | null;
  officers?: Record<string, unknown> | null;
  persons_with_significant_control?: Record<string, unknown> | null;
  charges?: Record<string, unknown> | null;
  insolvency?: Record<string, unknown> | null;
  registers?: Record<string, unknown> | null;
}

export interface UKGuessEORIRequest {
  vat_number: string;
}

export interface EORIValidationResult {
  eori: string;
  active: boolean;
  company_name?: string | null;
  address?: Record<string, unknown> | null;
  source: string;
}

export interface EUVatCheckRequest {
  country_code: string;
  vat_number: string;
}

export interface EUVatCheckResult {
  active: boolean;
  name?: string | null;
  company_id?: string | null;
  source: string;
}

export interface ProfileIntakeRequest {
  role: 'importer' | 'exporter';
  products?: string[];
  countries?: string[];
  vat_number?: string | null;
  aeo_status?: boolean | null;
  forwarder?: string | null;
  dda_account?: boolean | null;
}

export interface ProfileIntakeResponse {
  accepted: boolean;
  guessed_eori?: string | null;
  eori_validation?: EORIValidationResult | null;
}

// ─── Classification ───────────────────────────────────────────────────────────

export interface SteelClassifyRequest {
  material_type: MaterialType;
  carbon_pct?: number | null;
  chromium_pct?: number | null;
  manganese_pct?: number | null;
  aluminium_pct?: number | null;
  silicon_pct?: number | null;
  nickel_pct?: number | null;
  molybdenum_pct?: number | null;
  form?: MetalForm | null;
  width_mm?: number | null;
}

export interface PreClassificationCheckRequest {
  hs_code?: string | null;
  description?: string | null;
}

// ─── Origin ───────────────────────────────────────────────────────────────────

export interface ROOCheckRequest {
  hs_code: string;
  origin_country: string;
  destination_country: string;
  wholly_obtained?: boolean;
  last_substantial_transformation_country?: string | null;
  regional_value_content_pct?: number | null;
  tca_preference_claimed?: boolean;
  exporter_ref?: string | null;
  shipment_value_gbp?: number | null;
}

export interface OriginDeclarationRequest {
  shipment_ref: string;
  hs_code: string;
  origin_country: string;
  destination_country: string;
  exporter_ref: string;
  declaration_text: string;
  signed: boolean;
}

// ─── Compliance ───────────────────────────────────────────────────────────────

export interface SanctionsScreenRequest {
  exporter_country: string;
  importer_country: string;
  consignee_country?: string | null;
  party_names: string[];
  hs_code: string;
  goods_description?: string | null;
  origin_country: string;
  destination_country: string;
  jurisdiction?: string;
}

export interface DocumentStatus {
  name: string;
  status: string;
  notes?: string | null;
}

export interface ClearanceRequest {
  shipment_ref: string;
  documents: DocumentStatus[];
  tca_preference_claimed?: boolean;
  origin_declaration_signed?: boolean;
  origin_declaration_id?: string | null;
  exporter_name?: string | null;
  exporter_eori?: string | null;
  importer_name?: string | null;
  freight_forwarder_name?: string | null;
  hs_code?: string | null;
  goods_description?: string | null;
  destination_country?: string | null;
}

// ─── Tariff ───────────────────────────────────────────────────────────────────

export interface TariffHSLookupRequest {
  product_description: string;
  origin_country: string;
}

export interface CheckoutRequest {
  plan: string;
  billing_period: string;
}

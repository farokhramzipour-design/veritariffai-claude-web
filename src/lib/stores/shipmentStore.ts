import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Step 1: Steel Classification ─────────────────────────────────────────
export type MaterialType = 'waste_or_scrap' | 'granules_or_powders' | 'direct_reduction_sponge_iron' | 'pig_iron' | 'ferro_alloy' | 'other';
export type SteelClass = 'STAINLESS_STEEL' | 'OTHER_ALLOY_STEEL' | 'NON_ALLOY_IRON_STEEL';
export type PhysicalForm = 'ingots_primary' | 'semi_finished' | 'flat_rolled' | 'bars_rods_hot_rolled' | 'bars_rods_other' | 'wire' | 'angles_shapes';
export type ClassificationConfidence = 'High' | 'Medium' | 'Low';

export interface ClassificationData {
  materialType: MaterialType | '';
  carbonPct: string;
  chromiumPct: string;
  manganesePct: string;
  aluminiumPct: string;
  otherAlloyMet: boolean;
  // derived
  steelClass: SteelClass | null;
  hsHeading: string;
  // physical form
  physicalForm: PhysicalForm | '';
  widthMm: string;
  // output
  commodityCode: string;
  classificationConfidence: ClassificationConfidence | null;
  supplementaryUnit: string;
  licenceRequired: boolean;
  safeguardFlag: boolean;
  trqFlag: boolean;
  classified: boolean;
}

// ─── Step 2: Rules of Origin ───────────────────────────────────────────────
export type OriginProofMethod = 'statement_on_origin' | 'importers_knowledge' | 'other';

export interface OriginData {
  mfnDutyRate: string;   // percentage string
  dutyToSave: boolean | null;
  consignmentValueEUR: string;
  proofMethod: OriginProofMethod | '';
  eoriNumber: string;
  rexNumber: string;
  importersKnowledgeAcknowledged: boolean;
  statementOnOriginGenerated: boolean;
  tcaPreferenceClaimed: boolean;
}

// ─── Step 3: Sanctions ─────────────────────────────────────────────────────
export type OriginRiskLevel = 'BLOCKED' | 'ELEVATED_RISK' | 'STANDARD_ENHANCED' | 'STANDARD_REVIEW';
export type MTCStatus = 'CLEARED' | 'BLOCKED' | 'HOLD' | 'PENDING';

export interface ChainOfCustodyEntry {
  tier: number;
  entityName: string;
  country: string;
  date: string;
  reference: string;
}

export interface SanctionsData {
  declaredOriginCountry: string;
  originRiskLevel: OriginRiskLevel | null;
  // MTC
  mtcUploaded: boolean;
  mtcFileName: string;
  mtcStatus: MTCStatus | null;
  mtcFields: {
    steelMillName: string;
    meltLocation: string;
    pourLocation: string;
    heatNumber: string;
    chemicalComposition: string;
    mechanicalProperties: string;
    productStandard: string;
    certificateType: string;
    issueDate: string;
  };
  mtcDiscrepancy: boolean;
  // Chain of custody
  chainOfCustodyRequired: boolean;
  chainOfCustodyLog: ChainOfCustodyEntry[];
}

// ─── Step 4: German Customs ────────────────────────────────────────────────
export interface GermanCustomsData {
  safeguardApplicable: boolean | null;
  trqQuotaRemaining: boolean | null;
  siglDocumentRequired: boolean;
  siglDocumentRef: string;
  importerEORI: string;
  customsOfficeCode: string;
  cifValueEUR: string;
  dutyRate: string;
  importerVATNumber: string;
  eustAmount: string;
  cbamDeclarantId: string;
}

// ─── Step 5: CBAM ──────────────────────────────────────────────────────────
export type ProductionRoute = 'BF-BOF' | 'EAF' | 'DRI-EAF';

export interface CBAMData {
  applicable: boolean | null;
  phase: 'transitional' | 'definitive' | null;
  productionRoute: ProductionRoute | '';
  directCO2: string;
  indirectCO2: string;
  electricityKwh: string;
  ukETSCarbonPrice: string;
  euETSWeeklyPrice: string;
  seeTCO2PerTonne: string;
  useDefaultValues: boolean;
  ukETSOffsetApplicable: boolean;
  offsetAmount: string;
}

// ─── Step 6: CDS Declaration ───────────────────────────────────────────────
export type ExitRoute = 'RoRo' | 'container_sea' | 'air_freight';

export interface CDSData {
  declarationType: 'EX' | 'CO';
  exportValueGBP: string;
  fullDeclarationRequired: boolean;
  exporterEORI: string;
  countryOfDestination: string;
  countryOfDispatch: string;
  netMassKg: string;
  grossMassKg: string;
  supplementaryUnits: string;
  procedureCode: string;
  deliveryTerms: string;
  invoiceCurrency: string;
  valuationMethod: string;
  exitVia: ExitRoute | '';
  exsRequired: boolean;
  aeoStatus: 'AEOC' | 'AEOS' | 'NONE';
  mrn: string;
}

// ─── Step 7: Barrister's Bundle ────────────────────────────────────────────
export type DocumentStatus = 'VALIDATED' | 'MISSING' | 'NOT_REQUIRED' | 'PENDING' | 'BLOCKED';

export interface BundleDocument {
  id: string;
  name: string;
  step: string;
  status: DocumentStatus;
  mandatory: boolean;
  condition: string;
}

export interface BundleData {
  documents: BundleDocument[];
  shipmentStatus: 'PENDING' | 'CLEARED_FOR_EXPORT' | 'BLOCKED';
  clearanceCertificate: string | null;
  clearanceTimestamp: string | null;
}

// ─── Root Store ────────────────────────────────────────────────────────────
export interface ShipmentState {
  currentStep: number;
  completedSteps: number[];
  shipmentId: string;

  classification: ClassificationData;
  origin: OriginData;
  sanctions: SanctionsData;
  germanCustoms: GermanCustomsData;
  cbam: CBAMData;
  cds: CDSData;
  bundle: BundleData;

  // Actions
  setStep: (step: number) => void;
  markStepComplete: (step: number) => void;
  updateClassification: (data: Partial<ClassificationData>) => void;
  updateOrigin: (data: Partial<OriginData>) => void;
  updateSanctions: (data: Partial<SanctionsData>) => void;
  updateGermanCustoms: (data: Partial<GermanCustomsData>) => void;
  updateCBAM: (data: Partial<CBAMData>) => void;
  updateCDS: (data: Partial<CDSData>) => void;
  updateBundle: (data: Partial<BundleData>) => void;
  resetShipment: () => void;
  computeSteelClass: () => void;
  computeHSHeading: () => void;
  computeOriginRisk: () => void;
  buildBundle: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function computeSteelClassFromData(c: ClassificationData): SteelClass | null {
  const carbon = parseFloat(c.carbonPct) || 0;
  const chromium = parseFloat(c.chromiumPct) || 0;
  const manganese = parseFloat(c.manganesePct) || 0;
  const aluminium = parseFloat(c.aluminiumPct) || 0;

  if (!c.materialType || c.materialType === 'waste_or_scrap' || c.materialType === 'granules_or_powders' || c.materialType === 'direct_reduction_sponge_iron' || c.materialType === 'pig_iron' || c.materialType === 'ferro_alloy') {
    return null; // Handled separately by heading
  }

  if (carbon <= 1.2 && chromium >= 10.5) return 'STAINLESS_STEEL';
  if (aluminium >= 0.3 || manganese >= 1.65 || c.otherAlloyMet) return 'OTHER_ALLOY_STEEL';
  return 'NON_ALLOY_IRON_STEEL';
}

function computeHSHeadingFromData(c: ClassificationData): string {
  const carbon = parseFloat(c.carbonPct) || 0;
  const manganese = parseFloat(c.manganesePct) || 0;

  // Special material types → fixed headings
  if (c.materialType === 'waste_or_scrap') return '7204';
  if (c.materialType === 'granules_or_powders') return '7205';
  if (c.materialType === 'direct_reduction_sponge_iron') return '7203';
  if (c.materialType === 'pig_iron') {
    if (carbon > 2.0 || manganese > 6.0) return '7201';
  }
  if (c.materialType === 'ferro_alloy') return '7202';

  const sc = c.steelClass;
  const form = c.physicalForm;
  const width = parseFloat(c.widthMm) || 0;

  if (sc === 'STAINLESS_STEEL') {
    if (form === 'ingots_primary' || form === 'semi_finished') return '7218';
    if (form === 'flat_rolled') return width >= 600 ? '7219' : '7220';
    if (form === 'bars_rods_hot_rolled') return '7221';
    if (form === 'bars_rods_other' || form === 'angles_shapes') return '7222';
    if (form === 'wire') return '7223';
  }
  if (sc === 'OTHER_ALLOY_STEEL') {
    if (form === 'ingots_primary' || form === 'semi_finished') return '7224';
    if (form === 'flat_rolled') return width >= 600 ? '7225' : '7226';
    if (form === 'bars_rods_hot_rolled') return '7227';
    if (form === 'bars_rods_other' || form === 'angles_shapes') return '7228';
    if (form === 'wire') return '7229';
  }
  if (sc === 'NON_ALLOY_IRON_STEEL') {
    if (form === 'ingots_primary') return '7206';
    if (form === 'semi_finished') return '7207';
    if (form === 'flat_rolled') return width >= 600 ? '7208' : '7211';
    if (form === 'bars_rods_hot_rolled') return '7213';
    if (form === 'angles_shapes') return '7216';
    if (form === 'wire') return '7217';
  }
  return '';
}

function getOriginRiskLevel(country: string): OriginRiskLevel | null {
  if (!country) return null;
  const upper = country.toUpperCase();
  if (upper === 'RU') return 'BLOCKED';
  if (['BY', 'KZ', 'AM', 'GE'].includes(upper)) return 'ELEVATED_RISK';
  if (['UA', 'MD'].includes(upper)) return 'STANDARD_ENHANCED';
  return 'STANDARD_REVIEW';
}

function buildBundleDocuments(state: ShipmentState): BundleDocument[] {
  const { classification, origin, sanctions, germanCustoms, cbam, cds } = state;
  const isChapter73 = classification.hsHeading.startsWith('73');

  return [
    {
      id: 'commercial_invoice',
      name: 'Commercial Invoice',
      step: 'Step 6',
      status: 'MISSING',
      mandatory: true,
      condition: 'MANDATORY — always',
    },
    {
      id: 'packing_list',
      name: 'Packing List',
      step: 'Step 6',
      status: 'MISSING',
      mandatory: true,
      condition: 'MANDATORY — always',
    },
    {
      id: 'bill_of_lading',
      name: 'Bill of Lading / CMR',
      step: 'Step 6',
      status: 'MISSING',
      mandatory: true,
      condition: 'MANDATORY — transport mode dependent',
    },
    {
      id: 'cds_mrn',
      name: 'UK CDS Export Declaration (MRN)',
      step: 'Step 6',
      status: cds.mrn ? 'VALIDATED' : 'MISSING',
      mandatory: true,
      condition: 'MANDATORY — always',
    },
    {
      id: 'exs',
      name: 'Exit Summary Declaration (EXS)',
      step: 'Step 6',
      status: cds.aeoStatus !== 'NONE' ? 'NOT_REQUIRED' : (cds.exsRequired ? 'MISSING' : 'PENDING'),
      mandatory: cds.aeoStatus === 'NONE',
      condition: 'MANDATORY unless AEO-exempt',
    },
    {
      id: 'mtc',
      name: 'Mill Test Certificate (MTC)',
      step: 'Step 3',
      status: sanctions.mtcStatus === 'CLEARED' ? 'VALIDATED' : sanctions.mtcUploaded ? 'PENDING' : 'MISSING',
      mandatory: true,
      condition: 'MANDATORY for all steel',
    },
    {
      id: 'sanctions_cert',
      name: 'Sanctions Screening Certificate',
      step: 'Step 3',
      status: sanctions.originRiskLevel === 'BLOCKED' ? 'MISSING' : sanctions.mtcStatus === 'CLEARED' ? 'VALIDATED' : 'PENDING',
      mandatory: true,
      condition: 'MANDATORY — always',
    },
    {
      id: 'chain_of_custody',
      name: 'Chain of Custody Log',
      step: 'Step 3',
      status: isChapter73 ? (sanctions.chainOfCustodyLog.length >= 3 ? 'VALIDATED' : 'MISSING') : 'NOT_REQUIRED',
      mandatory: isChapter73,
      condition: 'MANDATORY for Chapter 73 articles',
    },
    {
      id: 'statement_on_origin',
      name: 'Statement on Origin / EORI Declaration',
      step: 'Step 2',
      status: origin.tcaPreferenceClaimed ? (origin.statementOnOriginGenerated ? 'VALIDATED' : 'MISSING') : 'NOT_REQUIRED',
      mandatory: origin.tcaPreferenceClaimed,
      condition: 'IF TCA preference claimed',
    },
    {
      id: 'supplier_declaration',
      name: 'Supplier Declaration (inputs)',
      step: 'Step 2',
      status: 'MISSING',
      mandatory: false,
      condition: 'IF TCA PSR compliance needed',
    },
    {
      id: 'cbam_cert',
      name: 'CBAM Embedded Emissions Certificate',
      step: 'Step 5',
      status: cbam.applicable ? (cbam.seeTCO2PerTonne ? 'VALIDATED' : 'MISSING') : 'NOT_REQUIRED',
      mandatory: cbam.applicable === true,
      condition: 'IF CBAM applicable (Ch.72/73)',
    },
    {
      id: 'cbam_report',
      name: 'CBAM Quarterly Report XML',
      step: 'Step 5',
      status: cbam.phase === 'transitional' ? 'MISSING' : 'NOT_REQUIRED',
      mandatory: cbam.phase === 'transitional',
      condition: 'IF in CBAM transitional phase',
    },
    {
      id: 'sigl_doc',
      name: 'SIGL Surveillance Document',
      step: 'Step 4',
      status: germanCustoms.siglDocumentRequired ? (germanCustoms.siglDocumentRef ? 'VALIDATED' : 'MISSING') : 'NOT_REQUIRED',
      mandatory: germanCustoms.siglDocumentRequired,
      condition: 'IF EU safeguard quota triggered',
    },
    {
      id: 'aeo_cert',
      name: 'AEO Certificate',
      step: 'External',
      status: cds.aeoStatus !== 'NONE' ? 'VALIDATED' : 'NOT_REQUIRED',
      mandatory: false,
      condition: 'IF AEO authorised exporter',
    },
  ];
}

// ─── Initial State ─────────────────────────────────────────────────────────
const initialClassification: ClassificationData = {
  materialType: '',
  carbonPct: '',
  chromiumPct: '',
  manganesePct: '',
  aluminiumPct: '',
  otherAlloyMet: false,
  steelClass: null,
  hsHeading: '',
  physicalForm: '',
  widthMm: '',
  commodityCode: '',
  classificationConfidence: null,
  supplementaryUnit: 'tonnes',
  licenceRequired: false,
  safeguardFlag: false,
  trqFlag: false,
  classified: false,
};

const initialOrigin: OriginData = {
  mfnDutyRate: '',
  dutyToSave: null,
  consignmentValueEUR: '',
  proofMethod: '',
  eoriNumber: '',
  rexNumber: '',
  importersKnowledgeAcknowledged: false,
  statementOnOriginGenerated: false,
  tcaPreferenceClaimed: false,
};

const initialSanctions: SanctionsData = {
  declaredOriginCountry: '',
  originRiskLevel: null,
  mtcUploaded: false,
  mtcFileName: '',
  mtcStatus: null,
  mtcFields: {
    steelMillName: '',
    meltLocation: '',
    pourLocation: '',
    heatNumber: '',
    chemicalComposition: '',
    mechanicalProperties: '',
    productStandard: '',
    certificateType: '',
    issueDate: '',
  },
  mtcDiscrepancy: false,
  chainOfCustodyRequired: false,
  chainOfCustodyLog: [],
};

const initialGermanCustoms: GermanCustomsData = {
  safeguardApplicable: null,
  trqQuotaRemaining: null,
  siglDocumentRequired: false,
  siglDocumentRef: '',
  importerEORI: '',
  customsOfficeCode: '',
  cifValueEUR: '',
  dutyRate: '0',
  importerVATNumber: '',
  eustAmount: '',
  cbamDeclarantId: '',
};

const initialCBAM: CBAMData = {
  applicable: null,
  phase: null,
  productionRoute: '',
  directCO2: '',
  indirectCO2: '',
  electricityKwh: '',
  ukETSCarbonPrice: '',
  euETSWeeklyPrice: '',
  seeTCO2PerTonne: '',
  useDefaultValues: false,
  ukETSOffsetApplicable: false,
  offsetAmount: '',
};

const initialCDS: CDSData = {
  declarationType: 'EX',
  exportValueGBP: '',
  fullDeclarationRequired: true,
  exporterEORI: '',
  countryOfDestination: 'DE',
  countryOfDispatch: 'GB',
  netMassKg: '',
  grossMassKg: '',
  supplementaryUnits: '',
  procedureCode: '10 00',
  deliveryTerms: '',
  invoiceCurrency: 'GBP',
  valuationMethod: '1',
  exitVia: '',
  exsRequired: true,
  aeoStatus: 'NONE',
  mrn: '',
};

const initialBundle: BundleData = {
  documents: [],
  shipmentStatus: 'PENDING',
  clearanceCertificate: null,
  clearanceTimestamp: null,
};

// ─── Store ─────────────────────────────────────────────────────────────────
export const useShipmentStore = create<ShipmentState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      completedSteps: [],
      shipmentId: `VT-${Date.now()}`,

      classification: initialClassification,
      origin: initialOrigin,
      sanctions: initialSanctions,
      germanCustoms: initialGermanCustoms,
      cbam: initialCBAM,
      cds: initialCDS,
      bundle: initialBundle,

      setStep: (step) => set({ currentStep: step }),
      markStepComplete: (step) =>
        set((s) => ({
          completedSteps: s.completedSteps.includes(step) ? s.completedSteps : [...s.completedSteps, step],
        })),

      updateClassification: (data) =>
        set((s) => ({ classification: { ...s.classification, ...data } })),
      updateOrigin: (data) =>
        set((s) => ({ origin: { ...s.origin, ...data } })),
      updateSanctions: (data) =>
        set((s) => ({ sanctions: { ...s.sanctions, ...data } })),
      updateGermanCustoms: (data) =>
        set((s) => ({ germanCustoms: { ...s.germanCustoms, ...data } })),
      updateCBAM: (data) =>
        set((s) => ({ cbam: { ...s.cbam, ...data } })),
      updateCDS: (data) =>
        set((s) => ({ cds: { ...s.cds, ...data } })),
      updateBundle: (data) =>
        set((s) => ({ bundle: { ...s.bundle, ...data } })),

      resetShipment: () =>
        set({
          currentStep: 1,
          completedSteps: [],
          shipmentId: `VT-${Date.now()}`,
          classification: initialClassification,
          origin: initialOrigin,
          sanctions: initialSanctions,
          germanCustoms: initialGermanCustoms,
          cbam: initialCBAM,
          cds: initialCDS,
          bundle: initialBundle,
        }),

      computeSteelClass: () => {
        const c = get().classification;
        const steelClass = computeSteelClassFromData(c);
        set((s) => ({ classification: { ...s.classification, steelClass } }));
      },

      computeHSHeading: () => {
        const c = get().classification;
        const hsHeading = computeHSHeadingFromData(c);
        const confidence: ClassificationConfidence =
          c.carbonPct && c.physicalForm ? 'High' : c.physicalForm ? 'Medium' : 'Low';
        set((s) => ({
          classification: {
            ...s.classification,
            hsHeading,
            commodityCode: hsHeading ? `${hsHeading}00` : '',
            classificationConfidence: confidence,
            classified: !!hsHeading,
          },
        }));
      },

      computeOriginRisk: () => {
        const country = get().sanctions.declaredOriginCountry;
        const originRiskLevel = getOriginRiskLevel(country);
        set((s) => ({ sanctions: { ...s.sanctions, originRiskLevel } }));
      },

      buildBundle: () => {
        const state = get();
        const documents = buildBundleDocuments(state);
        const mandatoryMissing = documents.some(
          (d) => d.mandatory && d.status === 'MISSING',
        );
        const blocked = documents.some((d) => d.status === 'BLOCKED') ||
          state.sanctions.originRiskLevel === 'BLOCKED';

        const shipmentStatus = blocked
          ? 'BLOCKED'
          : mandatoryMissing
          ? 'PENDING'
          : 'CLEARED_FOR_EXPORT';

        const clearanceTimestamp =
          shipmentStatus === 'CLEARED_FOR_EXPORT'
            ? new Date().toISOString()
            : null;

        set((s) => ({
          bundle: {
            ...s.bundle,
            documents,
            shipmentStatus,
            clearanceTimestamp,
            clearanceCertificate:
              shipmentStatus === 'CLEARED_FOR_EXPORT'
                ? `VT-CERT-${state.shipmentId}`
                : null,
          },
        }));
      },
    }),
    {
      name: 'veritariff-shipment',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        shipmentId: state.shipmentId,
        classification: state.classification,
        origin: state.origin,
        sanctions: state.sanctions,
        germanCustoms: state.germanCustoms,
        cbam: state.cbam,
        cds: state.cds,
        bundle: state.bundle,
      }),
    },
  ),
);

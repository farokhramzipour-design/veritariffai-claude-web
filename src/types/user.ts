export interface CompanyDetails {
  name: string;
  number: string;
  address: string;
  status: string;
  sicCode?: string;
  vatNumber?: string;
  eoriNumber?: string;
  products?: string[];
  countries?: string[];
  tradeType?: 'import' | 'export' | 'both';
  aeoStatus?: boolean;
  forwarder?: string;
  ddaAccount?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'FREE' | 'PRO';
  role?: 'researcher' | 'importer' | 'exporter' | 'company';
  companyDetails?: CompanyDetails;
}

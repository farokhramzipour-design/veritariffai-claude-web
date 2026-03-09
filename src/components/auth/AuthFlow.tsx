"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Building2, Search, CheckCircle, AlertCircle, 
  Loader2, Globe, ChevronRight, ArrowLeft, GraduationCap, Briefcase, Plus, X 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type ViewState = 'initial' | 'login' | 'signup-role' | 'signup-region' | 'signup-company-uk' | 'signup-company-eu' | 'signup-provider';
type UserRole = 'researcher' | 'importer' | 'exporter' | 'company';
type Region = 'UK' | 'EU';

interface CompanyDetails {
  name: string;
  number: string;
  address: string;
  status: string;
  sicCode?: string;
  vatNumber?: string;
  eoriNumber?: string;
  isEoriValid?: boolean;
  eoriError?: string;
  products: string[];
  countries: string[];
  tradeType: 'import' | 'export' | 'both';
  aeoStatus?: boolean;
  forwarder?: string;
  ddaAccount?: boolean;
}

export default function AuthFlow() {
  const [view, setView] = useState<ViewState>('initial');
  const [role, setRole] = useState<UserRole | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Company Search State (UK)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Additional Details State
  const [details, setDetails] = useState<CompanyDetails>({
    name: '',
    number: '',
    address: '',
    status: '',
    products: [],
    countries: [],
    tradeType: 'import',
  });
  
  const [newProduct, setNewProduct] = useState('');
  const [newCountry, setNewCountry] = useState('');

  const apiUrl = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : 'https://api.veritariffai.co';
  
  // --- Navigation Helpers ---
  const goBack = () => {
    setError(null);
    if (view === 'login' || view === 'signup-role') setView('initial');
    else if (view === 'signup-region') setView('signup-role');
    else if (view === 'signup-company-uk' || view === 'signup-company-eu') setView('signup-region');
    else if (view === 'signup-provider') {
      if (role === 'company') {
        if (region === 'UK') setView('signup-company-uk');
        else setView('signup-company-eu');
      } else {
        setView('signup-role');
      }
    }
  };

  // --- Handlers ---

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'company') {
        setView('signup-region');
    } else {
      setView('signup-provider');
    }
  };

  const handleRegionSelect = (selectedRegion: Region) => {
    setRegion(selectedRegion);
    if (selectedRegion === 'UK') setView('signup-company-uk');
    else setView('signup-company-eu');
  };

  // --- UK Company Logic ---
  const searchCompany = async () => {
    if (!searchQuery) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/onboarding/companies-house/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setSearchResults(data.items || []);
    } catch (err) {
      setError('Failed to search companies');
    } finally {
      setLoading(false);
    }
  };

  const selectCompany = async (company: any) => {
    if (company.company_status !== 'active') {
      setError('Company must be active to proceed.');
      return;
    }
    
    setLoading(true);
    try {
        const res = await fetch(`/api/onboarding/companies-house/company/${company.company_number}`);
        if(!res.ok) throw new Error('Failed to fetch company profile');
        const profile = await res.json();

        setDetails(prev => ({
            ...prev,
            name: profile.company_name,
            number: profile.company_number,
            address: profile.registered_office_address ? 
                [profile.registered_office_address.address_line_1, profile.registered_office_address.locality, profile.registered_office_address.postal_code].filter(Boolean).join(', ') 
                : '',
            status: profile.company_status,
            sicCode: profile.sic_codes?.[0] || '',
        }));
        // For UK flow, we show details form below search results or replace view?
        // Let's assume we proceed to filling details within same view or next step.
        // For simplicity, let's just clear search results and show form in same view
        setSearchResults([]);
    } catch (err) {
        setError('Failed to fetch company details');
    } finally {
        setLoading(false);
    }
  };

  const handleVatBlur = async () => {
    if (!details.vatNumber) return;
    const guessedEori = `GB${details.vatNumber.replace(/[^0-9]/g, '')}000`;
    setDetails(prev => ({ ...prev, eoriNumber: guessedEori, isEoriValid: undefined, eoriError: undefined }));
    
    setLoading(true);
    try {
        const res = await fetch('/api/onboarding/hmrc/check-eori', {
            method: 'POST',
            body: JSON.stringify({ eoriNumber: guessedEori })
        });
        const data = await res.json();
        if (data.valid) {
            setDetails(prev => ({ ...prev, isEoriValid: true }));
        } else {
            setDetails(prev => ({ ...prev, isEoriValid: false, eoriError: 'EORI not found. Please create one.' }));
        }
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  // --- Helper for adding arrays ---
  const addProduct = () => {
    if (newProduct && details.products.length < 5) {
      setDetails(prev => ({ ...prev, products: [...prev.products, newProduct] }));
      setNewProduct('');
    }
  };
  const addCountry = () => {
    if (newCountry) {
      setDetails(prev => ({ ...prev, countries: [...prev.countries, newCountry] }));
      setNewCountry('');
    }
  };

  // --- EU Logic ---
  const handleViesCheck = async () => {
    if (!details.vatNumber) return;
    setLoading(true);
    setError(null);
    try {
        const countryCode = details.vatNumber.substring(0, 2).toUpperCase();
        const vatNumber = details.vatNumber.substring(2);
        
        const res = await fetch('/api/onboarding/vies/check-vat', {
            method: 'POST',
            body: JSON.stringify({ countryCode, vatNumber })
        });
        
        if (!res.ok) throw new Error('Verification failed');
        const data = await res.json();
        
        if (data.isValid) {
            setDetails(prev => ({
                ...prev,
                name: data.name || 'EU Company',
                address: data.address || 'EU Address',
                status: 'active'
            }));
            setView('signup-provider');
        } else {
            setError('VAT Number not valid according to VIES.');
        }
    } catch (err) {
        setError('Failed to verify VAT number.');
    } finally {
        setLoading(false);
    }
  };

  // --- Final Step: Auth Provider ---
  const handleProviderLogin = (provider: 'google' | 'microsoft' | 'academic') => {
    const pendingData = {
      role,
      companyDetails: role === 'company' ? details : undefined
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingOnboarding', JSON.stringify(pendingData));
    }

    if (provider === 'google') {
      window.location.href = `${apiUrl}/api/v1/auth/google/login`;
    } else if (provider === 'microsoft') {
      window.location.href = `${apiUrl}/api/v1/auth/microsoft/login`;
    } else if (provider === 'academic') {
      document.cookie = "auth_token=mock-academic-token; path=/; max-age=86400";
      window.location.reload();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-[500px] flex flex-col relative overflow-hidden">
      <AnimatePresence mode="wait">
        
        {/* VIEW: INITIAL */}
        {view === 'initial' && (
          <motion.div 
            key="initial"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-4"
          >
            <h2 className="text-2xl font-bold text-center mb-6">Welcome to TradeCalc</h2>
            <Button onClick={() => setView('login')} variant="secondary" className="h-14 text-lg justify-between px-6">
              <span>I have an account</span> <ChevronRight />
            </Button>
            <Button onClick={() => setView('signup-role')} className="h-14 text-lg justify-between px-6">
              <span>I'm a new user</span> <ChevronRight />
            </Button>
          </motion.div>
        )}

        {/* VIEW: LOGIN */}
        {view === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <button onClick={goBack} className="flex items-center text-sm text-text-secondary mb-4 hover:text-text-primary"><ArrowLeft className="w-4 h-4 mr-1" /> Back</button>
                <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
                <Button onClick={() => handleProviderLogin('google')} variant="secondary" className="h-12 flex items-center justify-center gap-2"><span>🇬</span> Continue with Google</Button>
                <Button onClick={() => handleProviderLogin('microsoft')} variant="secondary" className="h-12 flex items-center justify-center gap-2"><span>Ⓜ️</span> Continue with Microsoft</Button>
                <Button onClick={() => handleProviderLogin('academic')} variant="secondary" className="h-12 flex items-center justify-center gap-2"><GraduationCap className="w-4 h-4"/> Academic Institution (Mock)</Button>
            </motion.div>
        )}

        {/* VIEW: SIGNUP ROLE */}
        {view === 'signup-role' && (
            <motion.div key="signup-role" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-3">
                <button onClick={goBack} className="flex items-center text-sm text-text-secondary mb-2 hover:text-text-primary"><ArrowLeft className="w-4 h-4 mr-1" /> Back</button>
                <h2 className="text-xl font-bold text-center mb-4">Choose your account type</h2>
                {/* Free Users */}
                {(['researcher', 'importer', 'exporter'] as const).map(r => (
                    <button key={r} onClick={() => handleRoleSelect(r)} className="p-4 border border-border-default rounded-lg hover:border-brand-primary hover:bg-bg-surface text-left transition-all group">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold capitalize flex items-center gap-2"><User className="w-4 h-4 text-brand-primary" /> {r}</span>
                            <span className="text-xs text-text-secondary group-hover:text-brand-primary">Free</span>
                        </div>
                    </button>
                ))}
                {/* Company */}
                <button onClick={() => setView('signup-region')} className="p-4 border border-border-default rounded-lg hover:border-brand-primary hover:bg-bg-surface text-left transition-all group mt-2">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold flex items-center gap-2"><Building2 className="w-4 h-4 text-brand-primary" /> Company</span>
                        <span className="text-xs text-text-secondary group-hover:text-brand-primary">Premium</span>
                    </div>
                </button>
            </motion.div>
        )}

        {/* VIEW: SIGNUP REGION */}
        {view === 'signup-region' && (
            <motion.div key="signup-region" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <button onClick={goBack} className="flex items-center text-sm text-text-secondary mb-4 hover:text-text-primary"><ArrowLeft className="w-4 h-4 mr-1" /> Back</button>
                <h2 className="text-2xl font-bold text-center mb-6">Incorporation Region</h2>
                <Button onClick={() => handleRegionSelect('UK')} variant="secondary" className="h-16 text-lg">🇬🇧 UK Companies</Button>
                <Button onClick={() => handleRegionSelect('EU')} variant="secondary" className="h-16 text-lg">🇪🇺 EU Companies</Button>
            </motion.div>
        )}

        {/* VIEW: SIGNUP COMPANY UK */}
        {view === 'signup-company-uk' && (
            <motion.div key="signup-uk" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
                <button onClick={goBack} className="flex items-center text-sm text-text-secondary mb-2 hover:text-text-primary"><ArrowLeft className="w-4 h-4 mr-1" /> Back</button>
                <h2 className="text-xl font-bold">Company Verification</h2>
                
                {/* Search */}
                {!details.name && (
                    <div className="space-y-4">
                        <p className="text-sm text-text-secondary">Search Companies House to verify your business.</p>
                        <div className="flex gap-2">
                            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Company name or number" onKeyDown={(e) => e.key === 'Enter' && searchCompany()}/>
                            <Button onClick={searchCompany} disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : <Search />}</Button>
                        </div>
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <div className="space-y-2">
                            {searchResults.map(c => (
                                <button key={c.company_number} onClick={() => selectCompany(c)} className="w-full p-3 text-left border border-border-default rounded hover:bg-bg-surface">
                                    <div className="font-semibold">{c.title}</div>
                                    <div className="text-xs text-text-secondary">{c.company_number} • {c.company_status}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Details Form */}
                {details.name && (
                    <div className="space-y-4">
                        <div className="p-3 bg-bg-surface border border-border-default rounded">
                            <div className="font-bold">{details.name}</div>
                            <div className="text-sm text-text-secondary">{details.number}</div>
                            <div className={`text-xs ${details.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>Status: {details.status}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">SIC Code</label>
                                <Input value={details.sicCode || ''} onChange={(e) => setDetails({...details, sicCode: e.target.value})} placeholder="e.g. 62020" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Trade Type</label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={details.tradeType} 
                                    onChange={(e) => setDetails({...details, tradeType: e.target.value as any})}
                                >
                                    <option value="import">Import</option>
                                    <option value="export">Export</option>
                                    <option value="both">Both</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Forwarder (Optional)</label>
                            <Input value={details.forwarder || ''} onChange={(e) => setDetails({...details, forwarder: e.target.value})} placeholder="Forwarder Name / Reference" />
                        </div>

                        <div>
                            <label className="text-sm font-medium">VAT Number</label>
                            <Input value={details.vatNumber || ''} onChange={(e) => setDetails({...details, vatNumber: e.target.value})} onBlur={handleVatBlur} placeholder="GB123456789" />
                        </div>
                        {details.eoriNumber && (
                            <div className="p-2 bg-bg-surface border border-border-default rounded text-xs">
                                <div>EORI: {details.eoriNumber}</div>
                                {details.isEoriValid ? <span className="text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Active</span> : <span className="text-amber-500">{details.eoriError}</span>}
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-medium">Products (Max 5)</label>
                            <div className="flex gap-2 mb-2">
                                <Input value={newProduct} onChange={(e) => setNewProduct(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addProduct()} placeholder="Add product..." disabled={details.products.length >= 5} />
                                <Button onClick={addProduct} size="sm" disabled={details.products.length >= 5}><Plus className="w-4 h-4" /></Button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {details.products.map((p, i) => (
                                    <span key={i} className="bg-brand-primary/10 text-brand-primary px-2 py-1 rounded text-xs flex items-center gap-1">{p} <button onClick={() => setDetails(prev => ({...prev, products: prev.products.filter((_, idx) => idx !== i)}))}><X className="w-3 h-3"/></button></span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Countries</label>
                            <div className="flex gap-2 mb-2">
                                <Input value={newCountry} onChange={(e) => setNewCountry(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCountry()} placeholder="Add country..." />
                                <Button onClick={addCountry} size="sm"><Globe className="w-4 h-4" /></Button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {details.countries.map((c, i) => (
                                    <span key={i} className="bg-bg-surface border border-border-default px-2 py-1 rounded text-xs flex items-center gap-1">{c} <button onClick={() => setDetails(prev => ({...prev, countries: prev.countries.filter((_, idx) => idx !== i)}))}><X className="w-3 h-3"/></button></span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2"><input type="checkbox" checked={details.aeoStatus || false} onChange={(e) => setDetails(prev => ({ ...prev, aeoStatus: e.target.checked }))} /><span className="text-sm">AEO Status</span></label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={details.ddaAccount || false} onChange={(e) => setDetails(prev => ({ ...prev, ddaAccount: e.target.checked }))} /><span className="text-sm">DDA Account</span></label>
                        </div>

                        <Button onClick={() => setView('signup-provider')} className="w-full mt-4">Confirm & Choose Provider</Button>
                    </div>
                )}
            </motion.div>
        )}

        {/* VIEW: SIGNUP COMPANY EU */}
        {view === 'signup-company-eu' && (
            <motion.div key="signup-eu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <button onClick={goBack} className="flex items-center text-sm text-text-secondary mb-4 hover:text-text-primary"><ArrowLeft className="w-4 h-4 mr-1" /> Back</button>
                <h2 className="text-xl font-bold">EU Verification</h2>
                <p className="text-sm text-text-secondary">Enter your EU VAT number to verify via VIES.</p>
                <Input value={details.vatNumber || ''} onChange={(e) => setDetails({...details, vatNumber: e.target.value})} placeholder="e.g. DE123456789" />
                {error && <div className="text-red-500 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
                <Button onClick={handleViesCheck} disabled={loading} className="w-full">{loading ? <Loader2 className="animate-spin" /> : 'Verify & Continue'}</Button>
            </motion.div>
        )}

        {/* VIEW: SIGNUP PROVIDER */}
        {view === 'signup-provider' && (
            <motion.div key="provider" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <button onClick={goBack} className="flex items-center text-sm text-text-secondary mb-4 hover:text-text-primary"><ArrowLeft className="w-4 h-4 mr-1" /> Back</button>
                <h2 className="text-2xl font-bold text-center mb-6">Create your account</h2>
                <p className="text-center text-text-secondary mb-4">
                    Role: <span className="font-bold text-text-primary capitalize">{role}</span>
                    {role === 'company' && region && <span> ({region})</span>}
                </p>
                
                <Button onClick={() => handleProviderLogin('google')} variant="secondary" className="h-12 flex items-center justify-center gap-2"><span>🇬</span> Sign up with Google</Button>
                <Button onClick={() => handleProviderLogin('microsoft')} variant="secondary" className="h-12 flex items-center justify-center gap-2"><span>Ⓜ️</span> Sign up with Microsoft</Button>
                {role === 'researcher' && (
                    <Button onClick={() => handleProviderLogin('academic')} variant="secondary" className="h-12 flex items-center justify-center gap-2"><GraduationCap className="w-4 h-4"/> Academic Institution (Mock)</Button>
                )}
            </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

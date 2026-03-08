"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, AlertCircle, Building2, User, Search, CheckCircle, Plus, X, Globe, Briefcase } from 'lucide-react';

// Types
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

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const updateUser = useAuthStore((state) => state.updateUser);
  const [step, setStep] = useState<number>(1);
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

  // Helper to advance step
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  // --- Step 1: Role Selection ---
  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'company') {
      nextStep(); // Go to Region selection
    } else {
      // Free user flow - complete immediately
      handleComplete(selectedRole);
    }
  };

  // --- Step 2: Region Selection (Company) ---
  const handleRegionSelect = (selectedRegion: Region) => {
    setRegion(selectedRegion);
    nextStep(); // Go to Search (UK) or VAT (EU)
  };

  // --- Step 3 (UK): Company Search ---
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
        nextStep(); // Go to Details
    } catch (err) {
        setError('Failed to fetch company details');
    } finally {
        setLoading(false);
    }
  };

  // --- Step 4 (UK): Additional Details ---
  const addProduct = () => {
    if (newProduct && details.products.length < 5) {
      setDetails(prev => ({ ...prev, products: [...prev.products, newProduct] }));
      setNewProduct('');
    }
  };

  const removeProduct = (index: number) => {
    setDetails(prev => ({ ...prev, products: prev.products.filter((_, i) => i !== index) }));
  };

  const addCountry = () => {
    if (newCountry) {
      setDetails(prev => ({ ...prev, countries: [...prev.countries, newCountry] }));
      setNewCountry('');
    }
  };

  const removeCountry = (index: number) => {
    setDetails(prev => ({ ...prev, countries: prev.countries.filter((_, i) => i !== index) }));
  };

  const handleVatBlur = async () => {
    if (!details.vatNumber) return;
    
    // Auto-generate EORI
    const guessedEori = `GB${details.vatNumber.replace(/[^0-9]/g, '')}000`;
    setDetails(prev => ({ ...prev, eoriNumber: guessedEori, isEoriValid: undefined, eoriError: undefined }));
    
    // Check EORI
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

  // --- Step 3 (EU): VAT Check ---
  const handleViesCheck = async () => {
    if (!details.vatNumber) return;
    setLoading(true);
    setError(null);
    try {
        // Simple parsing of country code from VAT number (e.g. DE123456789)
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
            handleComplete('company'); // Finish for EU
        } else {
            setError('VAT Number not valid according to VIES.');
        }
    } catch (err) {
        setError('Failed to verify VAT number.');
    } finally {
        setLoading(false);
    }
  };


  const handleComplete = async (finalRole?: UserRole) => {
    const r = finalRole || role;
    if (!r) return;

    const companyData = r === 'company' ? {
        name: details.name,
        number: details.number,
        address: details.address,
        status: details.status,
        sicCode: details.sicCode,
        vatNumber: details.vatNumber,
        eoriNumber: details.eoriNumber,
        products: details.products,
        countries: details.countries,
        tradeType: details.tradeType,
        aeoStatus: details.aeoStatus,
        forwarder: details.forwarder,
        ddaAccount: details.ddaAccount
    } : undefined;

      try {
        setLoading(true);
        await updateUser({
            role: r,
            companyDetails: companyData as any
        });
        onComplete();
      } catch (err) {
        console.error('Failed to update user profile:', err);
        setError('Failed to save profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    // If not company role, just update immediately without blocking too much, 
    // but better to wait for consistency.
    // However, the original logic for handleRoleSelect called handleComplete directly for non-company roles.
    // Let's make sure handleComplete handles the loading state.

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-bg-elevated rounded-xl shadow-lg border border-border-default h-[600px] overflow-y-auto">
      <AnimatePresence mode="wait">
        
        {/* Step 1: Role Selection */}
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center">Welcome! How will you use TradeCalc?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['researcher', 'importer', 'exporter'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSelect(r)}
                  disabled={loading}
                  className={`p-6 border border-border-default rounded-lg hover:border-brand-primary hover:bg-bg-surface transition-all text-left ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <User className="w-8 h-8 mb-3 text-brand-primary" />
                  <h3 className="font-semibold capitalize">{r}</h3>
                  <p className="text-sm text-text-secondary">Free access for individuals</p>
                </button>
              ))}
              <button
                onClick={() => handleRoleSelect('company')}
                disabled={loading}
                className={`p-6 border border-border-default rounded-lg hover:border-brand-primary hover:bg-bg-surface transition-all text-left md:col-span-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Building2 className="w-8 h-8 mb-3 text-brand-primary" />
                <h3 className="font-semibold">Company</h3>
                <p className="text-sm text-text-secondary">Premium features for businesses</p>
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Region Selection */}
        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button onClick={prevStep} className="text-sm text-text-secondary hover:text-text-primary">← Back</button>
            <h2 className="text-2xl font-bold text-center">Where is your company incorporated?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleRegionSelect('UK')}
                className="p-8 border border-border-default rounded-lg hover:border-brand-primary hover:bg-bg-surface transition-all"
              >
                <span className="text-4xl mb-4 block">🇬🇧</span>
                <h3 className="text-xl font-semibold">United Kingdom</h3>
              </button>
              <button
                onClick={() => handleRegionSelect('EU')}
                className="p-8 border border-border-default rounded-lg hover:border-brand-primary hover:bg-bg-surface transition-all"
              >
                <span className="text-4xl mb-4 block">🇪🇺</span>
                <h3 className="text-xl font-semibold">European Union</h3>
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Company Search (UK) */}
        {step === 3 && region === 'UK' && (
          <motion.div 
            key="step3-uk"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button onClick={prevStep} className="text-sm text-text-secondary hover:text-text-primary">← Back</button>
            <h2 className="text-2xl font-bold">Find your company</h2>
            <p className="text-text-secondary">Search the Companies House register.</p>
            
            <div className="flex gap-2">
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Company name or number"
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && searchCompany()}
              />
              <Button onClick={searchCompany} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((company) => (
                <button
                  key={company.company_number}
                  onClick={() => selectCompany(company)}
                  className="w-full p-3 text-left border border-border-default rounded hover:bg-bg-surface transition-colors"
                >
                  <div className="font-semibold">{company.title}</div>
                  <div className="text-sm text-text-secondary">
                    {company.company_number} • {company.company_status}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 4: Additional Details (UK) */}
        {step === 4 && region === 'UK' && (
          <motion.div 
            key="step4-uk"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button onClick={prevStep} className="text-sm text-text-secondary hover:text-text-primary">← Back</button>
            <h2 className="text-2xl font-bold">Company Details</h2>
            
            <div className="p-4 bg-bg-surface rounded-lg border border-border-default">
              <h3 className="font-semibold">{details.name}</h3>
              <p className="text-sm text-text-secondary">{details.number}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${details.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {details.status}
                </span>
                {details.sicCode && <span className="text-xs text-text-secondary">SIC: {details.sicCode}</span>}
              </div>
            </div>

            <div className="space-y-4">
                {/* VAT & EORI */}
                <div>
                    <label className="block text-sm font-medium mb-1">VAT Number</label>
                    <Input 
                        value={details.vatNumber || ''}
                        onChange={(e) => setDetails({...details, vatNumber: e.target.value})}
                        onBlur={handleVatBlur}
                        placeholder="GB123456789"
                    />
                </div>
                {details.eoriNumber && (
                    <div className="p-3 bg-bg-surface rounded border border-border-default">
                        <div className="text-sm font-medium">EORI Number (Auto-generated)</div>
                        <div className="font-mono">{details.eoriNumber}</div>
                        {details.isEoriValid === true && <div className="text-green-500 text-xs flex items-center gap-1 mt-1"><CheckCircle className="w-3 h-3"/> Active on HMRC</div>}
                        {details.isEoriValid === false && (
                            <div className="text-amber-500 text-xs mt-1">
                                {details.eoriError} <a href="https://www.gov.uk/eori" target="_blank" className="underline">Get an EORI number</a>
                            </div>
                        )}
                    </div>
                )}

                {/* Trade Type */}
                <div>
                    <label className="block text-sm font-medium mb-1">Trade Type</label>
                    <div className="flex gap-4">
                        {['import', 'export', 'both'].map((type) => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="tradeType"
                                    checked={details.tradeType === type}
                                    onChange={() => setDetails(prev => ({ ...prev, tradeType: type as any }))}
                                />
                                <span className="capitalize">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Products */}
                <div>
                    <label className="block text-sm font-medium mb-1">Products of Interest (Max 5)</label>
                    <div className="flex gap-2 mb-2">
                        <Input 
                            value={newProduct}
                            onChange={(e) => setNewProduct(e.target.value)}
                            placeholder="e.g. Footwear, Electronics (HS Code or Name)"
                            disabled={details.products.length >= 5}
                            onKeyDown={(e) => e.key === 'Enter' && addProduct()}
                        />
                        <Button onClick={addProduct} disabled={details.products.length >= 5} size="sm"><Plus className="w-4 h-4"/></Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {details.products.map((p, i) => (
                            <span key={i} className="bg-brand-primary/10 text-brand-primary px-2 py-1 rounded text-sm flex items-center gap-1">
                                {p} <button onClick={() => removeProduct(i)}><X className="w-3 h-3"/></button>
                            </span>
                        ))}
                    </div>
                </div>

                 {/* Countries */}
                 <div>
                    <label className="block text-sm font-medium mb-1">Countries of Interest</label>
                    <div className="flex gap-2 mb-2">
                        <Input 
                            value={newCountry}
                            onChange={(e) => setNewCountry(e.target.value)}
                            placeholder="e.g. China, USA"
                            onKeyDown={(e) => e.key === 'Enter' && addCountry()}
                        />
                        <Button onClick={addCountry} size="sm"><Globe className="w-4 h-4"/></Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {details.countries.map((c, i) => (
                            <span key={i} className="bg-bg-surface border border-border-default px-2 py-1 rounded text-sm flex items-center gap-1">
                                {c} <button onClick={() => removeCountry(i)}><X className="w-3 h-3"/></button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Extra Questions */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={details.aeoStatus || false} onChange={(e) => setDetails(prev => ({ ...prev, aeoStatus: e.target.checked }))} />
                        <span className="text-sm">We have AEO Status</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={details.ddaAccount || false} onChange={(e) => setDetails(prev => ({ ...prev, ddaAccount: e.target.checked }))} />
                        <span className="text-sm">We have a DDA Account</span>
                    </label>
                     <div>
                        <label className="block text-sm font-medium mb-1">Current Forwarder</label>
                        <Input 
                            value={details.forwarder || ''}
                            onChange={(e) => setDetails({...details, forwarder: e.target.value})}
                            placeholder="Optional"
                        />
                    </div>
                </div>

                <Button onClick={() => handleComplete()} disabled={loading} className="w-full mt-4">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Complete Setup
                </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: VAT Check (EU) */}
        {step === 3 && region === 'EU' && (
          <motion.div 
            key="step3-eu"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button onClick={prevStep} className="text-sm text-text-secondary hover:text-text-primary">← Back</button>
            <h2 className="text-2xl font-bold">Verify VAT Number</h2>
            <p className="text-text-secondary">Enter your EU VAT number to verify via VIES.</p>
            
            <div className="space-y-4">
                 <Input 
                    value={details.vatNumber || ''}
                    onChange={(e) => setDetails({...details, vatNumber: e.target.value})}
                    placeholder="e.g. DE123456789"
                />
                
                {error && (
                    <div className="text-red-500 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                )}

                <Button onClick={handleViesCheck} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Verify & Continue
                </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

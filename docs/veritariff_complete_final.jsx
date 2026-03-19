import { useState } from "react";

// ── ALL DATA ────────────────────────────────────────────────────

const STATS = [
  { figure: "£13B", label: "lost by UK businesses at borders annually", source: "Trade Audit 2025 / OBR", color: "#C0392B" },
  { figure: "23%", label: "drop in UK exports to EU since Brexit (2017–2024)", source: "Logistics UK / X2 UK, 2025", color: "#B7770D" },
  { figure: "66%", label: "of UK businesses report border delays raising costs", source: "Logistics UK Survey, 2024", color: "#B7770D" },
  { figure: "€100/t", label: "CBAM penalty per excess tonne not surrendered", source: "EU Reg 2023/956, Coolset 2026", color: "#C0392B" },
  { figure: "$550B", label: "of goods hit by US Section 301 tariffs on China", source: "USTR / China Briefing, 2025", color: "#C0392B" },
  { figure: "$220B", label: "intra-African trade in 2026, growing 12.4% YoY under AfCFTA", source: "Dawan Africa / AfCFTA Secretariat, Jan 2026", color: "#0F6E56" },
];

const COPY_SECTIONS = [
  {
    section: "TAB TITLE & META",
    before: "veritariffai — Customs Import Duty Calculator with Live TARIC Data",
    after: "Veritariff — The Trade Compliance OS for SMEs",
    meta: "We stop companies from bleeding profit at the border. AI-powered trade compliance: HS classification, duties, sanctions, CBAM, customs declarations, and the Barrister's Bundle — in one platform.",
    note: "Change immediately. This is how you appear in Google, investor searches, and every demo."
  },
  {
    section: "HERO HEADLINE",
    before: "We stop companies from bleeding profit at the border.",
    after: "KEEP THIS EXACTLY. Do not change it.",
    note: "It is perfect. Everything else should serve this line."
  },
  {
    section: "HERO SUBHEADLINE",
    before: "Global trade is a data minefield. Veritariff is the central hub to simulate profit margins, automate customs workflows, and instantly clear sanctions.",
    after: "The last time the world re-bilateralised like this, global trade collapsed by 66%. Today: CBAM, safeguard duties, forced labour laws, and 54 African nations opening simultaneously. Veritariff is the intelligence layer that turns regulatory complexity into competitive advantage — for every SME that moves goods across borders.",
    note: "Now has urgency, stakes, and a reason to care."
  },
  {
    section: "PAIN POINT 1",
    before: "Profit Wiped Out — A 5-day customs delay equals a 1% tariff increase",
    after: "£469M in new annual border costs since Brexit",
    body: "UK businesses face £469M in new compliance costs per year from post-Brexit border requirements alone — and that figure rises every time a new regulation lands.",
    source: "NAO, 2024 — 'Delays and uncertainty hamper post EU exit border ambitions'"
  },
  {
    section: "PAIN POINT 2",
    before: "Compliance Fines — Sanctions and carbon taxes are now board-level risks",
    after: "CBAM default values: a hidden €100/tonne penalty",
    body: "The EU's carbon border tax entered definitive enforcement in January 2026. Importers who can't supply verified emissions data face a €100 per excess tonne penalty. BF-BOF defaults overstate actual EAF emissions by up to 10x.",
    source: "EU Commission CBAM official site; Coolset CBAM timeline 2026; O'Melveny Jan 2026"
  },
  {
    section: "PAIN POINT 3",
    before: "Manual Chaos — Endless emails between forwarders, suppliers, and customs brokers",
    after: "66% of businesses hit by border delays raising costs",
    body: "A 2024 Logistics UK survey found 66% of respondents reported border delays directly increasing transportation costs. For perishables, a single 5-day hold wipes the entire shipment margin.",
    source: "Logistics UK Survey 2024"
  },
  {
    section: "CTA BUTTONS",
    before: "Try calculator for free",
    after: "See how it works  |  Start free",
    note: "Add 'See how it works' as primary CTA above the fold. Shows the journey before asking for signup."
  },
];

const HOW_IT_WORKS = [
  {
    step: "01", title: "Enter your goods", subtitle: "Classification Wizard",
    color: "#185FA5", bg: "#E6F1FB", border: "#185FA5",
    what: "User describes their product. AI asks guided questions — chemical composition, physical form, intended use — and outputs the 10-digit commodity code.",
    developer: [
      "Dropdown: chemical composition tree (waste→7204, pig iron→7201, other alloy→7224 etc.)",
      "Conditional sub-dropdown: physical form per alloy class",
      "Call Trade Tariff API: api.trade-tariff.service.gov.uk for live 10-digit code + flags",
      "Pre-check gate: if code already in session → skip wizard, green tick",
      "Save: classification_id, supplementary_units, regulatory_flags to shipment object",
      "MANDATORY footer: 'Contains public sector information licensed under the Open Government Licence v3.0'"
    ],
    outcome: "10-digit HS code confirmed. Regulatory flags raised (CBAM, TRQ, sanctions risk)."
  },
  {
    step: "02", title: "Know your duties", subtitle: "Duty & RoO Engine",
    color: "#0F6E56", bg: "#E1F5EE", border: "#0F6E56",
    what: "Platform calculates all applicable duties — MFN, TCA preferential rate, EU steel safeguard TRQ, CBAM carbon cost — and shows the financial delta between claiming and not claiming preferences.",
    developer: [
      "MFN gateway: fetch live MFN from Trade Tariff API. If 0% AND origin ≠ RU → 'Duty Free'",
      "TCA RoO engine: PSR checker for HS code. For 7224: CTH rule — flag melt+pour requirement",
      "Safeguard TRQ: fetch live Category 26 quota balance from EU TARIC daily. Alert at 25% remaining",
      "If TRQ exhausted → display 25% current / 50% proposed Jul 2026 + decision modal",
      "CBAM calculator: if EU importer >50t/year → collect production route → SEE calc → show cost vs default penalty",
      "Save: origin_status, duty_rate_applied, trq_quota_remaining, cbam_applicable"
    ],
    outcome: "Exact duty liability calculated. CBAM cost vs verified-data saving shown in £. TRQ availability with live countdown."
  },
  {
    step: "03", title: "Prove your origin", subtitle: "5-Method Origin Engine",
    color: "#534AB7", bg: "#EEEDFE", border: "#534AB7",
    what: "Platform presents the right proof-of-origin method — from Statement on Origin to EUR.1 to Importer's Knowledge — and generates or validates the documentation automatically.",
    developer: [
      "Role gate: supplier / exporter / importer → route to correct method",
      "EUR.1: AI pre-fills C1299 from vault → user downloads → uploads stamped → AI verifies",
      "Statement on Origin: if existing → upload + AI verifies TCA Annex ORIG-4. If not → generate from packing list/invoice → attach EORI/REX",
      "Importer's Knowledge: collect commodity codes + production process. TCA Art.20 liability warning",
      "Form A: ONLY if destination = developing nation GSP list. Link: gov.uk/government/collections/trading-with-developing-nations",
      "Auto-populate 'No cumulation applied' for UK→EU. Never leave blank."
    ],
    outcome: "Proof of origin generated or validated. TCA Annex ORIG-4 wording confirmed. SHA-256 hashed."
  },
  {
    step: "04", title: "Clear sanctions", subtitle: "Sanctions & Licence Gate",
    color: "#993C1D", bg: "#FAECE7", border: "#993C1D",
    what: "Every party and every material is screened in real time. Russian melt origin blocked regardless of where processing occurred. Licence requirements checked automatically.",
    developer: [
      "Screen: exporter, consignee, end-user, melt-origin country vs OFSI / UN / OFAC / EU Consolidated List",
      "Hard block: if any party listed OR meltCountry = RU/BY → block with explanation",
      "SECL check: commodity on UK Strategic Export Control List? If yes → require SIEL/OIEL",
      "TARIC measures: fetch live. If V710 → warn EU importer must obtain prior surveillance doc",
      "MTC Auto-Auditor (AI): extract mill name, melt/pour country, heat number, composition → cross-ref vs classification (flag >0.05% variance) → screen mill vs sanctions → check issue date ≤12 months",
      "All results → append-only audit_log (no UPDATE/DELETE ever)"
    ],
    outcome: "All parties cleared. Melt origin verified. MTC validated. SHA-256 hash stored."
  },
  {
    step: "05", title: "File your declaration", subtitle: "CDS Declaration Engine",
    color: "#3B6D11", bg: "#EAF3DE", border: "#3B6D11",
    what: "All 17 CDS Data Elements are auto-populated from the shipment object. EORI validated against HMRC live. EXS timing calculated per transport mode. MRN received on acceptance.",
    developer: [
      "Auto-populate all 17 DEs: DE1/10 (1040), DE3/1 (GB EORI via HMRC API), DE5/8 (DE), DE6/8 (10-digit), DE6/1 net mass, DE6/5 gross mass",
      "Currency: non-GBP → convert via HMRC weekly exchange rate",
      "EXS timing: RoRo ≥2h / Container ≥24h / Air ≥30min / AEO = waived. Alert at deadline minus 1 hour",
      "Licence attach: if licenceRef → attach to DE2/3 status 'EE'. If required but missing → block + redirect",
      "On HMRC acceptance → receive 18-char MRN → store + display",
      "Procedure code 1040 — permanent export"
    ],
    outcome: "CDS declaration accepted. MRN generated. EXS deadline set. Proof of export created for VAT zero-rating."
  },
  {
    step: "06", title: "Release the bundle", subtitle: "The Barrister's Bundle",
    color: "#854F0B", bg: "#FAEEDA", border: "#854F0B",
    what: "All mandatory documents validated. Release gate checks every condition. Cryptographically signed Clearance Certificate generated. AES-256 bundle delivered to all three parties simultaneously.",
    developer: [
      "Document vault: accept commercial invoice, packing list, MTC, MRN, sanctions clear. SHA-256 hash each on upload",
      "Release gate: ALL mandatory docs VALIDATED + TCA declaration signed + CBAM complete → CLEARED_FOR_EXPORT",
      "If any mandatory doc missing → show specific blocker with resolution instructions",
      "On CLEARED: generate Veritariff Clearance Certificate (SHA-256 signed, timestamped, all doc hashes)",
      "Bundle → AES-256 encrypted ZIP → Supabase Storage",
      "Notify: exporter + freight forwarder + DE importer simultaneously",
      "Shipment timeline UI: 6-step progress bar visible from dashboard at all times"
    ],
    outcome: "Clearance Certificate issued. Bundle delivered. Trade finance window: 48 hours vs 2 weeks standard."
  }
];

const PAIN_POINTS = [
  {
    corridor: "US ↔ China", flag: "🇺🇸↔🇨🇳", color: "#C0392B",
    headline: "The world's biggest trade route — turned into a minefield",
    stat: "$550B", statLabel: "of goods hit by Section 301 tariffs",
    source: "USTR / China Briefing, 2025",
    pains: [
      { label: "Tariff whiplash", detail: "US tariffs on Chinese goods peaked at 127% in May 2025 before partial rollback. Businesses priced contracts at 25% — woke up to 145% overnight. Zero automated alert systems exist." },
      { label: "Entity List blindspot", detail: "BIS Entity List: 1,800+ Chinese entities. Updates with zero notice. Most companies do quarterly batch checks. A supplier cleared Monday can be sanctioned Friday — your shipment is already at sea." },
      { label: "UFLPA seizures", detail: "$1.73B in goods seized in 2024 under Uyghur Forced Labour Prevention Act. Rebuttable presumption: any Xinjiang-origin goods presumed illegal unless proven otherwise." },
      { label: "$24B soybean wipeout", detail: "China's share of US soybean exports dropped from 62% to 18% in 2017–18. Farmers lost $24B in exports — not from a bad harvest. From a tariff war they couldn't see coming." },
    ]
  },
  {
    corridor: "EU ↔ Africa (AfCFTA)", flag: "🇪🇺↔🌍", color: "#B7770D",
    headline: "The largest free trade area on earth — that almost no one can use",
    stat: "15%", statLabel: "intra-African trade vs 60%+ in Europe",
    source: "Brookings / AfCFTA Secretariat, 2025",
    pains: [
      { label: "126-hour customs dwell time", detail: "Average customs clearance time in Sub-Saharan Africa: 126 hours. OECD average: 1–2 days. For perishables, this isn't a delay — it's a death sentence for the shipment." },
      { label: "42 currencies, no settlement", detail: "AfCFTA covers 54 nations and 42 currencies. PAPSS is live but has low private-sector adoption. Most cross-border payments still route through New York, adding 3–5 days and FX cost." },
      { label: "Incomplete rules of origin", detail: "AfCFTA RoO negotiations are incomplete for key product categories. An exporter cannot claim preferences until their specific product's rules are finalised — and the schedule varies by country." },
      { label: "$100B trade finance gap", detail: "$100B trade finance gap specifically blocks African SME cross-border trade. Banks can't assess credit risk because no standardised digital documentation exists." },
    ]
  },
  {
    corridor: "UK ↔ EU", flag: "🇬🇧↔🇪🇺", color: "#185FA5",
    headline: "The most expensive political divorce in trade history",
    stat: "£469M", statLabel: "in new annual compliance costs for UK businesses",
    source: "NAO, 2024",
    pains: [
      { label: "CBAM: a hidden €100/t penalty", detail: "EU carbon border tax definitive from January 2026. BF-BOF default = ~2 tCO₂/t. Actual EAF = ~0.36 tCO₂/t. Importers using defaults overpay by up to 10x." },
      { label: "TRQ blindness", detail: "UK country-specific steel quotas. When exhausted, duty jumps 0%→25% (proposed 50% from July 2026). No platform alerts exporters. They find out at Hamburg." },
      { label: "66% hit by delays", detail: "66% of UK businesses report border delays directly raising costs. A 5-day hold on a perishable shipment doesn't delay the profit — it destroys it." },
      { label: "23% export drop", detail: "UK exports to the EU fell 23% post-Brexit. Not because demand collapsed — because compliance overhead made trade economically irrational for SMEs." },
    ]
  },
  {
    corridor: "Australia ↔ Asia-Pacific", flag: "🇦🇺↔🌏", color: "#0F6E56",
    headline: "World-class products. World's strictest biosecurity. World's worst paperwork.",
    stat: "A$11,400", statLabel: "average annual compliance leakage per SME exporter",
    source: "Veritariff analysis, 2025",
    pains: [
      { label: "DAFF zero-tolerance", detail: "Australia's biosecurity authority can re-export your machinery at your cost if a single soil particle is found. New field-tested equipment requires an Import Permit. No software automates the pre-documentation." },
      { label: "JAEPA preference losses", detail: "JAEPA delivers near-zero tariffs — but Australian exporters routinely lose the preference at Japanese clearance by mis-formatting the EDI declaration for Japan's NACCS system." },
      { label: "Illegal Logging Act 2024", detail: "Effective March 2025. Enhanced due diligence required on timber sourcing. New documentation requirements not yet integrated into any freight forwarder's workflow." },
      { label: "Japanese SPS rejection", detail: "Japan's Food Labelling Act requires Japanese-language nutrition labels. Australian exporters producing English-only docs face rejection at Yokohama — re-labelling in Tokyo: A$2,200 average cost." },
    ]
  },
  {
    corridor: "Global picture", flag: "🌐", color: "#534AB7",
    headline: "The number that puts it all in perspective",
    stat: "$1.9T", statLabel: "estimated global GDP loss from US-China tariff escalation 2024–28",
    source: "Oxford Economics / US-China Business Council, 2023",
    pains: [
      { label: "Trade compliance market: $5B, serving multinationals only", detail: "Global trade compliance software market is $5B in 2025 at 12% CAGR. Every major player — SAP, Oracle, Descartes — serves large enterprises. SMEs get spreadsheets." },
      { label: "$1.3B bank fine for compliance failure", detail: "A major US bank settled at $1.3B for lapses in third-party due diligence facilitating illicit trade. The burden of proof is now entirely on businesses." },
      { label: "UFLPA: $1.73B seized in 2024", detail: "Enforcement is accelerating. No freight forwarder currently screens supply chains in real time against the UFLPA." },
      { label: "WiseTech acquires e2open for $2.1B", detail: "August 2025: largest M&A deal in trade compliance history. The category is consolidating around enterprise. Nobody is building for SMEs." },
    ]
  }
];

const WHY_NOW = [
  {
    icon: "1929", color: "#C0392B", headline: "History is repeating",
    oneliner: "The 1920s called. It wants its trade war back.",
    body: "Smoot-Hawley. Section 301. Brexit. CBAM. Every generation faces the same choice: cooperate or fragment. In the 1920s they fragmented. Trade collapsed 66%. We know how that ended. The difference this time: you can build the infrastructure that makes compliance cheap enough that businesses don't have to choose between going global and staying solvent.",
    stat: "66%", statLabel: "collapse in global trade, 1929–34",
    source: "Kindleberger, 'The World in Depression', 1986"
  },
  {
    icon: "2026", color: "#B7770D", headline: "The rules just got unmanageable",
    oneliner: "CBAM. UFLPA. Safeguard duties. 5 new US privacy laws. All in 18 months.",
    body: "Manual compliance is no longer a viable business strategy. January 2026 marked the shift from 'reporting' to 'enforcement'. The number of overlapping, technically demanding regulatory regimes now exceeds what any spreadsheet — or consultant — can track.",
    stat: "€100/t", statLabel: "CBAM penalty per excess tonne not surrendered",
    source: "EU Reg 2023/956; O'Melveny Jan 2026"
  },
  {
    icon: "NOW", color: "#0F6E56", headline: "New routes. No maps.",
    oneliner: "54 African nations. Vietnam. Indonesia. Malaysia. All open. All unserved.",
    body: "AfCFTA created the world's largest free trade area. Vietnam negotiated US tariffs from 46% to 20%. Indonesia, Malaysia, and Taiwan are being aligned as China+1 alternatives. These corridors are opening faster than any compliance platform can follow — and the businesses that move first win.",
    stat: "$3.4T", statLabel: "AfCFTA combined GDP — only 15% currently traded within Africa",
    source: "Brookings / AfCFTA Secretariat, 2025"
  },
  {
    icon: "AI", color: "#185FA5", headline: "AI makes it possible — for the first time",
    oneliner: "The work that cost £50k/year in consultants now takes 15 minutes.",
    body: "HS classification. Document validation. Sanctions screening. Emissions calculation. Origin declaration. A customs broker, trade lawyer, CBAM consultant, and sanctions specialist used to cost £50k/year. AI does all of it in the time it takes to upload a PDF. This is not incremental improvement. It is a category collapse.",
    stat: "15 min", statLabel: "from commodity description to clearance certificate",
    source: "Veritariff workflow analysis"
  }
];

const CORRIDORS = [
  { name: "UK ↔ EU", status: "LIVE", color: "#0F6E56", flags: "🇬🇧🇩🇪🇫🇷🇳🇱🇮🇹🇪🇸", desc: "Full 7-step workflow. Steel, chemicals, agri-food. CBAM + TCA + CDS live." },
  { name: "UK ↔ China", status: "Q3 2026", color: "#185FA5", flags: "🇬🇧🇨🇳", desc: "Section 301 engine. Entity List real-time screen. UFLPA chain tracing." },
  { name: "All AfCFTA Nations", status: "Q4 2026", color: "#B7770D", flags: "🇬🇧🇳🇬🇿🇦🇰🇪🇪🇬🇬🇭🇨🇮🌍", desc: "All 54 AfCFTA nations. RoO navigator. PAPSS payments. SPS engine." },
  { name: "UK ↔ US", status: "Q1 2027", color: "#534AB7", flags: "🇬🇧🇺🇸", desc: "USMCA alignment. State privacy stack. Customs bond automation." },
  { name: "UK ↔ Australia", status: "Q1 2027", color: "#993C1D", flags: "🇬🇧🇦🇺", desc: "DAFF biosecurity pre-docs. JAEPA EDI formatter. Timber due diligence." },
  { name: "Vietnam ↔ EU", status: "Q2 2027", color: "#3B6D11", flags: "🇻🇳🇩🇪🇫🇷🇮🇹", desc: "EVFTA corridor. China+1 re-routing. CBAM for Vietnamese manufacturers." },
  { name: "UK ↔ Japan", status: "Q2 2027", color: "#C0392B", flags: "🇬🇧🇯🇵", desc: "UKJCEPA. NACCS declaration formatting. Japanese SPS + food labelling." },
  { name: "Global ↔ Global", status: "2028", color: "#444", flags: "🌐", desc: "Open API. Any corridor, any commodity. Veritariff as infrastructure." },
];

const PRICING = [
  {
    stream: "01", tag: "SAAS_CORE", name: "Standard Workspace", price: "£2,500", period: "/mo",
    color: "#185FA5", highlight: false,
    desc: "Full OS with template workflows your team amends to fit your structure.",
    features: ["HS Code Classification Wizard","Duty & RoO Engine","Automated Sanctions Screen","Statement on Origin Generator","CBAM SEE Calculator","Automated Audit Vault","1 active trade corridor","Up to 50 shipments/month","Email support"],
    roi: "Pays for itself on the first CBAM default penalty avoided."
  },
  {
    stream: "02", tag: "SAAS_ENTERPRISE", name: "Corporate Custom", price: "£4,500", period: "/mo",
    color: "#0F6E56", highlight: true, badge: "MOST POPULAR",
    desc: "Specialist-led. We build a 100% customised workflow for your business.",
    features: ["Everything in Standard","Multi-entity governance","Unlimited corridors","Unlimited shipments","MTC Auto-Auditor (AI PDF validation)","TRQ Quota Alert Dashboard — live","Barrister's Bundle + Clearance Certificate","AEO Pipeline Builder","Priority portal + dedicated compliance manager","Custom API integration"],
    roi: "£18,000+/month in recovered margin for a 200-shipment/month exporter."
  },
  {
    stream: "03", tag: "INFRASTRUCTURE", name: "API Integration", price: "£0.15", period: "/call",
    color: "#534AB7", highlight: false,
    desc: "For freight forwarders and brands needing real-time Landed Cost API integration.",
    features: ["Real-time landed cost endpoint","Live TARIC + UKGT duty rates","Sanctions screen API (per entity)","CBAM cost estimator","TRQ quota balance endpoint","99.99% SLA uptime","Webhook support","Direct customs portal connectivity"],
    roi: "Used by freight forwarders to embed compliance into booking flows."
  },
  {
    stream: "04", tag: "MARKETPLACE", name: "Brand DPPs", price: "Custom", period: "/tier",
    color: "#854F0B", highlight: false,
    desc: "Digital Product Passports for circular economy and CBAM compliance.",
    features: ["Cryptographically signed Digital Product Passport","CBAM embedded emissions certificate","Supply chain provenance record","Sustainability verification","EU DPP regulation ready","Share with buyers, banks, insurers","Brand-labelled passport portal"],
    roi: "Required under incoming EU Digital Product Passport regulation."
  },
  {
    stream: "05", tag: "TRADE_HUB", name: "Trade Hub", price: "£150", period: "/mo + 1.5% match",
    color: "#993C1D", highlight: false, badge: "NEW",
    desc: "Connect exporters to verified buyers globally. List, bid, match, comply — all in one flow.",
    features: ["List goods: code, volume, origin, price range","Instant buyer notification in destination market","Bidding engine: importers offer, exporter selects","On match: auto-routed into full compliance workflow","Buyer EORI/REX/VAT verified automatically","Shipment timeline shared with both parties live","Barrister's Bundle auto-generated on match","1.5% success fee on completed shipments only"],
    roi: "List your goods. Verified buyers bid. You accept. Veritariff handles the rest.",
    hubFlow: ["Exporter lists goods on Hub","Verified buyers in destination market notified instantly","Importers submit bids with EORI auto-verified","Exporter accepts best offer","Both parties auto-routed into Step 1 of compliance workflow","Clearance Certificate issued → 1.5% fee charged"]
  }
];

const TOP_TABS = [
  { id: "copy", label: "Website Copy" },
  { id: "howitworks", label: "How It Works" },
  { id: "pain", label: "Global Pain Points" },
  { id: "whynow", label: "Why Now" },
  { id: "corridors", label: "Corridors" },
  { id: "pricing", label: "Pricing" },
];

export default function VeritariffComplete() {
  const [tab, setTab] = useState("copy");
  const [expandedCopy, setExpandedCopy] = useState(null);
  const [expandedStep, setExpandedStep] = useState(null);
  const [activePain, setActivePain] = useState(0);
  const [expandedPain, setExpandedPain] = useState(null);
  const [activeWhy, setActiveWhy] = useState(null);

  return (
    <div style={{ fontFamily: "'IBM Plex Mono','Courier New',monospace", background: "#07090f", minHeight: "100vh", color: "#c8d6e8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#185FA5;border-radius:2px}
        .btn{cursor:pointer;border:none;font-family:inherit;transition:all .15s}
        .btn:hover{opacity:.85}
        .card{cursor:pointer;transition:all .12s}
        .card:hover{transform:translateY(-1px)}
        @keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        .fi{animation:fi .2s ease}
        .stripe:nth-child(odd){background:rgba(255,255,255,.02)}
      `}</style>

      {/* TOP BAR */}
      <div style={{ background:"#040608", borderBottom:"1px solid #1a2744", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ background:"#185FA5", color:"#fff", fontSize:9, fontWeight:700, padding:"3px 9px", borderRadius:3, letterSpacing:1.2 }}>VT</span>
          <span style={{ fontSize:13, color:"#c8d6e8", fontWeight:500 }}>Veritariff — Complete Website Deliverable</span>
        </div>
        <span style={{ fontSize:9, color:"#4a6b8a" }}>6 sections · all sourced · developer-ready</span>
      </div>

      {/* TAB BAR */}
      <div style={{ display:"flex", borderBottom:"1px solid #1a2744", overflowX:"auto" }}>
        {TOP_TABS.map(t => (
          <button key={t.id} className="btn"
            onClick={() => setTab(t.id)}
            style={{ padding:"10px 16px", fontSize:11, fontWeight:500, whiteSpace:"nowrap", background: tab===t.id ? "#0d1f3c" : "transparent", color: tab===t.id ? "#5ba3d9" : "#4a6b8a", borderBottom:`2px solid ${tab===t.id ? "#2e75b6" : "transparent"}`, borderTop:"none", borderLeft:"none", borderRight:"1px solid #0d1525" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding:"20px 22px", maxWidth:960, margin:"0 auto" }}>

        {/* ═══════════════════════════════════════
            TAB 1 — WEBSITE COPY
        ═══════════════════════════════════════ */}
        {tab === "copy" && (
          <div className="fi">
            <div style={{ fontSize:10, color:"#4a6b8a", letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Complete website copy rewrite — sourced stats + exact replacements</div>

            {/* Stat bar */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:14 }}>
              {STATS.map(s => (
                <div key={s.figure} style={{ background:"#060a12", border:`1px solid ${s.color}40`, borderLeft:`3px solid ${s.color}`, borderRadius:6, padding:"10px 12px" }}>
                  <div style={{ fontFamily:"monospace", fontSize:20, fontWeight:700, color:s.color }}>{s.figure}</div>
                  <div style={{ fontSize:10, color:"#7a8ea8", lineHeight:1.4, marginTop:2 }}>{s.label}</div>
                  <div style={{ fontSize:9, color:"#3a5060", marginTop:3, fontStyle:"italic" }}>Source: {s.source}</div>
                </div>
              ))}
            </div>

            {COPY_SECTIONS.map(cs => (
              <div key={cs.section} style={{ marginBottom:8 }}>
                <div className="card" onClick={() => setExpandedCopy(expandedCopy===cs.section ? null : cs.section)}
                  style={{ background:"#060a12", border:"1px solid #1a2744", borderRadius:6, padding:"11px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:10, color:"#5ba3d9", letterSpacing:1, textTransform:"uppercase", fontWeight:600 }}>{cs.section}</span>
                  <span style={{ color:"#4a6b8a", fontSize:12 }}>{expandedCopy===cs.section ? "▾" : "▸"}</span>
                </div>
                {expandedCopy===cs.section && (
                  <div style={{ background:"#040810", border:"1px solid #1a2744", borderTop:"none", borderRadius:"0 0 6px 6px", padding:"14px 16px" }}>
                    {cs.before && <div style={{ marginBottom:10 }}>
                      <div style={{ fontSize:9, color:"#C0392B", letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>CURRENT (REPLACE)</div>
                      <div style={{ fontSize:12, color:"#7a5050", fontStyle:"italic", padding:8, background:"#1a0808", borderRadius:4, borderLeft:"2px solid #C0392B", lineHeight:1.5 }}>{cs.before}</div>
                    </div>}
                    <div style={{ marginBottom:cs.note ? 10 : 0 }}>
                      <div style={{ fontSize:9, color:"#0F6E56", letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>NEW COPY</div>
                      <div style={{ fontSize:12, color:"#86efac", padding:8, background:"#081408", borderRadius:4, borderLeft:"2px solid #0F6E56", lineHeight:1.6 }}>{cs.after}</div>
                    </div>
                    {cs.body && <div style={{ fontSize:11, color:"#7a9a7a", lineHeight:1.6, marginBottom:8, padding:"6px 8px", background:"#0a1a0a", borderRadius:3 }}>{cs.body}</div>}
                    {cs.source && <div style={{ fontSize:9, color:"#4a6b4a", fontStyle:"italic", marginBottom:8 }}>Source: {cs.source}</div>}
                    {cs.note && <div style={{ fontSize:11, color:"#B7770D", background:"#1a1200", borderRadius:4, padding:"7px 10px", borderLeft:"2px solid #B7770D" }}>⚡ {cs.note}</div>}
                    {cs.meta && <div style={{ marginTop:8, fontSize:11, color:"#5ba3d9", background:"#0d1f3c", borderRadius:4, padding:"7px 10px", borderLeft:"2px solid #185FA5" }}>META: {cs.meta}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════
            TAB 2 — HOW IT WORKS
        ═══════════════════════════════════════ */}
        {tab === "howitworks" && (
          <div className="fi">
            <div style={{ fontSize:10, color:"#4a6b8a", letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>How It Works — 6-step developer spec + user-facing copy</div>

            <div style={{ background:"#0d1f3c", border:"1px solid #1a3a6b", borderRadius:6, padding:"10px 14px", marginBottom:14, fontSize:11, color:"#5ba3d9", lineHeight:1.7 }}>
              Visual: dark bg, vertical timeline, 6 colour-coded steps, expandable dev panels, financial callouts.<br/>
              Timeline bar at bottom: <strong style={{ color:"#c8d6e8" }}>"Full export cleared in under 15 minutes"</strong>
            </div>

            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.step} style={{ marginBottom:8 }}>
                <div className="card" onClick={() => setExpandedStep(expandedStep===i ? null : i)}
                  style={{ display:"flex", gap:12, alignItems:"flex-start", background:"#060a12", border:`1px solid ${s.border}40`, borderLeft:`3px solid ${s.border}`, borderRadius:6, padding:"13px 15px" }}>
                  <div style={{ fontFamily:"monospace", fontSize:22, fontWeight:700, color:s.border, opacity:.6, minWidth:32, lineHeight:1 }}>{s.step}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:"#c8d6e8" }}>{s.title}</span>
                      <span style={{ fontSize:9, padding:"2px 6px", borderRadius:3, background:s.bg, color:s.border, fontWeight:700, letterSpacing:.5 }}>{s.subtitle}</span>
                    </div>
                    <div style={{ fontSize:11, color:"#7a8ea8", lineHeight:1.5 }}>{s.what}</div>
                  </div>
                  <span style={{ color:"#4a6b8a", marginTop:2, fontSize:12 }}>{expandedStep===i ? "▾" : "▸"}</span>
                </div>
                {expandedStep===i && (
                  <div style={{ background:"#040810", border:`1px solid ${s.border}30`, borderTop:"none", borderRadius:"0 0 6px 6px", padding:"13px 15px" }}>
                    <div style={{ fontSize:9, color:s.border, letterSpacing:1, textTransform:"uppercase", marginBottom:8, fontWeight:600 }}>Developer implementation</div>
                    {s.developer.map((d, j) => (
                      <div key={j} className="stripe" style={{ display:"flex", gap:8, padding:"5px 8px", borderRadius:3, fontSize:11, color:"#7a8ea8", lineHeight:1.5 }}>
                        <span style={{ color:s.border, flexShrink:0 }}>→</span><span>{d}</span>
                      </div>
                    ))}
                    <div style={{ marginTop:10, padding:"8px 12px", background:s.bg, borderLeft:`3px solid ${s.border}`, borderRadius:3 }}>
                      <span style={{ fontSize:9, color:s.border, fontWeight:700, letterSpacing:.5 }}>OUTPUT: </span>
                      <span style={{ fontSize:11, color:s.color }}>{s.outcome}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div style={{ marginTop:14, background:"#0d1525", border:"1px solid #1a2744", borderRadius:6, padding:"13px 15px" }}>
              <div style={{ fontSize:9, color:"#4a6b8a", letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Timeline bar — homepage bottom of section</div>
              <div style={{ display:"flex", gap:0 }}>
                {[["Classify","~2min","#185FA5"],["Duties","~3min","#0F6E56"],["Origin","~5min","#534AB7"],["Sanctions","~1min","#993C1D"],["CDS","~4min","#3B6D11"],["Bundle","~instant","#854F0B"]].map(([l,t,c]) => (
                  <div key={l} style={{ flex:1, background:`${c}15`, border:`0.5px solid ${c}40`, padding:"8px 4px", textAlign:"center" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:c }}>{l}</div>
                    <div style={{ fontSize:9, color:"#4a6b8a", marginTop:2 }}>{t}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════
            TAB 3 — GLOBAL PAIN POINTS
        ═══════════════════════════════════════ */}
        {tab === "pain" && (
          <div className="fi">
            <div style={{ fontSize:10, color:"#4a6b8a", letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Global pain points — every corridor, sourced</div>

            <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
              {PAIN_POINTS.map((p,i) => (
                <button key={p.corridor} className="btn"
                  onClick={() => { setActivePain(i); setExpandedPain(null); }}
                  style={{ padding:"5px 11px", fontSize:11, fontWeight: activePain===i ? 600 : 400, background: activePain===i ? `${p.color}20` : "#060a12", border:`1px solid ${activePain===i ? p.color : "#1a2744"}`, borderRadius:4, color: activePain===i ? p.color : "#4a6b8a" }}>
                  {p.flag} {p.corridor}
                </button>
              ))}
            </div>

            {(() => {
              const p = PAIN_POINTS[activePain];
              return (
                <div className="fi">
                  <div style={{ background:"#060a12", border:`1px solid ${p.color}40`, borderLeft:`4px solid ${p.color}`, borderRadius:8, padding:"18px 20px", marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
                      <div>
                        <div style={{ fontSize:10, color:p.color, letterSpacing:1, textTransform:"uppercase", marginBottom:5, fontWeight:600 }}>{p.flag} {p.corridor}</div>
                        <div style={{ fontSize:14, fontWeight:600, color:"#c8d6e8", lineHeight:1.4, maxWidth:440 }}>{p.headline}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontFamily:"monospace", fontSize:30, fontWeight:700, color:p.color, lineHeight:1 }}>{p.stat}</div>
                        <div style={{ fontSize:10, color:"#4a6b8a", marginTop:3, maxWidth:180, lineHeight:1.4 }}>{p.statLabel}</div>
                        <div style={{ fontSize:9, color:"#3a5060", marginTop:3, fontStyle:"italic" }}>{p.source}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8 }}>
                    {p.pains.map((pain,i) => (
                      <div key={i} className="card"
                        onClick={() => setExpandedPain(expandedPain===`${activePain}-${i}` ? null : `${activePain}-${i}`)}
                        style={{ background: expandedPain===`${activePain}-${i}` ? `${p.color}12` : "#060a12", border:`1px solid ${expandedPain===`${activePain}-${i}` ? p.color : "#1a2744"}`, borderRadius:6, padding:"11px 13px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <span style={{ fontSize:12, fontWeight:600, color:"#c8d6e8" }}>{pain.label}</span>
                          <span style={{ color:p.color, fontSize:11 }}>{expandedPain===`${activePain}-${i}` ? "▾" : "▸"}</span>
                        </div>
                        {expandedPain===`${activePain}-${i}` && (
                          <div style={{ fontSize:11, color:"#7a8ea8", lineHeight:1.6, marginTop:8 }}>{pain.detail}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ═══════════════════════════════════════
            TAB 4 — WHY NOW
        ═══════════════════════════════════════ */}
        {tab === "whynow" && (
          <div className="fi">
            <div style={{ fontSize:10, color:"#4a6b8a", letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Why Now — short, catchy, one-glance readable</div>
            <div style={{ background:"#0d1525", border:"1px solid #1a2744", borderRadius:6, padding:"10px 14px", marginBottom:14, fontSize:11, color:"#5ba3d9" }}>
              Section headline: <strong style={{ color:"#c8d6e8" }}>"The world is re-bilateralising. Your margins are paying for it."</strong><br/>
              Sub: <span style={{ color:"#7a8ea8" }}>"Four forces converging right now — that make doing nothing the riskiest option."</span>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
              {WHY_NOW.map((c,i) => (
                <div key={c.id} className="card"
                  onClick={() => setActiveWhy(activeWhy===i ? null : i)}
                  style={{ background:"#060a12", border:`1px solid ${c.color}${activeWhy===i ? "80" : "30"}`, borderLeft:`3px solid ${c.color}`, borderRadius:6, padding:"14px 16px", transition:"all .2s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <span style={{ fontSize:10, padding:"2px 8px", borderRadius:3, background:`${c.color}20`, color:c.color, fontWeight:700, letterSpacing:.5, fontFamily:"monospace" }}>{c.icon}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:"#c8d6e8" }}>{c.headline}</span>
                  </div>
                  <div style={{ fontSize:14, color:c.color, fontWeight:600, marginBottom:8, lineHeight:1.3 }}>{c.oneliner}</div>
                  {activeWhy===i && (
                    <div className="fi">
                      <div style={{ fontSize:11, color:"#7a8ea8", lineHeight:1.6, marginBottom:10 }}>{c.body}</div>
                    </div>
                  )}
                  <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                    <span style={{ fontFamily:"monospace", fontSize:20, fontWeight:700, color:c.color }}>{c.stat}</span>
                    <span style={{ fontSize:10, color:"#4a6b8a", lineHeight:1.4 }}>{c.statLabel}</span>
                  </div>
                  <div style={{ fontSize:9, color:"#3a5060", marginTop:4, fontStyle:"italic" }}>Source: {c.source}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:12, background:"#060a12", border:"1px solid #1a2744", borderRadius:6, padding:"11px 14px", fontSize:10, color:"#4a6b8a" }}>
              Developer note: Cards show one-liner + stat by default. Click to expand body text. On mobile: full vertical stack. One-liners are H3 size — readable at a glance without clicking.
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════
            TAB 5 — CORRIDORS
        ═══════════════════════════════════════ */}
        {tab === "corridors" && (
          <div className="fi">
            <div style={{ fontSize:10, color:"#4a6b8a", letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Trade corridors — all bidirectional ↔</div>
            <div style={{ background:"#0d1525", border:"1px solid #1a2744", borderRadius:6, padding:"10px 14px", marginBottom:14, fontSize:11, color:"#5ba3d9", lineHeight:1.7 }}>
              All corridors are <strong style={{ color:"#c8d6e8" }}>↔ bidirectional</strong>. Developer: add direction toggle (Exporting from / Importing to) on each corridor page. Coming-soon cards should capture email with "Notify me when live."
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
              {CORRIDORS.map(c => (
                <div key={c.name} style={{ background:"#060a12", border:`1px solid ${c.color}40`, borderLeft:`3px solid ${c.color}`, borderRadius:6, padding:"14px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:"#c8d6e8" }}>{c.name}</span>
                    <span style={{ fontSize:9, padding:"2px 8px", borderRadius:3, fontWeight:700, letterSpacing:.5, background: c.status==="LIVE" ? "#0a1810" : "#0d1525", color: c.status==="LIVE" ? "#0F6E56" : "#4a6b8a", border:`0.5px solid ${c.status==="LIVE" ? "#0F6E56" : "#2a3a5a"}` }}>
                      {c.status}
                    </span>
                  </div>
                  <div style={{ fontSize:18, marginBottom:6 }}>{c.flags}</div>
                  <div style={{ fontSize:11, color:"#7a8ea8", lineHeight:1.5 }}>{c.desc}</div>
                  {c.status !== "LIVE" && <div style={{ marginTop:8, fontSize:10, color:"#4a6b8a", fontStyle:"italic" }}>→ Email capture: "Notify me when live"</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════
            TAB 6 — PRICING
        ═══════════════════════════════════════ */}
        {tab === "pricing" && (
          <div className="fi">
            <div style={{ fontSize:10, color:"#4a6b8a", letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Pricing — 5 streams from pitch deck + Trade Hub £150/mo</div>
            <div style={{ background:"#0d1525", border:"1px solid #1a2744", borderRadius:6, padding:"10px 14px", marginBottom:14, fontSize:11, color:"#5ba3d9" }}>
              Page headline: <strong style={{ color:"#c8d6e8" }}>"Monetising Strategy, Execution, and Infrastructure Across the Trade Stack."</strong><br/>
              Sub: <span style={{ color:"#7a8ea8" }}>"Stop paying £50k for consultants. Start with Veritariff."</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
              {PRICING.map(p => (
                <div key={p.stream} style={{ background:"#060a12", border:`1px solid ${p.color}${p.highlight ? "80" : "40"}`, borderRadius:8, overflow:"hidden", boxShadow: p.highlight ? `0 0 18px ${p.color}18` : "none" }}>
                  {p.badge && <div style={{ background:p.color, padding:"4px 0", textAlign:"center", fontSize:9, fontWeight:700, color:"#fff", letterSpacing:1.2 }}>{p.badge}</div>}
                  <div style={{ padding:"15px" }}>
                    <div style={{ fontSize:9, color:p.color, letterSpacing:1, fontWeight:700, marginBottom:3 }}>STREAM_{p.stream}: {p.tag}</div>
                    <div style={{ fontSize:14, fontWeight:600, color:"#c8d6e8", marginBottom:4 }}>{p.name}</div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:3, marginBottom:6 }}>
                      <span style={{ fontSize:24, fontWeight:700, color:p.color, fontFamily:"monospace" }}>{p.price}</span>
                      <span style={{ fontSize:10, color:"#4a6b8a" }}>{p.period}</span>
                    </div>
                    <div style={{ fontSize:11, color:"#7a8ea8", lineHeight:1.5, marginBottom:10, paddingBottom:10, borderBottom:"1px solid #0d1525" }}>{p.desc}</div>
                    {p.features.map((f,i) => (
                      <div key={i} style={{ display:"flex", gap:7, padding:"3px 0", fontSize:11, color:"#7a8ea8" }}>
                        <span style={{ color:p.color, flexShrink:0 }}>✓</span>
                        <span style={{ lineHeight:1.4 }}>{f}</span>
                      </div>
                    ))}
                    <div style={{ marginTop:10, padding:"7px 10px", background:`${p.color}12`, borderLeft:`2px solid ${p.color}`, borderRadius:3, fontSize:10, color:p.color, fontStyle:"italic" }}>{p.roi}</div>
                    {p.hubFlow && (
                      <div style={{ marginTop:10, borderTop:"1px solid #1a2744", paddingTop:10 }}>
                        <div style={{ fontSize:9, color:p.color, letterSpacing:1, fontWeight:700, marginBottom:6 }}>HOW THE HUB WORKS</div>
                        {p.hubFlow.map((step,i) => (
                          <div key={i} style={{ display:"flex", gap:8, padding:"3px 0", fontSize:10, color:"#7a5a5a" }}>
                            <span style={{ color:p.color, fontFamily:"monospace", flexShrink:0 }}>{i+1}.</span>
                            <span style={{ lineHeight:1.4 }}>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

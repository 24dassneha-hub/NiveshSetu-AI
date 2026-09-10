/**
 * Comprehensive Knowledge Base of Industrial & Commercial Clearances,
 * statutory authorities, timelines, and mandatory supporting documents.
 * 
 * Used by Sneha (AI Compliance Assistant) to advise users and
 * automatically generate document slots in the Document Vault.
 */

export const LICENSE_CATALOG = [
  {
    id: 'fire_noc',
    code: 'FIRE-NOC-01',
    name: 'Fire Safety Recommendation Certificate (Fire NOC)',
    category: 'Fire & Safety',
    authority: 'Directorate of Fire & Emergency Services, Odisha',
    department: 'Home Department',
    stage: 'Pre-Construction',
    slaDays: 14,
    acts: 'Odisha Fire Prevention and Fire Safety Act 1993',
    description: 'Mandatory statutory verification ensuring buildings and industrial premises have adequate fire detection, hydrant systems, water storage, and emergency evacuation infrastructure.',
    keywords: ['fire', 'noc', 'fire safety', 'extinguisher', 'hydrant', 'fire certificate', 'fire department'],
    requiredDocuments: [
      {
        name: 'Site & Building Layout Plan',
        type: 'SITE_PLAN',
        isMandatory: true,
        description: 'Architectural blueprint showing plot boundaries, entry/exit gates, driveway widths (min 6m), and adjacent structures.'
      },
      {
        name: 'Fire Fighting & Hydrant Schematic Layout',
        type: 'FIRE_SAFETY',
        isMandatory: true,
        description: 'Engineering drawing detailing internal/external hydrant risers, sprinkler heads, hose reels, and alarm panels.'
      },
      {
        name: 'Dedicated Fire Water Reservoir Capacity Certificate',
        type: 'OTHER',
        isMandatory: true,
        description: 'Proof of underground/overhead static water storage tank capacity (minimum 50,000 to 100,000 Litres as per NBC 2016).'
      },
      {
        name: 'Emergency Evacuation & Disaster Management Plan',
        type: 'FIRE_SAFETY',
        isMandatory: true,
        description: 'Standard Operating Procedure (SOP) with designated assembly points, exit signage routes, and emergency contacts.'
      },
      {
        name: 'Building Structural Stability Certificate',
        type: 'CERTIFICATE',
        isMandatory: false,
        description: 'Signed certificate from a registered Chartered Structural Engineer certifying load ratings.'
      }
    ]
  },
  {
    id: 'fssai_license',
    code: 'FSSAI-LIC-02',
    name: 'FSSAI Food Business Operator (FBO) License',
    category: 'Food Safety',
    authority: 'Food Safety and Standards Authority of India (FSSAI)',
    department: 'Health & Family Welfare Department',
    stage: 'Pre-Operation',
    slaDays: 30,
    acts: 'Food Safety and Standards Act 2006',
    description: 'Statutory licensing required for manufacturing, processing, packaging, storage, or distribution of any food and beverage products.',
    keywords: ['fssai', 'food', 'food safety', 'fbo', 'restaurant', 'cafe', 'catering', 'agro', 'beverage', 'kitchen'],
    requiredDocuments: [
      {
        name: 'Photo ID & Address Proof of Authorized Signatory',
        type: 'IDENTITY',
        isMandatory: true,
        description: 'Aadhaar Card, Passport, or PAN Card of proprietor, partners, or designated managing director.'
      },
      {
        name: 'Proof of Business Premises Possession',
        type: 'LEASE',
        isMandatory: true,
        description: 'Registered Lease Deed, Rent Agreement with NOC from owner, or Municipal Property Tax Receipt.'
      },
      {
        name: 'Food Safety Management System (FSMS) Plan',
        type: 'TECHNICAL',
        isMandatory: true,
        description: 'Documented hygiene protocols, Hazard Analysis Critical Control Point (HACCP) plan, or ISO 22000 declaration.'
      },
      {
        name: 'Potable Water Analysis Laboratory Test Report',
        type: 'CERTIFICATE',
        isMandatory: true,
        description: 'Chemical & microbiological test report from a NABL-accredited laboratory confirming IS 10500 compliance.'
      },
      {
        name: 'Manufacturing Process Flowchart & Equipment List',
        type: 'TECHNICAL',
        isMandatory: true,
        description: 'Schematic flow of food processing stages and list of installed machinery with horse power ratings.'
      },
      {
        name: 'Food Handler Medical Fitness Certificates',
        type: 'CERTIFICATE',
        isMandatory: false,
        description: 'Form IX medical fitness certificates for all workers handling food items directly.'
      }
    ]
  },
  {
    id: 'pollution_cte',
    code: 'OSPCB-CTE-03',
    name: 'Consent to Establish (CTE) — Pollution Clearance',
    category: 'Environment',
    authority: 'State Pollution Control Board (OSPCB)',
    department: 'Forest, Environment & Climate Change Department',
    stage: 'Pre-Construction',
    slaDays: 30,
    acts: 'Water Act 1974 & Air Act 1981',
    description: 'Mandatory primary environmental consent prior to laying foundations, installing boilers, or establishing manufacturing plants in Red, Orange, or Green categories.',
    keywords: ['cte', 'consent to establish', 'pollution', 'spcb', 'ospcb', 'effluent', 'environment', 'emission', 'etp'],
    requiredDocuments: [
      {
        name: 'Detailed Project Report (DPR) & Process Flow',
        type: 'ENVIRONMENT',
        isMandatory: true,
        description: 'Engineering summary describing raw materials, manufacturing chemistry, emissions, and byproducts.'
      },
      {
        name: 'Effluent Treatment Plant (ETP) / STP Schematics',
        type: 'POLLUTION',
        isMandatory: true,
        description: 'Design drawings and operational capacities of wastewater recycling or zero-liquid discharge systems.'
      },
      {
        name: 'Water Balance & Raw Material Input-Output Chart',
        type: 'TECHNICAL',
        isMandatory: true,
        description: 'Detailed quantifications of daily freshwater intake, process consumption, cooling loss, and effluent generated.'
      },
      {
        name: 'Site Plan with Green Belt Buffer Zone',
        type: 'SITE_PLAN',
        isMandatory: true,
        description: 'CAD drawing earmarking minimum 33% peripheral plantation and rainwater harvesting recharge pits.'
      },
      {
        name: 'Air Pollution Control Equipment (APCE) Specs',
        type: 'POLLUTION',
        isMandatory: true,
        description: 'Specifications for bag filters, wet scrubbers, cyclone separators, or acoustic enclosures for DG sets.'
      }
    ]
  },
  {
    id: 'pollution_cto',
    code: 'OSPCB-CTO-04',
    name: 'Consent to Operate (CTO) & Hazardous Waste Auth',
    category: 'Environment',
    authority: 'State Pollution Control Board (OSPCB)',
    department: 'Forest, Environment & Climate Change Department',
    stage: 'Operation',
    slaDays: 21,
    acts: 'Water Act 1974, Air Act 1981 & Hazardous Waste Management Rules 2016',
    description: 'Statutory permission required to commence trial and commercial manufacturing operations following verification of CTE conditions.',
    keywords: ['cto', 'consent to operate', 'hazardous waste', 'pollution renewal', 'ambient air', 'stack monitoring'],
    requiredDocuments: [
      {
        name: 'CTE Compliance & Physical Verification Report',
        type: 'POLLUTION',
        isMandatory: true,
        description: 'Point-by-point compliance memo addressing all conditions precedent in the original Consent to Establish.'
      },
      {
        name: 'Treated Effluent & Stack Emission Analysis Report',
        type: 'CERTIFICATE',
        isMandatory: true,
        description: 'Recent sample analysis from an EPA/OSPCB recognized laboratory showing parameters within prescribed norms.'
      },
      {
        name: 'Geo-tagged High Resolution Site Photographs',
        type: 'SITE_PLAN',
        isMandatory: true,
        description: 'Visual evidence of constructed ETP/STP, chimney stack sampling ports, flow meters, and chemical sheds.'
      },
      {
        name: 'Hazardous Waste Storage & Manifest Agreement',
        type: 'ENVIRONMENT',
        isMandatory: true,
        description: 'Agreement with Common Hazardous Waste Treatment, Storage, and Disposal Facility (TSDF).'
      },
      {
        name: 'Environmental Management Plan (EMP) Budget',
        type: 'FINANCIAL',
        isMandatory: false,
        description: 'Annual capital and recurring expenditure earmarked for pollution control maintenance.'
      }
    ]
  },
  {
    id: 'factory_lic',
    code: 'FB-FACT-05',
    name: 'Factory Operating License (Factories Act)',
    category: 'Factory',
    authority: 'Directorate of Factories & Boilers',
    department: 'Labour & ESI Department',
    stage: 'Operation',
    slaDays: 15,
    acts: 'Section 6 of Factories Act 1948 & State Factories Rules 1950',
    description: 'Mandatory operating license required for any premises employing 10 or more workers with power, or 20 or more without power.',
    keywords: ['factory', 'factory license', 'factories act', 'directorate of factories', 'boilers', 'manufacturing license'],
    requiredDocuments: [
      {
        name: 'Form 2 Application & Notice of Occupation',
        type: 'LICENSE',
        isMandatory: true,
        description: 'Prescribed statutory petition specifying installed power capacity, product catalog, and worker shifts.'
      },
      {
        name: 'Approved Factory Building & Machinery Layout Plan',
        type: 'BUILDING_PLAN',
        isMandatory: true,
        description: 'Copy of layout previously approved by the Chief Inspector of Factories showing safe worker clearances.'
      },
      {
        name: 'Notice of Appointment of Factory Manager',
        type: 'DECLARATION',
        isMandatory: true,
        description: 'Official resolution naming the designated Occupier and Factory Manager under Section 7.'
      },
      {
        name: 'Treasury Challan / Statutory Fee Payment Receipt',
        type: 'TAX',
        isMandatory: true,
        description: 'Proof of license fee payment calculated based on maximum installed horsepower and peak employee headcount.'
      },
      {
        name: 'Safety Committee Constitution & First Aid Plan',
        type: 'LABOUR',
        isMandatory: false,
        description: 'List of trained first aid responders and safety committee members (mandatory for 250+ employees).'
      }
    ]
  },
  {
    id: 'gst',
    code: 'TAX-GST-06',
    name: 'Goods & Services Tax (GST) Registration',
    category: 'Tax',
    authority: 'Commercial Taxes & GST Department',
    department: 'Finance Department',
    stage: 'Pre-Establishment',
    slaDays: 7,
    acts: 'Central GST Act 2017 & State GST Act 2017',
    description: 'Mandatory statutory tax registration required for claiming Input Tax Credit, executing interstate sales, or operating above threshold turnover.',
    keywords: ['gst', 'gstin', 'goods and services tax', 'commercial tax', 'tax registration', 'input tax credit'],
    requiredDocuments: [
      {
        name: 'Permanent Account Number (PAN) Card',
        type: 'TAX',
        isMandatory: true,
        description: 'PAN of Company, LLP, Partnership Firm, or Individual Proprietor.'
      },
      {
        name: 'Aadhaar Authentication & Photo of Promoters',
        type: 'IDENTITY',
        isMandatory: true,
        description: 'Biometric verification or Aadhaar OTP authenticated details of all active partners/directors.'
      },
      {
        name: 'Proof of Principal Place of Business',
        type: 'ADDRESS_PROOF',
        isMandatory: true,
        description: 'Electricity bill / Municipal Khata with registered rent agreement and landlord NOC.'
      },
      {
        name: 'Bank Account Verification / Cancelled Cheque',
        type: 'FINANCIAL',
        isMandatory: true,
        description: 'Cancelled commercial bank cheque or first page of bank passbook clearly showing IFSC and account holder name.'
      },
      {
        name: 'Certificate of Incorporation / Partnership Deed',
        type: 'BUSINESS_REGISTRATION',
        isMandatory: true,
        description: 'MCA Certificate of Incorporation (CIN), LLP Agreement, or registered Partnership Deed.'
      }
    ]
  },
  {
    id: 'land_allotment',
    code: 'IDCO-LAND-07',
    name: 'IDCO Industrial Land Allotment & Lease Deed',
    category: 'Business',
    authority: 'Industrial Infrastructure Development Corp (IDCO)',
    department: 'Industries Department',
    stage: 'Pre-Establishment',
    slaDays: 21,
    acts: 'IDCO Act 1980 & Single Window Facilitation Act',
    description: 'Statutory allotment and execution of long-term lease deed for industrial plots in designated industrial parks and estates.',
    keywords: ['land', 'idco', 'plot allotment', 'industrial estate', 'lease deed', 'industrial land', 'ground lease'],
    requiredDocuments: [
      {
        name: 'Comprehensive Detailed Project Report (DPR)',
        type: 'TECHNICAL',
        isMandatory: true,
        description: 'Investment breakdown, civil layout, technology partners, power & water requirements, and employment projection.'
      },
      {
        name: 'Audited Financial Statements & Net Worth Certificate',
        type: 'FINANCIAL',
        isMandatory: true,
        description: 'CA-certified net worth certificate and 3-year balance sheets proving financial capability to develop plot.'
      },
      {
        name: 'Board Resolution for Land Acquisition',
        type: 'DECLARATION',
        isMandatory: true,
        description: 'Authorized signatory resolution empowering representatives to execute IDCO covenants.'
      },
      {
        name: 'IDCO Prescribed Application Form A',
        type: 'OTHER',
        isMandatory: true,
        description: 'Form A with spatial requirement calculations and processing fee demand draft / RTGS receipt.'
      }
    ]
  },
  {
    id: 'water_gw',
    code: 'CGWA-GW-08',
    name: 'Groundwater Extraction Permission (CGWA / SGWA)',
    category: 'Water',
    authority: 'Central Ground Water Authority / State Water Resource Dept',
    department: 'Water Resources Department',
    stage: 'Pre-Operation',
    slaDays: 45,
    acts: 'Environment (Protection) Act 1986 & State Ground Water Guidelines',
    description: 'Mandatory NOC for drilling commercial borewells or drawing groundwater exceeding statutory threshold limits.',
    keywords: ['water', 'groundwater', 'borewell', 'cgwa', 'water extraction', 'water resource', 'rainwater'],
    requiredDocuments: [
      {
        name: 'Comprehensive Hydro-geological Survey Report',
        type: 'TECHNICAL',
        isMandatory: true,
        description: 'Piezometer reading, aquifer zone mapping, and drawdown recharge calculations by a certified hydro-geologist.'
      },
      {
        name: 'Digital Water Meter & Telemetry Scheme',
        type: 'TECHNICAL',
        isMandatory: true,
        description: 'P&ID schematic showing tamper-proof digital flow meter installations linked to automated loggers.'
      },
      {
        name: 'Rainwater Harvesting & Artificial Recharge Plan',
        type: 'SITE_PLAN',
        isMandatory: true,
        description: 'Civil structural drawings of percolation pits or recharge trenches capable of returning 100%+ extraction.'
      },
      {
        name: 'Affidavit on Recycled Wastewater Usage',
        type: 'DECLARATION',
        isMandatory: true,
        description: 'Notarized undertaking guaranteeing that treated wastewater is reused for cooling/landscaping.'
      }
    ]
  },
  {
    id: 'power_ht',
    code: 'DISCOM-HT-09',
    name: 'High Tension (HT) Industrial Power Sanction',
    category: 'Electricity',
    authority: 'Power Distribution Company (TPCODL / DISCOM)',
    department: 'Energy Department',
    stage: 'Pre-Construction',
    slaDays: 21,
    acts: 'Electricity Act 2003 & State Electricity Regulatory Commission Code',
    description: 'Grid connectivity sanction for 11 kV or 33 kV industrial feeders to power heavy industrial equipment and machinery.',
    keywords: ['power', 'electricity', 'ht sanction', 'tpcodl', 'discom', 'transformer', 'substation', 'load sanction', 'connected load'],
    requiredDocuments: [
      {
        name: 'Connected Load Schedule & Single Line Diagram (SLD)',
        type: 'TECHNICAL',
        isMandatory: true,
        description: 'Electrical engineer verified breakdown of motors, furnaces, lighting circuits, and power factor capacitors.'
      },
      {
        name: 'Transformer & Substation Technical Specs',
        type: 'TECHNICAL',
        isMandatory: true,
        description: 'Equipment test certificates, breaker ratings (VCB/SF6), and earthing layout details.'
      },
      {
        name: 'Chief Electrical Inspector (CEI) Approval Plan',
        type: 'CERTIFICATE',
        isMandatory: true,
        description: 'Statutory inspection clearance of high voltage installation under Indian Electricity Rules.'
      },
      {
        name: 'Wayleave NOC for Feeder Transmission Line',
        type: 'NOC',
        isMandatory: false,
        description: 'Right-of-way permissions from road authorities or private landowners along the cable route.'
      }
    ]
  },
  {
    id: 'labour_cl',
    code: 'DLO-CLRA-10',
    name: 'Contract Labour Principal Employer Registration (CLRA)',
    category: 'Labour',
    authority: 'Office of District Labour Officer',
    department: 'Labour & ESI Department',
    stage: 'Pre-Operation',
    slaDays: 10,
    acts: 'Section 7 of Contract Labour (Regulation and Abolition) Act 1970',
    description: 'Statutory certificate required for establishing establishments engaging 20 or more contractual or outsourced personnel.',
    keywords: ['labour', 'contract labour', 'clra', 'principal employer', 'manpower', 'workforce', 'dlo'],
    requiredDocuments: [
      {
        name: 'Form I Application for Principal Employer Registration',
        type: 'LABOUR',
        isMandatory: true,
        description: 'Statutory particulars of industrial establishment, contractors engaged, and nature of outsourced work.'
      },
      {
        name: 'Manpower Supply Service Level Agreements (SLAs)',
        type: 'LEASE',
        isMandatory: true,
        description: 'Copies of executed contracts with licensed labour supply agencies.'
      },
      {
        name: 'Statutory Treasury Challan for Registration Fees',
        type: 'TAX',
        isMandatory: true,
        description: 'Government treasury receipt graduated according to maximum number of contract workers deployed.'
      }
    ]
  },
  {
    id: 'boiler_reg',
    code: 'FB-BOILER-11',
    name: 'Boiler & Steam Pipeline Registration',
    category: 'Factory',
    authority: 'Directorate of Factories & Boilers',
    department: 'Labour & ESI Department',
    stage: 'Pre-Operation',
    slaDays: 20,
    acts: 'Indian Boilers Act 1923 & Indian Boiler Regulations 1950',
    description: 'Registration and hydraulic pressure test clearance prior to steaming any pressure vessel exceeding 25 sq. meter heating area.',
    keywords: ['boiler', 'steam', 'steam pipeline', 'ibr', 'pressure vessel', 'hydraulic test'],
    requiredDocuments: [
      {
        name: 'Boiler Fabricator Test Certificate (Form II & III)',
        type: 'TECHNICAL',
        isMandatory: true,
        description: 'Manufacturer warranty, chemical composition of steel plates, and radiographic weld testing certificates.'
      },
      {
        name: 'Certified Welder Qualification Certificates',
        type: 'CERTIFICATE',
        isMandatory: true,
        description: 'High pressure IBR welder passes certified by the Directorate for steam pipeline erection.'
      },
      {
        name: 'Steam Piping Isometric Layout Drawing',
        type: 'TECHNICAL',
        isMandatory: true,
        description: 'Piping flexibility analysis, safety valve discharge directions, and drain trap placements.'
      },
      {
        name: 'Hydraulic Test Inspection Requisition Form',
        type: 'OTHER',
        isMandatory: true,
        description: 'Application requesting physical presence of the Inspector of Boilers for cold hydrostatic pressure trial.'
      }
    ]
  },
  {
    id: 'trade_lic',
    code: 'ULB-TRADE-12',
    name: 'Municipal Trade License',
    category: 'Business',
    authority: 'Bhubaneswar Municipal Corporation (BMC) / Local ULB',
    department: 'Housing & Urban Development Department',
    stage: 'Pre-Operation',
    slaDays: 7,
    acts: 'Odisha Municipal Corporation Act 2003',
    description: 'Statutory local municipality permission allowing commercial or trading activities within urban local body limits.',
    keywords: ['trade', 'trade license', 'municipal', 'bmc', 'ulb', 'municipality', 'shop license', 'commercial establishment'],
    requiredDocuments: [
      {
        name: 'Proof of Business Premises & Holding Tax Receipt',
        type: 'OWNERSHIP',
        isMandatory: true,
        description: 'Up-to-date municipal holding tax assessment receipt or registered commercial rent agreement.'
      },
      {
        name: 'Identity & Address Proof of Applicant',
        type: 'IDENTITY',
        isMandatory: true,
        description: 'Aadhaar Card or PAN Card of proprietor or managing partner.'
      },
      {
        name: 'Trade License Application & Fee Challan',
        type: 'TAX',
        isMandatory: true,
        description: 'Filled municipal schedule form and online municipal fee payment acknowledgment.'
      },
      {
        name: 'Neighboring Occupant No Objection Certificate (NOC)',
        type: 'NOC',
        isMandatory: false,
        description: 'Required if operating noise, odor, or chemical sensitive trades adjacent to residential plots.'
      }
    ]
  }
];

/**
 * Fuzzy search helper to find the most relevant license for any user query.
 */
export function findLicenseByQuery(queryText) {
  if (!queryText || typeof queryText !== 'string') return null;
  const q = queryText.toLowerCase().trim();

  // 1. Direct ID match
  const directId = LICENSE_CATALOG.find((l) => l.id.toLowerCase() === q);
  if (directId) return directId;

  // 2. Exact keyword matches with word boundaries (avoids 'cto' matching inside 'factory')
  for (const lic of LICENSE_CATALOG) {
    for (const kw of lic.keywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|\\b)${escaped}(\\b|$)`, 'i');
      if (regex.test(q)) {
        return lic;
      }
    }
  }

  // 3. Name or act substring match
  for (const lic of LICENSE_CATALOG) {
    if (lic.name.toLowerCase().includes(q) || q.includes(lic.name.toLowerCase())) {
      return lic;
    }
  }

  // 4. Token overlap scoring
  const queryTokens = q.split(/\s+/).filter((t) => t.length > 2);
  let bestMatch = null;
  let highestScore = 0;

  for (const lic of LICENSE_CATALOG) {
    let score = 0;
    const searchable = `${lic.name} ${lic.category} ${lic.authority} ${lic.description} ${lic.keywords.join(' ')}`.toLowerCase();
    for (const token of queryTokens) {
      if (searchable.includes(token)) {
        score += 1;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = lic;
    }
  }

  return highestScore > 0 ? bestMatch : null;
}

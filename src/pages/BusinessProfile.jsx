import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Save,
  CheckCircle,
  Edit2,
} from 'lucide-react';
import DashboardShell from '../components/dashboard/DashboardShell';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import {
  isCleanMode,
  getUserBusinessProfile,
  saveUserBusinessProfile,
  DEMO_BUSINESS_PROFILE,
} from '../data/appModeState';

export default function BusinessProfile() {
  const { user, updateProfile } = useAuth();

  const cleanMode = isCleanMode();
  const currentProfile = cleanMode ? getUserBusinessProfile(user) : DEMO_BUSINESS_PROFILE;
  const isProfileEmpty = cleanMode && !currentProfile?.name;

  const [isEditing, setIsEditing] = useState(isProfileEmpty);
  const [businessName, setBusinessName] = useState(
    currentProfile?.name || user?.businessName || user?.name || ''
  );
  const [sector, setSector] = useState(
    currentProfile?.sector || user?.sector || user?.industrySector || ''
  );
  const [district, setDistrict] = useState(
    currentProfile?.location || user?.district || ''
  );
  const [entityType, setEntityType] = useState(
    currentProfile?.entityType || user?.entityType || (cleanMode ? '' : 'Private Limited Company')
  );
  const [pan, setPan] = useState(
    currentProfile?.pan || user?.pan || (cleanMode ? '' : 'ABCDE1234F')
  );
  const [gstin, setGstin] = useState(
    currentProfile?.gstin || user?.gstin || (cleanMode ? '' : '21ABCDE1234F1Z5')
  );
  const [udyam, setUdyam] = useState(
    currentProfile?.udyam || user?.udyam || (cleanMode ? '' : 'UDYAM-OD-2026-0091')
  );
  const [investment, setInvestment] = useState(
    currentProfile?.projectValue || (currentProfile?.investmentCr ? `₹${currentProfile.investmentCr} Cr` : (cleanMode ? '' : '₹10 Cr'))
  );
  const [employment, setEmployment] = useState(
    currentProfile?.employees ? `${currentProfile.employees} Personnel` : (cleanMode ? '' : '80 Personnel')
  );
  const [productionDate, setProductionDate] = useState(
    currentProfile?.productionDate || (cleanMode ? '' : 'Active')
  );
  const [address, setAddress] = useState(
    currentProfile?.address || user?.address || (cleanMode ? '' : 'Industrial Estate, Khordha, Odisha - 751024')
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    const invNum = parseFloat(investment.replace(/[^0-9.]/g, '')) || 0;
    const empNum = parseInt(employment.replace(/[^0-9]/g, ''), 10) || 0;
    const formattedInv = investment.trim().startsWith('₹')
      ? investment.trim()
      : investment.trim()
      ? `₹${investment.trim()}`
      : '₹0';

    const profilePayload = {
      name: businessName.trim(),
      project: sector.trim() ? `${sector.trim()} Plant` : 'Industrial Unit',
      sector: sector.trim(),
      category: sector.trim(),
      location: district.trim(),
      projectValue: formattedInv,
      investmentCr: invNum,
      employees: empNum,
      entityType: entityType.trim(),
      pan: pan.trim(),
      gstin: gstin.trim(),
      udyam: udyam.trim(),
      address: address.trim(),
      productionDate: productionDate.trim(),
      lastUpdated: 'Just now',
    };

    if (cleanMode) {
      saveUserBusinessProfile(profilePayload);
    }

    if (updateProfile) {
      await updateProfile({
        ...profilePayload,
        businessName: businessName.trim(),
        industrySector: sector.trim(),
        district: district.trim(),
        investmentRange: formattedInv,
        employmentEstimate: empNum,
      });
    }

    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262522]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#18324A]" />
            <span className="font-mono-data text-xs text-[#18324A] font-bold uppercase tracking-wider">
              ENTERPRISE STATUTORY DOSSIER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight uppercase">
            BUSINESS PROFILE
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6A61] font-sans mt-0.5">
            Single Window enterprise identity, registered factory premises, and statutory tax parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <Button variant="secondary" size="md" onClick={() => setIsEditing(false)}>
              CANCEL EDIT
            </Button>
          ) : (
            <Button variant="primary" size="md" icon={Edit2} onClick={() => setIsEditing(true)}>
              EDIT PROFILE
            </Button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-[#5D8068]/15 border border-[#5D8068] text-[#5D8068] rounded-[4px] text-xs font-mono-data flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Business profile details saved and synced across compliance modules.</span>
        </div>
      )}

      {/* Main Enterprise Identity Card */}
      <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_4px_16px_rgba(23,23,23,0.03)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#D6D0C3]">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-[4px] bg-[#18324A] text-white flex items-center justify-center font-bold text-lg shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {cleanMode ? (
                  <span className="font-mono-data text-[10px] font-bold text-[#5D8068] uppercase bg-[#5D8068]/15 px-2 py-0.5 rounded border border-[#5D8068]/30">
                    🟢 USER WORKSPACE PROFILE
                  </span>
                ) : (
                  <span className="font-mono-data text-[10px] font-bold text-[#8A6A14] uppercase bg-[#FAF6E9] px-2 py-0.5 rounded border border-[#C59B27]/40">
                    ⚡ DEMO PROFILE (OMM ENTERPRISES)
                  </span>
                )}
                <span className="font-mono-data text-xs text-[#6E6A61]">
                  ENT-2026-OD-00892
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight uppercase">
                {businessName || (cleanMode ? 'Unconfigured Enterprise' : 'Omm Enterprises')}
              </h2>
              <p className="text-xs text-[#6E6A61] font-sans mt-0.5">
                {(entityType || sector)
                  ? `${entityType || 'Enterprise'} • ${sector || 'Sector unconfigured'}`
                  : 'Click Edit Profile to define your industrial enterprise parameters'}
              </p>
            </div>
          </div>

          <div className="text-right font-mono-data text-xs space-y-1">
            <span className="text-[10px] text-[#6E6A61] uppercase block">DISTRICT ZONE</span>
            <span className="font-bold text-[#18324A] text-sm">{district} (Zone B)</span>
            <span className="text-[11px] text-[#5D8068] block">Eligible for 30% CIS Subsidy</span>
          </div>
        </div>

        {/* Edit or View Mode */}
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 font-mono-data text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6E6A61] mb-1">
                  Registered Enterprise Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full h-10 px-3 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-[#171717] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6E6A61] mb-1">
                  Industrial Sector
                </label>
                <input
                  type="text"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full h-10 px-3 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-[#171717] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6E6A61] mb-1">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  className="w-full h-10 px-3 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-[#171717] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6E6A61] mb-1">
                  GSTIN Number
                </label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full h-10 px-3 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-[#171717] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6E6A61] mb-1">
                  Udyam MSME Registration
                </label>
                <input
                  type="text"
                  value={udyam}
                  onChange={(e) => setUdyam(e.target.value)}
                  className="w-full h-10 px-3 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-[#171717] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6E6A61] mb-1">
                  District Classification
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Cuttack, Khordha, Sundargarh"
                  className="w-full h-10 px-3 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-[#171717] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6E6A61] mb-1">
                  Entity Constitution / Type
                </label>
                <input
                  type="text"
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  placeholder="e.g. Private Limited, Partnership, LLP"
                  className="w-full h-10 px-3 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-[#171717] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6E6A61] mb-1">
                  Capital Investment
                </label>
                <input
                  type="text"
                  value={investment}
                  onChange={(e) => setInvestment(e.target.value)}
                  placeholder="e.g. ₹5 Cr or ₹10 Cr"
                  className="w-full h-10 px-3 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-[#171717] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6E6A61] mb-1">
                  Direct Employment
                </label>
                <input
                  type="text"
                  value={employment}
                  onChange={(e) => setEmployment(e.target.value)}
                  placeholder="e.g. 35 Personnel"
                  className="w-full h-10 px-3 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-[#171717] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6E6A61] mb-1">
                  Commercial Production Date
                </label>
                <input
                  type="text"
                  value={productionDate}
                  onChange={(e) => setProductionDate(e.target.value)}
                  placeholder="e.g. Active or Expected Date"
                  className="w-full h-10 px-3 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-[#171717] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#6E6A61] mb-1">
                Factory & Plant Physical Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-[#171717] focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <Button variant="primary" size="md" icon={Save} type="submit">
                SAVE & UPDATE PROFILE
              </Button>
            </div>
          </form>
        ) : (
          /* View Mode */
          <div className="space-y-4 font-mono-data text-xs">
            {/* Legal & Tax Identifiers */}
            <div>
              <span className="text-[10px] font-bold text-[#18324A] uppercase tracking-wider block mb-2">
                STATUTORY & LEGAL IDENTIFIERS
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px]">
                  <span className="text-[10px] text-[#6E6A61] uppercase block">PAN NUMBER</span>
                  <span className="font-bold text-[#171717] text-sm">{pan || '—'}</span>
                </div>
                <div className="p-3 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px]">
                  <span className="text-[10px] text-[#6E6A61] uppercase block">GSTIN</span>
                  <span className="font-bold text-[#171717] text-sm">{gstin || '—'}</span>
                </div>
                <div className="p-3 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px]">
                  <span className="text-[10px] text-[#6E6A61] uppercase block">UDYAM MSME</span>
                  <span className="font-bold text-[#18324A] text-sm">{udyam || '—'}</span>
                </div>
                <div className="p-3 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px]">
                  <span className="text-[10px] text-[#6E6A61] uppercase block">DIC REGISTRATION</span>
                  <span className="font-bold text-[#171717] text-sm">{cleanMode ? (currentProfile?.dicRegistration || '—') : 'DIC/SUN/2022/9081'}</span>
                </div>
              </div>
            </div>

            {/* Factory Operational Parameters */}
            <div>
              <span className="text-[10px] font-bold text-[#18324A] uppercase tracking-wider block mb-2">
                OPERATIONAL SPECIFICATIONS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px]">
                  <span className="text-[10px] text-[#6E6A61] uppercase block">TOTAL CAPITAL INVESTMENT</span>
                  <span className="font-bold text-[#171717] text-sm">{investment || '₹0'}</span>
                </div>
                <div className="p-3 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px]">
                  <span className="text-[10px] text-[#6E6A61] uppercase block">DIRECT EMPLOYMENT</span>
                  <span className="font-bold text-[#171717] text-sm">{employment || '0 Personnel'}</span>
                </div>
                <div className="p-3 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px]">
                  <span className="text-[10px] text-[#6E6A61] uppercase block">COMMERCIAL PRODUCTION DATE</span>
                  <span className="font-bold text-[#171717] text-sm">{productionDate || '—'}</span>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="p-3 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px] flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#18324A] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-[#6E6A61] uppercase font-bold block">REGISTERED FACTORY PREMISES</span>
                <span className="font-sans text-xs text-[#171717]">{address || 'Premises details not yet submitted.'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Sparkles, Building2, ShieldCheck, FileText } from 'lucide-react';
import Button from '../ui/Button';

export default function BusinessProfileWizard({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: 'Utkal Agro-Tech Ltd.',
    businessType: 'Private Limited Company',
    sector: 'Agro-Processing & Food Manufacturing',
    state: 'Odisha',
    district: 'Khurda',
    industrialArea: 'Choudwar Industrial Complex (IDCO)',
    projectScale: 'Medium Enterprise',
    investment: '₹ 18.50 Crores',
    employees: '65 Personnel',
    landArea: '4.5 Acres (Industrial Non-Agri)',
    operationsType: 'Manufacturing & Cold Storage',
    productionCapacity: '120 MT / Day Processing',
    envCategory: 'Orange Category (Non-toxic effluent)',
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else {
      onComplete && onComplete(formData);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#171717]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] w-full max-w-4xl shadow-[0_12px_40px_rgba(23,23,23,0.12)] overflow-hidden">
        {/* Wizard Header Bar */}
        <div className="p-4 sm:p-6 bg-[#FAF8F2] border-b border-[#262522] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono-data text-xs font-bold text-[#18324A] bg-[#E9E1D0] px-2 py-0.5 rounded-[2px]">
                ONBOARDING PROTOCOL
              </span>
              <span className="meta-label text-[#6E6A61]">FORM NS-REG-01</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717]">
              Build Your Business Profile
            </h2>
            <p className="text-xs text-[#6E6A61] mt-0.5">
              Tell us about your business so our regulatory engine can identify the exact statutory approvals that apply to you.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#171717] hover:bg-[#E9E1D0] rounded-[3px] border border-transparent hover:border-[#262522] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-Step Progress Indicators */}
        <div className="grid grid-cols-5 border-b border-[#262522] bg-[#E9E1D0] divide-x divide-[#262522] text-[11px] font-mono-data">
          {[
            { id: 1, label: '01 BUSINESS' },
            { id: 2, label: '02 LOCATION' },
            { id: 3, label: '03 PROJECT' },
            { id: 4, label: '04 OPERATIONS' },
            { id: 5, label: '05 REVIEW' },
          ].map((s) => (
            <div
              key={s.id}
              className={`p-2.5 text-center transition-colors ${
                step === s.id
                  ? 'bg-[#18324A] text-[#FAF8F2] font-bold'
                  : step > s.id
                  ? 'bg-[#FAF8F2] text-[#5D8068] font-semibold'
                  : 'text-[#6E6A61]'
              }`}
            >
              {s.label} {step > s.id && '✓'}
            </div>
          ))}
        </div>

        {/* Wizard Form Workspace */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto">
          {/* STEP 1: BUSINESS DETAILS */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-[#D6D0C3] pb-3 mb-4">
                <span className="font-mono-data text-xs text-[#18324A] font-bold">SECTION 01</span>
                <h3 className="text-lg font-bold text-[#171717]">Entity Classification & Identification</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-data font-semibold text-[#30302D] mb-1 uppercase">
                    Legal Business / Enterprise Name:
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full text-xs p-2.5 bg-[#FFFFFF] border border-[#262522] rounded-[3px] font-sans focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-data font-semibold text-[#30302D] mb-1 uppercase">
                    Entity Legal Structure:
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full text-xs p-2.5 bg-[#FFFFFF] border border-[#262522] rounded-[3px] font-sans focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                  >
                    <option value="Private Limited Company">Private Limited Company</option>
                    <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                    <option value="Public Limited Company">Public Limited Company</option>
                    <option value="Sole Proprietorship">Sole Proprietorship / Partnership</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono-data font-semibold text-[#30302D] mb-1 uppercase">
                    Primary Industry & Activity Sector:
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full text-xs p-2.5 bg-[#FFFFFF] border border-[#262522] rounded-[3px] font-sans focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                  >
                    <option value="Agro-Processing & Food Manufacturing">Agro-Processing & Food Manufacturing</option>
                    <option value="Precision Engineering & Metal Fabrication">Precision Engineering & Metal Fabrication</option>
                    <option value="Chemicals, Petrochemicals & Polymers">Chemicals, Petrochemicals & Polymers</option>
                    <option value="Electronics & Assembly (White Category)">Electronics & Assembly (White Category)</option>
                    <option value="Textiles, Apparels & Leather Products">Textiles, Apparels & Leather Products</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-[#D6D0C3] pb-3 mb-4">
                <span className="font-mono-data text-xs text-[#18324A] font-bold">SECTION 02</span>
                <h3 className="text-lg font-bold text-[#171717]">Geographic & Industrial Location</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-data font-semibold text-[#30302D] mb-1 uppercase">
                    State Jurisdiction:
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formData.state}
                    className="w-full text-xs p-2.5 bg-[#E9E1D0] border border-[#262522] rounded-[3px] font-sans font-semibold text-[#18324A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-data font-semibold text-[#30302D] mb-1 uppercase">
                    Revenue District:
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full text-xs p-2.5 bg-[#FFFFFF] border border-[#262522] rounded-[3px] font-sans focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                  >
                    <option value="Khurda">Khurda (Bhubaneswar Industrial Zone)</option>
                    <option value="Cuttack">Cuttack (Choudwar Cluster)</option>
                    <option value="Jagatsinghpur">Jagatsinghpur (Paradip Port Node)</option>
                    <option value="Jajpur">Jajpur (Kalinganagar Steel Complex)</option>
                    <option value="Jharsuguda">Jharsuguda (Aluminium / Energy Corridor)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono-data font-semibold text-[#30302D] mb-1 uppercase">
                    Designated Industrial Area / Land Status:
                  </label>
                  <input
                    type="text"
                    value={formData.industrialArea}
                    onChange={(e) => setFormData({ ...formData, industrialArea: e.target.value })}
                    className="w-full text-xs p-2.5 bg-[#FFFFFF] border border-[#262522] rounded-[3px] font-sans focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PROJECT DETAILS */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-b border-[#D6D0C3] pb-3 mb-4">
                <span className="font-mono-data text-xs text-[#18324A] font-bold">SECTION 03</span>
                <h3 className="text-lg font-bold text-[#171717]">Capital Investment & Scale</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-data font-semibold text-[#30302D] mb-1 uppercase">
                    Total Capital Investment:
                  </label>
                  <input
                    type="text"
                    value={formData.investment}
                    onChange={(e) => setFormData({ ...formData, investment: e.target.value })}
                    className="w-full text-xs p-2.5 bg-[#FFFFFF] border border-[#262522] rounded-[3px] font-sans focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-data font-semibold text-[#30302D] mb-1 uppercase">
                    MSME Statutory Classification:
                  </label>
                  <select
                    value={formData.projectScale}
                    onChange={(e) => setFormData({ ...formData, projectScale: e.target.value })}
                    className="w-full text-xs p-2.5 bg-[#FFFFFF] border border-[#262522] rounded-[3px] font-sans focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                  >
                    <option value="Micro Enterprise">Micro Enterprise (&lt; ₹1 Cr)</option>
                    <option value="Small Enterprise">Small Enterprise (₹1–10 Cr)</option>
                    <option value="Medium Enterprise">Medium Enterprise (₹10–50 Cr)</option>
                    <option value="Large Scale Enterprise">Large Scale Enterprise (&gt; ₹50 Cr)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-data font-semibold text-[#30302D] mb-1 uppercase">
                    Proposed Manpower / Employees:
                  </label>
                  <input
                    type="text"
                    value={formData.employees}
                    onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                    className="w-full text-xs p-2.5 bg-[#FFFFFF] border border-[#262522] rounded-[3px] font-sans focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-data font-semibold text-[#30302D] mb-1 uppercase">
                    Plot Area Required:
                  </label>
                  <input
                    type="text"
                    value={formData.landArea}
                    onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
                    className="w-full text-xs p-2.5 bg-[#FFFFFF] border border-[#262522] rounded-[3px] font-sans focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: OPERATIONS & ENVIRONMENT */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border-b border-[#D6D0C3] pb-3 mb-4">
                <span className="font-mono-data text-xs text-[#18324A] font-bold">SECTION 04</span>
                <h3 className="text-lg font-bold text-[#171717]">Operational Scope & Environmental Tier</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-data font-semibold text-[#30302D] mb-1 uppercase">
                    Nature of Operations:
                  </label>
                  <input
                    type="text"
                    value={formData.operationsType}
                    onChange={(e) => setFormData({ ...formData, operationsType: e.target.value })}
                    className="w-full text-xs p-2.5 bg-[#FFFFFF] border border-[#262522] rounded-[3px] font-sans focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-data font-semibold text-[#30302D] mb-1 uppercase">
                    CPCB / SPCB Environmental Pollution Tier:
                  </label>
                  <select
                    value={formData.envCategory}
                    onChange={(e) => setFormData({ ...formData, envCategory: e.target.value })}
                    className="w-full text-xs p-2.5 bg-[#FFFFFF] border border-[#262522] rounded-[3px] font-sans focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                  >
                    <option value="White Category (Non-polluting / Excluded from CTE)">White Category (Zero Pollution / Excluded)</option>
                    <option value="Green Category (Low Pollution Index 21–40)">Green Category (Low Pollution Index 21–40)</option>
                    <option value="Orange Category (Medium Pollution Index 41–59)">Orange Category (Medium Pollution Index 41–59)</option>
                    <option value="Red Category (High Pollution Index 60+)">Red Category (High Pollution Index 60+)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono-data font-semibold text-[#30302D] mb-1 uppercase">
                    Installed Daily Production Capacity:
                  </label>
                  <input
                    type="text"
                    value={formData.productionCapacity}
                    onChange={(e) => setFormData({ ...formData, productionCapacity: e.target.value })}
                    className="w-full text-xs p-2.5 bg-[#FFFFFF] border border-[#262522] rounded-[3px] font-sans focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="border-b border-[#D6D0C3] pb-3 mb-4">
                <span className="font-mono-data text-xs text-[#18324A] font-bold">SECTION 05</span>
                <h3 className="text-lg font-bold text-[#171717]">Review & Generate Regulatory Roadmap</h3>
                <p className="text-xs text-[#6E6A61] mt-0.5">
                  Confirm the entered parameters below. Our regulatory engine will synthesize all applicable central, state, and municipal clearances.
                </p>
              </div>

              <div className="border border-[#262522] rounded-[3px] bg-[#FFFFFF] divide-y divide-[#D6D0C3] text-xs">
                <div className="p-3 grid grid-cols-3 bg-[#FAF8F2]">
                  <span className="text-[#6E6A61] font-mono-data uppercase">Enterprise Name:</span>
                  <span className="col-span-2 font-bold text-[#171717]">{formData.businessName}</span>
                </div>
                <div className="p-3 grid grid-cols-3">
                  <span className="text-[#6E6A61] font-mono-data uppercase">Legal Structure:</span>
                  <span className="col-span-2 text-[#30302D]">{formData.businessType}</span>
                </div>
                <div className="p-3 grid grid-cols-3 bg-[#FAF8F2]">
                  <span className="text-[#6E6A61] font-mono-data uppercase">Industry Sector:</span>
                  <span className="col-span-2 font-semibold text-[#18324A]">{formData.sector}</span>
                </div>
                <div className="p-3 grid grid-cols-3">
                  <span className="text-[#6E6A61] font-mono-data uppercase">Cluster / Location:</span>
                  <span className="col-span-2 text-[#30302D]">{formData.industrialArea}, {formData.district}, {formData.state}</span>
                </div>
                <div className="p-3 grid grid-cols-3 bg-[#FAF8F2]">
                  <span className="text-[#6E6A61] font-mono-data uppercase">Capital Scale:</span>
                  <span className="col-span-2 text-[#30302D]">{formData.investment} ({formData.projectScale})</span>
                </div>
                <div className="p-3 grid grid-cols-3">
                  <span className="text-[#6E6A61] font-mono-data uppercase">Environmental Tier:</span>
                  <span className="col-span-2 font-semibold text-[#C08A3E]">{formData.envCategory}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="p-4 sm:p-6 bg-[#FAF8F2] border-t border-[#262522] flex items-center justify-between">
          <Button
            variant="secondary"
            size="md"
            onClick={handlePrev}
            disabled={step === 1}
            icon={ArrowLeft}
            className={step === 1 ? 'opacity-40 cursor-not-allowed' : ''}
          >
            Previous
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleNext}
            icon={step === 5 ? ShieldCheck : ArrowRight}
            iconPosition="right"
          >
            {step === 5 ? 'Synthesize Approval Matrix' : 'Continue to Next Section'}
          </Button>
        </div>
      </div>
    </div>
  );
}

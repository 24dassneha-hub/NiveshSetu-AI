import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Button from '../ui/Button';
import useScrollReveal from '../../hooks/useScrollReveal';

export default function FinalCTA({ onStartRoadmap }) {
  const sectionRef = useScrollReveal();
  const [sector, setSector] = useState('food_processing');
  const [scale, setScale] = useState('medium');
  const [district, setDistrict] = useState('khurda');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onStartRoadmap) {
      onStartRoadmap({ sector, scale, district });
    }
  };

  return (
    <section id="final-cta" ref={sectionRef} className="scroll-mt-section bg-[#F3EFE5] border-b border-[#262522]">
      <div className="max-w-7xl mx-auto border-x border-[#262522]">
        <div className="p-4 sm:p-10 lg:p-16 bg-[#E9E1D0]">
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-6 sm:p-10 lg:p-12 shadow-[0_12px_40px_rgba(23,23,23,0.06)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Editorial Headline & Narrative */}
              <div className="reveal-init lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#E9E1D0] border border-[#D6D0C3] rounded-[3px] mb-4">
                  <span className="w-1.5 h-1.5 bg-[#18324A] rounded-full"></span>
                  <span className="meta-label text-[#18324A] text-[10px]">
                    SYSTEM DEPLOYMENT
                  </span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#171717] leading-[1.1] mb-4">
                  Start with your business.
                  <br />
                  <span className="text-[#30302D]">We'll map what comes next.</span>
                </h2>

                <p className="text-sm sm:text-base text-[#6E6A61] leading-relaxed max-w-lg">
                  Instant clearance roadmap tailored to your sector, investment scale, and industrial cluster.
                </p>
              </div>

              {/* Right Column: Quick Profile Configuration Card */}
              <div className="reveal-init lg:col-span-5 bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-5 sm:p-6">
                <div className="pb-3 mb-4 border-b border-[#D6D0C3]">
                  <span className="meta-label">INSTANT CLEARANCE ESTIMATOR</span>
                  <h3 className="text-base font-bold text-[#171717] mt-0.5">
                    Configure Your Unit Profile
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label htmlFor="sector-select" className="block text-[11px] font-mono-data font-semibold text-[#30302D] mb-1 uppercase">
                      Industrial Sector:
                    </label>
                    <select
                      id="sector-select"
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full text-xs font-sans p-2.5 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-[#171717] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#18324A]"
                    >
                      <option value="food_processing">Agro-Processing & Food Manufacturing</option>
                      <option value="engineering">Fabrication & Precision Engineering</option>
                      <option value="chemicals">Fine Chemicals & Pharmaceuticals (Red Tier)</option>
                      <option value="renewable">Solar Module & Battery Assembly (White Tier)</option>
                      <option value="textiles">Textiles & Garment Manufacturing (Green Tier)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="scale-select" className="block text-[11px] font-mono-data font-semibold text-[#30302D] mb-1 uppercase">
                        Investment Scale:
                      </label>
                      <select
                        id="scale-select"
                        value={scale}
                        onChange={(e) => setScale(e.target.value)}
                        className="w-full text-xs font-sans p-2 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-[#171717] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#18324A]"
                      >
                        <option value="micro">Micro (&lt; ₹1 Cr)</option>
                        <option value="small">Small (₹1–10 Cr)</option>
                        <option value="medium">Medium (₹10–50 Cr)</option>
                        <option value="large">Large (&gt; ₹50 Cr)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="district-select" className="block text-[11px] font-mono-data font-semibold text-[#30302D] mb-1 uppercase">
                        Industrial Cluster:
                      </label>
                      <select
                        id="district-select"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full text-xs font-sans p-2 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-[#171717] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#18324A]"
                      >
                        <option value="khurda">Khurda / IDCO Complex</option>
                        <option value="cuttack">Choudwar Industrial Park</option>
                        <option value="paradip">Paradip Petrochemical Hub</option>
                        <option value="jharsuguda">Jharsuguda Metal Cluster</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full justify-center min-h-[44px] btn-editorial-hover"
                      icon={ArrowUpRight}
                      iconPosition="right"
                    >
                      Generate My Approval Roadmap
                    </Button>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] font-mono-data text-[#6E6A61]">
                      Instant generation • No login required for preview
                    </span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



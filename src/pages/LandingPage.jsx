import React, { useState } from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import ProblemSection from '../components/landing/ProblemSection';
import HowItWorks from '../components/landing/HowItWorks';
import ApprovalRoadmapPreview from '../components/landing/ApprovalRoadmapPreview';
import DocumentIntelligence from '../components/landing/DocumentIntelligence';
import DepartmentWorkflow from '../components/landing/DepartmentWorkflow';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';
import BusinessProfileWizard from '../components/wizard/BusinessProfileWizard';
import ApprovalChecklistModal from '../components/wizard/ApprovalChecklistModal';
import GraceChatAssistant from '../components/dashboard/GraceChatAssistant';

export default function LandingPage() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const handleOpenWizard = () => {
    setIsWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
  };

  const handleWizardComplete = (data) => {
    setProfileData(data);
    setIsWizardOpen(false);
    setIsChecklistOpen(true);
  };

  const handleCloseChecklist = () => {
    setIsChecklistOpen(false);
  };

  const handleExplorePlatform = () => {
    const el = document.getElementById('roadmap');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F3EFE5] text-[#171717] flex flex-col font-sans selection:bg-[#18324A] selection:text-[#FAF8F2]">
      {/* Sticky Editorial Navbar */}
      <Navbar
        onNavigateToApp={() => handleOpenWizard()}
      />

      {/* Main Landing Page Content */}
      <main className="flex-1">
        {/* Editorial Hero with Miniature Dashboard Visual */}
        <Hero
          onBuildRoadmap={handleOpenWizard}
          onExplorePlatform={handleExplorePlatform}
        />

        {/* Section 01: The Problem */}
        <ProblemSection />

        {/* Section 02: How It Works */}
        <HowItWorks />

        {/* Section 03: The Signature Approval Roadmap */}
        <ApprovalRoadmapPreview onBuildRoadmap={handleOpenWizard} />

        {/* Section 04: Document Intelligence & Pre-Validation */}
        <DocumentIntelligence onTryValidation={handleOpenWizard} />

        {/* Section 05: Multi-Department Workflow & Scrutiny */}
        <DepartmentWorkflow onExploreRoadmap={handleExplorePlatform} />

        {/* Section 06: Final Call to Action */}
        <FinalCTA
          onStartRoadmap={(data) => {
            setProfileData(data);
            setIsChecklistOpen(true);
          }}
        />
      </main>

      {/* Editorial Footer with Statutory Disclaimers */}
      <Footer />

      {/* Interactive Business Profile Wizard Modal */}
      <BusinessProfileWizard
        isOpen={isWizardOpen}
        onClose={handleCloseWizard}
        onComplete={handleWizardComplete}
      />

      {/* AI Approval Checklist Modal */}
      <ApprovalChecklistModal
        isOpen={isChecklistOpen}
        onClose={handleCloseChecklist}
        profileData={profileData}
      />

      {/* Floating Grace AI Assistant */}
      <GraceChatAssistant />
    </div>
  );
}

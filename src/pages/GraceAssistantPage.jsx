import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  FilePlus,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Search,
  Building2,
  FileText,
  Clock,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import DashboardShell from '../components/dashboard/DashboardShell';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from '../router';
import { askSneha } from '../lib/graceAiService';
import { LICENSE_CATALOG } from '../data/licenseRequirementsData';
import { createDocumentSlotsForLicense, getDocuments } from '../data/documentsStorage';

export default function GraceAssistantPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'sneha',
      timestamp: new Date(),
      text: `Hello! I am **Sneha**, your AI Compliance & Licensing Guide on NiveshSetu. 🏛️\n\nAsk me about any clearance, license, or certificate. I will provide the statutory governing Acts, SLA timelines, mandatory supporting documents, and generate the required upload slots directly in your Document Vault!`,
      matchedLicense: null,
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdLicenseIds, setCreatedLicenseIds] = useState({});
  const [selectedCatalogLicense, setSelectedCatalogLicense] = useState(LICENSE_CATALOG[0]);
  const [catalogSearch, setCatalogSearch] = useState('');

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend = null) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim() || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date(),
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await askSneha(userMsg.text, messages);
      setMessages((prev) => [
        ...prev,
        {
          id: `sneha-${Date.now()}`,
          sender: 'sneha',
          timestamp: new Date(),
          text: response.reply,
          matchedLicense: response.matchedLicense,
          source: response.source,
        },
      ]);
    } catch (err) {
      console.error('Sneha page error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `sneha-${Date.now()}`,
          sender: 'sneha',
          timestamp: new Date(),
          text: 'I encountered an error querying the statutory engine. Please try again.',
          matchedLicense: null,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSlots = (license) => {
    if (!license) return;
    const result = createDocumentSlotsForLicense(license, user);
    setCreatedLicenseIds((prev) => ({
      ...prev,
      [license.id]: result,
    }));

    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: 'sneha',
        timestamp: new Date(),
        text: `✅ **${result.created.length} Document Slots Created in Vault** for **${license.name}**!\n\nYou can view and manage these slots on the Documents page.`,
        matchedLicense: null,
        isActionConfirm: true,
      },
    ]);
  };

  const filteredCatalog = LICENSE_CATALOG.filter((lic) => {
    const q = catalogSearch.toLowerCase();
    return (
      lic.name.toLowerCase().includes(q) ||
      lic.category.toLowerCase().includes(q) ||
      lic.authority.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardShell>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262522]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#5D8068] animate-pulse" />
            <span className="font-mono-data text-xs text-[#18324A] font-bold uppercase tracking-wider">
              AI COMPLIANCE & STATUTORY DOSSIER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight uppercase">
            SNEHA AI ASSISTANT
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6A61] font-sans mt-0.5">
            Single Window statutory legal assistant, clearance prerequisites checklist, and automated document slot generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={() =>
              setMessages([
                {
                  id: 'welcome',
                  sender: 'sneha',
                  timestamp: new Date(),
                  text: 'Chat reset. How can I assist with your business clearances today?',
                  matchedLicense: null,
                },
              ])
            }
          >
            RESET CONVERSATION
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={ArrowRight}
            onClick={() => navigate('/documents')}
          >
            VIEW DOCUMENT VAULT
          </Button>
        </div>
      </div>

      {/* Main Grid: Chat Workspace (7 cols) + License Directory & Slot Generator (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Chat Session Window */}
        <div className="lg:col-span-7 bg-[#FAF8F2] border-2 border-[#262522] rounded-[4px] shadow-[0_4px_20px_rgba(23,23,23,0.03)] flex flex-col h-[700px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-3.5 bg-[#18324A] text-[#FAF8F2] border-b border-[#262522] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#C08A3E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white block">
                  Sneha • Compliance Intelligence
                </span>
                <span className="text-[10px] font-mono-data text-[#D6D0C3]">
                  Connected to Google Gemini & Odisha Single Window Acts
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono-data bg-[#5D8068] text-white px-2 py-0.5 rounded font-bold">
              READY
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F3EFE5]/40">
            {messages.map((msg) => {
              const isSneha = msg.sender === 'grace' || msg.sender === 'sneha';
              const slotsStatus = msg.matchedLicense
                ? createdLicenseIds[msg.matchedLicense.id]
                : null;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isSneha ? 'items-start' : 'items-end'}`}
                >
                  <div className="text-[10px] font-mono-data text-[#6E6A61] mb-1 px-1">
                    {isSneha ? 'Sneha AI Assistant' : 'You'}
                  </div>

                  <div
                    className={`max-w-[90%] rounded-[4px] p-4 text-xs sm:text-[13px] leading-relaxed ${
                      isSneha
                        ? 'bg-white border border-[#262522]/20 text-[#171717] shadow-2xs'
                        : 'bg-[#18324A] text-white shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line space-y-2">{msg.text}</div>

                    {/* Matched License Card with Slot Creation Button */}
                    {msg.matchedLicense && (
                      <div className="mt-3 pt-3 border-t border-[#D6D0C3] bg-[#FAF8F2] p-3 rounded-[3px] border border-[#262522]/15">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono-data uppercase font-bold text-[#18324A] bg-[#18324A]/10 px-1.5 py-0.5 rounded">
                            {msg.matchedLicense.category}
                          </span>
                          <span className="text-[10px] font-mono-data text-[#6E6A61] bg-white px-2 py-0.5 rounded border border-[#D6D0C3]">
                            ⏱️ {msg.matchedLicense.slaDays} Days SLA
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-[#171717] mb-2">
                          {msg.matchedLicense.name}
                        </h4>

                        {/* Slot Action */}
                        {slotsStatus ? (
                          <div className="bg-[#5D8068]/15 border border-[#5D8068] p-2 rounded flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-[#5D8068] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {slotsStatus.created.length} Slots Created in Vault
                            </span>
                            <button
                              onClick={() => navigate('/documents')}
                              className="text-[10px] font-bold text-[#18324A] hover:underline flex items-center gap-1 bg-white px-2 py-1 rounded border border-[#5D8068]"
                            >
                              Open Vault
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCreateSlots(msg.matchedLicense)}
                            className="w-full flex items-center justify-center gap-1.5 bg-[#18324A] hover:bg-[#1f3f5c] text-white text-xs font-semibold py-2 px-3 rounded-[3px] border border-[#262522] transition-colors cursor-pointer"
                          >
                            <FilePlus className="w-3.5 h-3.5 text-[#C08A3E]" />
                            <span>Create Required Document Slots in Vault</span>
                          </button>
                        )}
                      </div>
                    )}

                    {msg.isActionConfirm && (
                      <div className="mt-2 pt-2 border-t border-[#D6D0C3] flex justify-end">
                        <button
                          onClick={() => navigate('/documents')}
                          className="text-[11px] font-bold text-[#18324A] hover:text-[#C08A3E] flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open Document Vault</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-[#6E6A61] text-xs px-2 py-1">
                <span className="w-2 h-2 rounded-full bg-[#18324A] animate-ping" />
                <span className="font-mono-data text-[11px]">Sneha is reviewing statutory acts...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Questions Bar */}
          <div className="p-2.5 bg-[#FAF8F2] border-t border-[#D6D0C3] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {[
              '🚒 Fire NOC documents',
              '🍲 FSSAI Food License',
              '🏭 Factory Operating License',
              '🌿 Pollution CTE/CTO',
              '⚖️ Deemed Approval Rules',
            ].map((prompt, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap text-[11px] px-2.5 py-1 rounded bg-[#E9E1D0] hover:bg-[#D6D0C3] text-[#18324A] font-medium border border-[#262522]/15 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-[#262522] flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about any license or clearance required documents..."
              className="flex-1 bg-[#FAF8F2] border border-[#262522]/30 rounded-[4px] px-3.5 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#18324A]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-[#18324A] hover:bg-[#1f3f5c] disabled:bg-[#8B8982] text-white p-2.5 rounded-[4px] border border-[#262522] transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right: Statutory Clearance Directory & Instant Slot Creator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#FAF8F2] border-2 border-[#262522] rounded-[4px] p-5 shadow-[0_4px_20px_rgba(23,23,23,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#262522]">
              <div>
                <h3 className="font-bold text-sm text-[#171717] uppercase tracking-wide">
                  Statutory Clearances Directory
                </h3>
                <p className="text-[11px] text-[#6E6A61] font-mono-data">
                  Select any clearance to inspect documents & create vault slots
                </p>
              </div>
              <BookOpen className="w-4 h-4 text-[#18324A]" />
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8B8982]" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Search clearances by name or authority..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#262522]/20 rounded-[3px] text-xs focus:outline-none focus:border-[#18324A]"
              />
            </div>

            {/* License Scroll List */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-[#D6D0C3]/40">
              {filteredCatalog.map((lic) => {
                const isSelected = selectedCatalogLicense?.id === lic.id;
                return (
                  <div
                    key={lic.id}
                    onClick={() => setSelectedCatalogLicense(lic)}
                    className={`p-2.5 rounded-[3px] cursor-pointer transition-colors pt-2 ${
                      isSelected
                        ? 'bg-[#18324A] text-white font-medium'
                        : 'hover:bg-[#E9E1D0] text-[#171717]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px] font-mono-data mb-0.5">
                      <span className={isSelected ? 'text-[#C08A3E]' : 'text-[#6E6A61]'}>
                        {lic.category}
                      </span>
                      <span className={isSelected ? 'text-white/80' : 'text-[#8B8982]'}>
                        ⏱️ {lic.slaDays}d
                      </span>
                    </div>
                    <div className="text-xs font-semibold leading-tight">{lic.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected License Detail & 1-Click Vault Slot Creator */}
          {selectedCatalogLicense && (
            <div className="bg-[#FAF8F2] border-2 border-[#18324A] rounded-[4px] p-5 shadow-[0_4px_20px_rgba(24,50,74,0.06)] space-y-3">
              <div className="flex items-center justify-between border-b border-[#262522]/20 pb-2">
                <span className="text-[10px] font-mono-data uppercase font-bold text-[#18324A] bg-[#18324A]/10 px-2 py-0.5 rounded">
                  {selectedCatalogLicense.category}
                </span>
                <span className="text-[11px] font-mono-data text-[#5D8068] font-bold">
                  SLA: {selectedCatalogLicense.slaDays} Working Days
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-[#171717]">{selectedCatalogLicense.name}</h3>
                <p className="text-[11px] text-[#6E6A61] mt-0.5">
                  Authority: {selectedCatalogLicense.authority} ({selectedCatalogLicense.department})
                </p>
                <p className="text-[10.5px] font-mono-data text-[#8B8982] mt-0.5">
                  Act: {selectedCatalogLicense.acts}
                </p>
              </div>

              {/* Required Documents Checklist */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-[#18324A] uppercase tracking-wider font-mono-data">
                  Required Documents Checklist ({selectedCatalogLicense.requiredDocuments.length})
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedCatalogLicense.requiredDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-[#262522]/15 p-2 rounded-[3px] text-xs flex items-start gap-2"
                    >
                      <span className="font-mono-data text-[10px] font-bold text-[#18324A] mt-0.5">
                        {idx + 1}.
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-[#171717] leading-tight">
                          {doc.name}{' '}
                          {doc.isMandatory && (
                            <span className="text-[9px] text-[#B85C4A] font-bold">
                              (Mandatory)
                            </span>
                          )}
                        </div>
                        <div className="text-[10.5px] text-[#6E6A61] mt-0.5 line-clamp-2">
                          {doc.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button: Create slots */}
              <div className="pt-2">
                {createdLicenseIds[selectedCatalogLicense.id] ? (
                  <div className="bg-[#5D8068]/15 border border-[#5D8068] p-2.5 rounded flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#5D8068] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      {createdLicenseIds[selectedCatalogLicense.id].created.length} Vault Slots Created!
                    </span>
                    <button
                      onClick={() => navigate('/documents')}
                      className="text-xs font-bold text-[#18324A] hover:underline flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-[#5D8068]"
                    >
                      Open Vault
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full justify-center"
                    icon={FilePlus}
                    onClick={() => handleCreateSlots(selectedCatalogLicense)}
                  >
                    GENERATE ALL DOCUMENT SLOTS IN VAULT
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

export const SnehaAssistantPage = GraceAssistantPage;

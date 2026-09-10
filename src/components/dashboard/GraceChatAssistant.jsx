import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Minimize2,
  Maximize2,
  FilePlus,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Bot,
} from 'lucide-react';
import { useNavigate } from '../../router';
import { useAuth } from '../../context/AuthContext';
import { askSneha } from '../../lib/graceAiService';
import { createDocumentSlotsForLicense } from '../../data/documentsStorage';

const QUICK_PROMPTS = [
  { label: '🚒 Fire NOC Documents', query: 'What documents are required for Fire NOC?' },
  { label: '🍲 FSSAI Food License', query: 'What documents do I need for FSSAI Food License?' },
  { label: '🏭 Factory License', query: 'Requirements for Factory Operating License' },
  { label: '🌿 Pollution CTE/CTO', query: 'Documents for Consent to Establish (CTE) pollution board' },
  { label: '📑 GST Registration', query: 'What are the required documents for GST registration?' },
  { label: '⚖️ Deemed Approval', query: 'How does deemed approval work under Odisha Single Window?' },
];

export default function GraceChatAssistant() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Track created slots per license ID to show visual feedback
  const [createdSlotLicenseIds, setCreatedSlotLicenseIds] = useState({});

  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      sender: 'sneha',
      timestamp: new Date(),
      text: `Hello! I am **Sneha**, your AI Compliance & Licensing Guide for NiveshSetu. 🏛️\n\nAsk me about any statutory clearance, license, or certificate—I'll provide the exact list of mandatory documents and can automatically set up upload slots in your **Document Vault**!`,
      matchedLicense: null,
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  // Handle sending a message
  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputValue;
    if (!textToSend || !textToSend.trim() || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date(),
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await askSneha(userMsg.text, messages);
      const snehaReply = {
        id: `sneha-${Date.now()}`,
        sender: 'sneha',
        timestamp: new Date(),
        text: response.reply,
        matchedLicense: response.matchedLicense,
        source: response.source,
      };
      setMessages((prev) => [...prev, snehaReply]);
    } catch (err) {
      console.error('Error in askSneha:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `sneha-err-${Date.now()}`,
          sender: 'sneha',
          timestamp: new Date(),
          text: 'I apologize, but I encountered a temporary connection issue. Please try again or rephrase your question.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessageRef = useRef(handleSendMessage);
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  });

  // Listen for programmatic open / query triggers across the app
  useEffect(() => {
    const handleOpenSneha = (e) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (e.detail && e.detail.query) {
        handleSendMessageRef.current(e.detail.query);
      }
    };
    window.addEventListener('openSnehaChat', handleOpenSneha);
    window.addEventListener('openGraceChat', handleOpenSneha);
    return () => {
      window.removeEventListener('openSnehaChat', handleOpenSneha);
      window.removeEventListener('openGraceChat', handleOpenSneha);
    };
  }, []);


  // Handle creating document slots in the vault
  const handleCreateSlots = (license) => {
    if (!license) return;

    const result = createDocumentSlotsForLicense(license, user);
    setCreatedSlotLicenseIds((prev) => ({
      ...prev,
      [license.id]: {
        createdCount: result.created.length,
        skippedCount: result.skipped.length,
        timestamp: new Date(),
      },
    }));

    // Add confirmation message from Sneha
    setMessages((prev) => [
      ...prev,
      {
        id: `system-${Date.now()}`,
        sender: 'sneha',
        timestamp: new Date(),
        text: `✅ **Document Slots Successfully Configured!**\n\nI have created **${result.created.length} new upload slot${result.created.length === 1 ? '' : 's'}** in your Document Vault for **${license.name}**${result.skipped.length > 0 ? ` (${result.skipped.length} existing slots were kept)` : ''}.\n\nYou can now head over to your Vault to upload the files or verify compliance!`,
        matchedLicense: null,
        isActionConfirm: true,
      },
    ]);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'sneha',
        timestamp: new Date(),
        text: `Chat cleared! How can I assist you with your business clearances today?`,
        matchedLicense: null,
      },
    ]);
    setCreatedSlotLicenseIds({});
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3 select-none">
        {!isOpen && (
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              setHasUnread(false);
            }}
            className="group relative flex items-center gap-3 bg-[#18324A] hover:bg-[#1f3f5c] text-[#FAF8F2] px-4 py-3 rounded-full border-2 border-[#262522] shadow-[0_8px_30px_rgba(24,50,74,0.28)] hover:shadow-[0_12px_40px_rgba(24,50,74,0.4)] transition-all duration-300 transform hover:-translate-y-1 focus:outline-none cursor-pointer"
            aria-label="Open Sneha AI Assistant"
          >
            {/* Pulsing indicator */}
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5D8068] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#5D8068] border border-[#FAF8F2]"></span>
            </span>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#C08A3E] text-[#171717] flex items-center justify-center font-bold text-xs shadow-inner">
                <Sparkles className="w-4 h-4 text-[#FAF8F2]" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-tight text-[#FAF8F2]">Sneha</span>
                  <span className="text-[10px] uppercase font-mono-data px-1.5 py-0.2 bg-[#C08A3E]/30 text-[#FAF8F2] rounded border border-[#C08A3E]/50">
                    AI
                  </span>
                </div>
                <div className="text-[10px] text-[#D6D0C3] hidden sm:block">Compliance Assistant</div>
              </div>
            </div>

            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#B85C4A] border-2 border-white rounded-full"></span>
            )}
          </button>
        )}
      </div>

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-[#FAF8F2] border-2 border-[#262522] rounded-[8px] shadow-[0_20px_60px_rgba(23,23,23,0.3)] flex flex-col transition-all duration-300 overflow-hidden w-[92vw] sm:w-[460px] ${
            isMinimized ? 'h-[64px]' : 'h-[620px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-[#18324A] text-[#FAF8F2] px-4 py-3.5 border-b border-[#262522] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#C08A3E] to-[#FAF8F2] text-[#18324A] flex items-center justify-center font-bold text-sm shadow-md border border-[#FAF8F2]/30">
                  <Bot className="w-5 h-5 text-[#18324A]" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#5D8068] border-2 border-[#18324A]"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight text-white">Sneha</span>
                  <span className="text-[10px] font-mono-data bg-[#5D8068] text-white px-1.5 py-0.5 rounded font-semibold">
                    AI ONLINE
                  </span>
                </div>
                <p className="text-[11px] text-[#D6D0C3] leading-tight">
                  Single Window Statutory & License Guide
                </p>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1.5 text-[#D6D0C3]">
              <button
                onClick={handleResetChat}
                title="Restart conversation"
                className="p-1.5 hover:bg-white/10 rounded transition-colors text-[#D6D0C3] hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized((prev) => !prev)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1.5 hover:bg-white/10 rounded transition-colors text-[#D6D0C3] hover:text-white"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 hover:bg-white/10 rounded transition-colors text-[#D6D0C3] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body content (Hidden if minimized) */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F3EFE5]/50">
                {messages.map((msg) => {
                  const isSneha = msg.sender === 'grace' || msg.sender === 'sneha';
                  const slotStatus = msg.matchedLicense
                    ? createdSlotLicenseIds[msg.matchedLicense.id]
                    : null;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isSneha ? 'items-start' : 'items-end'}`}
                    >
                      {/* Sender label & time */}
                      <div className="flex items-center gap-1.5 text-[10px] font-mono-data text-[#6E6A61] mb-1 px-1">
                        <span>{isSneha ? 'Sneha • Compliance AI' : 'You'}</span>
                        <span>•</span>
                        <span>{formatTime(msg.timestamp)}</span>
                      </div>

                      {/* Bubble */}
                      <div
                        className={`max-w-[92%] sm:max-w-[85%] rounded-[6px] px-4 py-3 text-xs sm:text-[13px] leading-relaxed ${
                          isSneha
                            ? 'bg-[#FAF8F2] text-[#171717] border border-[#262522]/20 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                            : 'bg-[#18324A] text-white shadow-sm'
                        }`}
                      >
                        {/* Text Content */}
                        <div className="space-y-2 whitespace-pre-line">
                          {msg.text}
                        </div>

                        {/* Interactive License & Document Slot Card */}
                        {msg.matchedLicense && (
                          <div className="mt-3 pt-3 border-t border-[#D6D0C3] bg-[#F3EFE5] -mx-2 -mb-1 p-3 rounded-[4px] border">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <span className="text-[10px] font-mono-data uppercase font-bold text-[#18324A] bg-[#18324A]/10 px-1.5 py-0.5 rounded">
                                  {msg.matchedLicense.category}
                                </span>
                                <h4 className="font-bold text-xs text-[#171717] mt-1">
                                  {msg.matchedLicense.name}
                                </h4>
                              </div>
                              <span className="text-[10px] font-mono-data text-[#6E6A61] whitespace-nowrap bg-white px-1.5 py-0.5 rounded border border-[#D6D0C3]">
                                ⏱️ {msg.matchedLicense.slaDays}d SLA
                              </span>
                            </div>

                            {/* Checklist overview */}
                            <div className="text-[11px] text-[#30302D] mb-3 space-y-1">
                              <div className="font-semibold text-[#18324A] flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#5D8068]" />
                                Required Documents for Vault ({msg.matchedLicense.requiredDocuments.length})
                              </div>
                              <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px] text-[#6E6A61]">
                                {msg.matchedLicense.requiredDocuments.slice(0, 4).map((doc, idx) => (
                                  <li key={idx} className="truncate">
                                    <span className="text-[#171717] font-medium">{doc.name}</span>{' '}
                                    {doc.isMandatory && (
                                      <span className="text-[9px] text-[#B85C4A] font-bold">
                                        (Mandatory)
                                      </span>
                                    )}
                                  </li>
                                ))}
                                {msg.matchedLicense.requiredDocuments.length > 4 && (
                                  <li className="text-[10px] italic text-[#6E6A61]">
                                    + {msg.matchedLicense.requiredDocuments.length - 4} more document specifications
                                  </li>
                                )}
                              </ul>
                            </div>

                            {/* Slot Creation Action */}
                            {slotStatus ? (
                              <div className="bg-[#5D8068]/15 border border-[#5D8068] p-2 rounded flex flex-col sm:flex-row items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5D8068]">
                                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                                  <span>
                                    {slotStatus.createdCount} Vault Slot
                                    {slotStatus.createdCount === 1 ? '' : 's'} Created!
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    setIsOpen(false);
                                    navigate('/documents');
                                  }}
                                  className="text-[10px] font-bold text-[#18324A] hover:underline flex items-center gap-1 bg-white px-2 py-1 rounded border border-[#5D8068]"
                                >
                                  Open Vault
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleCreateSlots(msg.matchedLicense)}
                                className="w-full flex items-center justify-center gap-2 bg-[#18324A] hover:bg-[#1f3f5c] text-white text-xs font-semibold py-2 px-3 rounded-[4px] border border-[#262522] shadow-xs transition-colors cursor-pointer"
                              >
                                <FilePlus className="w-3.5 h-3.5 text-[#C08A3E]" />
                                <span>Create Required Slots in Vault</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Confirmation navigation quick-link */}
                        {msg.isActionConfirm && (
                          <div className="mt-2.5 pt-2 border-t border-[#D6D0C3] flex justify-end">
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                navigate('/documents');
                              }}
                              className="text-[11px] font-bold text-[#18324A] hover:text-[#C08A3E] flex items-center gap-1"
                            >
                              <span>Go to Document Vault</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center gap-2 text-[#6E6A61] text-xs px-2 py-1">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#18324A] animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#18324A] animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#18324A] animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                    <span className="font-mono-data text-[11px]">Sneha is reviewing statutory acts...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              <div className="px-3 py-2 bg-[#FAF8F2] border-t border-[#D6D0C3] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[10px] font-mono-data text-[#6E6A61] whitespace-nowrap pl-1">
                  Ask Sneha:
                </span>
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    disabled={isLoading}
                    onClick={() => handleSendMessage(prompt.query)}
                    className="whitespace-nowrap text-[11px] px-2.5 py-1 rounded-full bg-[#E9E1D0] hover:bg-[#D6D0C3] text-[#18324A] font-medium border border-[#262522]/15 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-[#FAF8F2] border-t border-[#262522] flex items-center gap-2 shrink-0"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about Fire NOC, FSSAI, Factory license..."
                  className="flex-1 bg-white border border-[#262522]/30 rounded-[4px] px-3 py-2 text-xs text-[#171717] placeholder-[#8B8982] focus:outline-none focus:border-[#18324A] focus:ring-1 focus:ring-[#18324A]"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-[#18324A] hover:bg-[#1f3f5c] disabled:bg-[#8B8982] text-white p-2 rounded-[4px] border border-[#262522] transition-colors cursor-pointer disabled:cursor-not-allowed"
                  aria-label="Send query"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Footer Notice */}
              <div className="px-3 py-1 bg-[#F3EFE5] border-t border-[#D6D0C3] text-[9.5px] font-mono-data text-[#6E6A61] flex items-center justify-between">
                <span>NiveshSetu Compliance AI Engine</span>
                <span className="text-[#5D8068] font-bold">● Operational</span>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export const SnehaChatAssistant = GraceChatAssistant;

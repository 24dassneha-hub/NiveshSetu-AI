# NiveshSetu AI (निवेश सेतु)
### Next-Generation Single Window Investor Clearance & Regulatory Intelligence Platform

NiveshSetu AI is an enterprise-grade digital single-window clearance and compliance portal designed to streamline industrial investments, regulatory approvals, license renewals, and fiscal incentives.

---

## Key Features

- **Unified Investor Dashboard**: Real-time status tracking for state and central clearances, fiscal incentives, and renewal deadlines.
- **Sneha AI Compliance Copilot**: Multilingual AI assistant trained on state industrial policies, offering instant regulatory guidance, document checks, and policy recommendations.
- **Real-Time Fiscal Incentive Engine**: Automated calculation of capital subsidies, SGST reimbursements, stamp duty exemptions, and power tariff concessions based on investment volume and sector.
- **Single-Window Application System**: Step-by-step clearance applications across Pollution Control (CPCB/SPCB), Fire Safety, Factory Licensing, and Land Allocation.
- **Secure Document Vault**: Centralized repository for company PAN, MOA, land deeds, NOCs, and environmental compliance certificates with instant verification.
- **Live Notifications & Escalation Alerts**: Real-time status alerts with automated deadline triggers and departmental escalation protocols.

---

## Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS / Vanilla CSS Design System, Lucide React Icons
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Realtime Subscriptions)
- **AI Intelligence**: Google Gemini API via Sneha AI Assistant
- **Design Architecture**: Modern glassmorphism, responsive high-contrast accessibility, dark/light theme support

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ommy-ommy/NiveshSetu-AI.git
   cd NiveshSetu-AI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env.local` and add your Supabase and Gemini credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## License

This project was developed for the Smart India Hackathon (SIH) initiative.


# 🚀 Nomad - Voice AI for Your Inbox

**NYC AI Agent Hackathon Project** | Built with Datadog MCP, phenoml, Airia, and more

Hands-free inbox management for busy executives. Transform your commute into productive time with sub-1500ms voice latency.

## 🎯 Quick Start for Team Members

### Prerequisites
- Node.js 20+ 
- pnpm (recommended) - install with `npm install -g pnpm`
- Git

### Clone and Setup
```bash
# Clone the repository
git clone git@github.com:MurtazaKafka/nomadnyc.git
cd nomadnyc

# Install pnpm if not already installed
npm install -g pnpm

# Install all dependencies
pnpm install
```

## 🖥️ Running the Services

### 1. Backend Agent Service (Port 8081)
```bash
# Terminal 1 - Start the email processing backend
cd apps/agent-service
cp .env.example .env  # Copy environment template
# Edit .env and add your API keys

pnpm dev
```

The agent service now exposes a REST API at `http://localhost:8081`:

- `GET /api/emails` returns the prioritized + summarized dataset (seeded from `data/sample-emails.json`).
- `POST /api/emails` accepts a raw email payload and streams it through the agent pipeline.
- `POST /api/emails/refresh` replays the sample set.

To run the original console demo once, use `pnpm --filter agent-service sample`.

### 2. Web Demo Frontend (Port 3000) 
```bash
# Terminal 2 - Start the Next.js demo website
cd apps/web
pnpm dev
```

Open http://localhost:3000 to see the demo website with:
- Interactive email prioritization demo
- Voice control simulation
- Sponsor tool integrations showcase
- Market metrics visualization

> Configure the frontend agent URL by creating `apps/web/.env.local` with `NEXT_PUBLIC_AGENT_SERVICE_URL=http://localhost:8081` (defaults to this value when unset).

### 3. Mobile App (Expo)
```bash
# Terminal 3 - Start the React Native app
cd apps/mobile
pnpm start
```

Scan the QR code with Expo Go app on your phone to test the mobile interface.

## 🌳 Project Structure

```
nomadnyc/
├── apps/
│   ├── agent-service/     # TypeScript backend for email processing
│   │   ├── src/
│   │   │   ├── services/  # Email prioritization, summarization
│   │   │   └── index.ts   # Main entry point
│   │   └── test/          # Unit tests
│   ├── web/              # Next.js demo website
│   │   ├── app/          # App router pages
│   │   └── components/   # React components
│   └── mobile/           # React Native app
├── docs/                 # Documentation
│   ├── mvp.md           # MVP scope
│   ├── ui/              # UI task breakdown
│   └── integrations/    # API integration docs
└── README.md
```

## 🔧 Environment Variables

Create `.env` files based on the templates:

### Backend (.env in apps/agent-service/)
```env
OPENAI_API_KEY=your_openai_key
PHENOML_API_TOKEN=your_phenoml_token
PHENOML_MODEL=nomad-email-priority
AIRIA_API_KEY=your_airia_key
```

## 👥 Team Collaboration

### Git Branch Strategy
We're using feature branches for parallel development:

| Branch | Owner | Description |
|--------|-------|-------------|
| `main` | - | Production-ready code |
| `ui/feature/app-shell` | Murtaza | Navigation and app structure |
| `ui/feature/inbox-carousel` | Alp | Email inbox UI |
| `ui/feature/email-detail` | Team A | Email detail view |
| `ui/feature/task-queue` | Team B | Action queue UI |
| `ui/feature/voice-toggle` | Team C | Voice interface |
| `ui/chore/api-client` | Shared | API integration |
| `ui/chore/design-system` | Shared | UI components |

### Working on Your Branch
```bash
# Fetch latest changes
git fetch origin

# Switch to your branch
git checkout ui/feature/your-branch-name

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push to GitHub
git push origin ui/feature/your-branch-name

# Create PR on GitHub when ready
```

## 🧪 Testing

```bash
# Run backend tests
pnpm --filter agent-service test

# Run all tests
pnpm test
```

## 🚀 Deployment

For the hackathon demo:
1. Deploy web app to Vercel: `vercel --cwd apps/web`
2. Deploy agent service to Railway/Render
3. Use Expo EAS for mobile builds

## 📊 Sponsor Tool Integration Status

- ✅ **Datadog MCP** - Monitoring email processing metrics
- ✅ **phenoml** - ML-powered email prioritization  
- ✅ **Airia** - Autonomous agent actions
- ✅ **OpenAI Whisper** - Voice transcription
- ✅ **DeepL** - Translation support (planned)
- ✅ **Structify** - Data organization (planned)

## 🎯 Hackathon Requirements

- [x] Use 3+ sponsor tools
- [x] Autonomous agent capabilities
- [x] Real-time data processing
- [x] 3-minute demo ready
- [x] Deployed to production

## 📝 Key Commands Reference

```bash
# Install dependencies
pnpm install

# Run everything in dev mode
pnpm dev  # Runs all services concurrently

# Run specific service
pnpm --filter agent-service dev
pnpm --filter web dev
pnpm --filter mobile start

# Build for production
pnpm build

# Run tests
pnpm test
```

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 8081  
lsof -ti:8081 | xargs kill -9
```

### Dependencies not installing
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Environment variables not loading
- Make sure `.env` file is in the correct directory
- Restart the development server after changing `.env`

## 📞 Support

- **Discord**: Join #nomad-team channel
- **GitHub Issues**: Report bugs and feature requests
- **Slack**: @murtaza or @alp for urgent issues

## 🏆 Demo Day Checklist

- [ ] All services running locally
- [ ] API keys configured
- [ ] Demo script prepared
- [ ] Screen recording ready
- [ ] Devpost submission complete
- [ ] Production URLs working

---

**Built with ❤️ for NYC AI Agent Hackathon**

Murtaza & Alp | Davidson College
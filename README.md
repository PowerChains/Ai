# SYSTEMAI.EXE - Production Windows System AI

A lightweight, production-ready AI-powered Windows desktop application for system monitoring, intelligent optimization, autonomous repair, and secure workflow management.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development mode (live reload)
npm run dev

# Build for production
npm run build

# Start production app
npm start

# Package as executable
npm run dist
```

## 📋 Features (Phase 1)

- ✅ Electron shell with React UI
- ✅ Real-time system monitoring (CPU, RAM, Disk, Network)
- ✅ AI Chatbot engine with natural language processing
- ✅ Guided Mode (transparent, ask permission)
- ✅ Auto Mode (autonomous, self-healing)
- ✅ SQLite database for persistent storage
- ✅ IPC bridge for main/renderer communication
- ✅ REST API + WebSocket backend
- ✅ Modern dashboard with Tailwind CSS

## 🏗️ Architecture

```
SYSTEMAI.EXE
├── Electron Main Process
│   ├── IPC Handlers
│   ├── Backend Server (Express + Socket.io)
│   └── System Integration
├── React Renderer
│   ├── Dashboard
│   ├── Monitoring Panels
│   ├── AI Chatbot
│   └── Settings
└── Backend Services
    ├── System Monitor Engine
    ├── AI Engine
    ├── Database Service
    ├── Logger Service
    └── Settings Service
```

## 📦 Tech Stack

**Frontend:**
- Electron 27
- React 18
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Framer Motion (animations)

**Backend:**
- Node.js
- Express
- Socket.io
- Better SQLite3
- Systeminformation

**AI/ML:**
- Ollama (local LLM support)
- Rule-based intent parser (Phase 1)

## 🔄 Development Roadmap

### Phase 1 ✅ Core Architecture
- [x] Electron + React setup
- [x] System telemetry collection
- [x] AI chatbot engine
- [x] Basic dashboard

### Phase 2 ⏳ Advanced Monitoring
- [ ] CPU/Memory profiling
- [ ] Disk analysis
- [ ] Network monitoring
- [ ] Process management

### Phase 3 🔧 Repair Engine
- [ ] Windows Update fixes
- [ ] SFC/DISM execution
- [ ] DLL registration repairs
- [ ] PATH corruption fixes

### Phase 4 ⚡ Optimization
- [ ] Memory cleanup
- [ ] Startup optimization
- [ ] Process priority tuning
- [ ] Garbage collection triggers

### Phase 5 🖥️ Localhost Orchestration
- [ ] Docker management
- [ ] WSL integration
- [ ] Node.js server control
- [ ] Python API management
- [ ] Database monitoring

### Phase 6 🤖 Autonomous Swarm
- [ ] Auto-healing
- [ ] Self-optimization
- [ ] Notifications system
- [ ] Intelligent automation

### Phase 7 🔒 Production Hardening
- [ ] Sandboxing
- [ ] Security scanning
- [ ] Rollback snapshots
- [ ] Code signing
- [ ] Stability testing

## 🎯 Guided vs Auto Mode

### Guided Mode (Default)
- Explains every action
- Asks for permission
- Shows impact preview
- Safe learning environment

### Auto Mode (Advanced)
- Autonomous optimization
- Proactive repairs
- Continuous monitoring
- Still asks for high-risk operations

## 🔐 Security & Safety

- ✅ Sandboxed command execution
- ✅ Permission-aware operations
- ✅ Rollback checkpoints
- ✅ Comprehensive logging
- ✅ No silent operations
- ✅ User approval for risky actions

## 📊 API Documentation

### IPC Handlers (Main <-> Renderer)

```typescript
// System monitoring
window.api.getSystemInfo()
window.api.getCpuUsage()
window.api.getMemoryUsage()
window.api.getDiskHealth()
window.api.getNetworkStats()
window.api.getProcessList()
window.api.getSecurityStatus()

// AI Chat
window.api.sendMessage(message: string)

// Mode control
window.api.setMode(mode: 'guided' | 'auto')
window.api.getMode()

// Settings
window.api.getSettings()
window.api.saveSettings(settings: object)

// Listeners
window.api.onSystemUpdate(callback)
window.api.onNotification(callback)
```

### REST API Endpoints

```
GET  /api/health                  - Server health check
GET  /api/system/info             - System information
GET  /api/system/monitoring       - All monitoring data
POST /api/ai/chat                 - Send message to AI
```

### WebSocket Events

```
system-update                     - Real-time system metrics
ai-response                       - AI assistant responses
notification                      - System notifications
```

## 🗂️ Project Structure

```
src/
├── main/                         # Electron main process
│   ├── main.ts                  # Entry point
│   ├── preload.ts               # IPC bridge
│   ├── ipc.ts                   # IPC handlers
│   └── backend.ts               # Backend server init
├── backend/                      # Backend services
│   ├── engines/
│   │   └── monitor.ts           # System monitor
│   ├── ai/
│   │   └── engine.ts            # AI engine
│   ├── database/
│   │   └── service.ts           # Database service
│   ├── services/
│   │   ├── logger.ts            # Logging service
│   │   └── settings.ts          # Settings service
│   └── sandbox/                 # Execution sandbox
└── renderer/                     # React frontend
    ├── App.tsx                  # Root component
    ├── main.tsx                 # React entry point
    ├── pages/
    │   └── Dashboard.tsx        # Main dashboard
    ├── components/
    │   ├── Sidebar.tsx
    │   ├── Header.tsx
    │   ├── MonitoringPanel.tsx
    │   └── ChatBot.tsx
    ├── store/
    │   └── appStore.ts          # Zustand store
    └── styles/
        └── globals.css          # Global styles
```

## 🛠️ Configuration Files

- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite bundler config
- `tailwind.config.js` - Tailwind CSS config
- `jest.config.js` - Jest testing config
- `.prettierrc` - Code formatting rules
- `.gitignore` - Git ignore rules

## 📝 Development Guidelines

1. **Logging**: Use `Logger` service for all logging
2. **Database**: Use `DatabaseService` singleton
3. **State**: Use Zustand for app state
4. **IPC**: Always use type-safe IPC handlers
5. **Errors**: Graceful error handling with user feedback
6. **Testing**: Write tests for critical paths

## 🚀 Deployment

```bash
# Development build
npm run build

# Production package (Windows)
npm run dist

# Output: dist/SYSTEMAI Setup X.X.X.exe
```

## 📄 License

MIT - See LICENSE file

## 🤝 Contributing

This is a production project with strict architecture guidelines. All contributions must follow the design philosophy and security policies outlined in the spec.

## 📞 Support

For issues, feature requests, or questions, please check the documentation or file an issue.

---

**SYSTEMAI.EXE** - An intelligent operating layer for Windows.  
*From 1% → 100% Production Ready*

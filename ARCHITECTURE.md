# SYSTEMAI.EXE - Architecture & Design Document

## System Overview

SYSTEMAI.EXE is a production-grade Windows system AI platform built with Electron, React, and Node.js. It operates in two intelligent modes (Guided and Auto) to provide transparent AI assistance or autonomous system optimization.

## Core Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    SYSTEMAI.EXE                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐      ┌──────────────────┐         │
│  │  React Frontend  │      │  AI Chatbot      │         │
│  │  (Dashboard UI)  │      │  (Intent Parser) │         │
│  └──────────────────┘      └──────────────────┘         │
│           │                          │                    │
│           └──────────┬───────────────┘                    │
│                      │                                     │
│          ┌───────────▼──────────────┐                     │
│          │   IPC Bridge (Secure)    │                     │
│          └───────────┬──────────────┘                     │
│                      │                                     │
│  ┌────────────────────▼────────────────────┐              │
│  │     Electron Main Process                │              │
│  │  ┌──────────────────────────────────┐   │              │
│  │  │  Backend Server (Express + Sock)│   │              │
│  │  │  - REST API                      │   │              │
│  │  │  - WebSocket Events              │   │              │
│  │  └──────────────────────────────────┘   │              │
│  └────────┬───────────────────────────┬────┘              │
│           │                           │                    │
│  ┌────────▼──────────┐   ┌──────────▼─────────┐           │
│  │ System Engines    │   │  Services Layer    │           │
│  │ - Monitor         │   │ - Logger           │           │
│  │ - Repair          │   │ - Database         │           │
│  │ - Optimize        │   │ - Settings         │           │
│  │ - Security        │   │ - Sandbox          │           │
│  └───────────────────┘   └────────────────────┘           │
│           │                           │                    │
│           └──────────┬─────────────────┘                   │
│                      │                                     │
│          ┌───────────▼──────────────┐                     │
│          │   SQLite Database        │                     │
│          │  (Persistent Storage)    │                     │
│          └──────────────────────────┘                     │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Component Layers

### 1. Presentation Layer (React)
**Location**: `src/renderer/`

Components:
- **Dashboard.tsx** - Main layout orchestrator
- **Sidebar.tsx** - Navigation menu
- **Header.tsx** - Status bar and mode toggle
- **MonitoringPanel.tsx** - Real-time system metrics
- **ChatBot.tsx** - AI assistant interface

State Management:
- **appStore.ts** (Zustand) - Global app state
  - `mode`: 'guided' | 'auto'
  - `systemMetrics`: CPU, Memory, Disk, Network
  - `notifications`: System alerts
  - `chatMessages`: Conversation history

### 2. IPC Security Layer
**Location**: `src/main/`

Components:
- **preload.ts** - Context-isolated bridge
- **ipc.ts** - Handler registrations
- **main.ts** - Electron lifecycle

Purpose:
- Securely expose backend APIs to renderer
- Validate all inter-process communication
- Maintain sandbox integrity
- Handle window lifecycle

### 3. Backend Services Layer
**Location**: `src/backend/`

#### System Engines (`engines/`)
- **monitor.ts**: Real-time system telemetry
  - CPU usage, thermal, thread saturation
  - Memory fragmentation, leak detection
  - Disk health, I/O bottlenecks
  - Network stats, DNS health
  - Process list, top consumers
  - Security status, CVEs

#### AI Engine (`ai/`)
- **engine.ts**: Conversational AI core
  - Natural language intent parsing
  - System command generation
  - Conversation memory
  - Risk assessment
  - Approval workflow

#### Database Layer (`database/`)
- **service.ts**: SQLite singleton
  - Message history
  - Settings persistence
  - Event logging
  - Snapshot management
  - Action history

#### Service Layer (`services/`)
- **logger.ts**: File + console logging
- **settings.ts**: Configuration management
- **sandbox.ts** (future): Secure execution environment

### 4. Backend API Server
**Location**: `src/main/backend.ts`

REST Endpoints:
```
GET  /api/health              - Server status
GET  /api/system/info         - System information
GET  /api/system/monitoring   - All metrics
POST /api/ai/chat             - AI message processing
```

WebSocket Events:
```
system-update    - Real-time metrics (1s interval)
ai-response      - AI assistant responses
notification     - User notifications
```

## Data Flow

### User Interaction Flow
```
User Input (Chat)
    ↓
ChatBot Component
    ↓
IPC: window.api.sendMessage()
    ↓
Main Process: ipcMain.handle('ai-chat')
    ↓
AI Engine: processMessage()
    ↓
Intent Parser: parseUserIntent()
    ↓
Response Generation
    ↓
Database: Save messages
    ↓
IPC Response Back to Renderer
    ↓
Component Update
    ↓
UI Render
```

### System Monitoring Flow
```
React Component Mount
    ↓
useEffect Hook
    ↓
Fetch via window.api.getCpuUsage()
    ↓
Main Process IPC Handler
    ↓
SystemMonitor.getCpuUsage()
    ↓
systeminformation library
    ↓
Return metrics to Renderer
    ↓
Zustand state update
    ↓
Re-render with new metrics
    ↓
Repeat every 2 seconds
```

### WebSocket Real-time Updates
```
Backend Server (Express + Socket.io)
    ↓
Emit 'system-update' every 1s
    ↓
Connected Clients receive event
    ↓
Frontend processes update
    ↓
Optional: Update Zustand state
    ↓
Component re-renders
```

## Operational Modes

### Guided Mode (Default)
**Characteristics**:
- User approval required before actions
- Detailed explanations of each step
- Impact previews
- Educational approach
- Safety-first

**Flow**:
```
User Request
    ↓
AI explains action
    ↓
Shows impact preview
    ↓
Requests approval
    ↓
Action execution (if approved)
    ↓
Result notification
```

### Auto Mode (Advanced)
**Characteristics**:
- Autonomous execution
- Proactive optimization
- Continuous monitoring
- Still requires approval for high-risk
- Notification-driven

**Flow**:
```
System Monitoring
    ↓
Issue Detection
    ↓
Risk Assessment
    ↓
If Low-Risk: Execute automatically
If High-Risk: Request approval
    ↓
Action execution
    ↓
Notification to user
    ↓
Logging for audit trail
```

## Security Model

### Principle of Least Privilege
- Renderer process: No direct system access
- IPC: Validated, typed requests only
- Sandbox: Execution environment isolation
- Logging: Every action audited

### Risk Levels
```
Low      - Read operations, monitoring
Medium   - Cache cleanup, process suspend
High     - Registry changes, driver updates
Critical - BIOS, bootloader, security policies
```

### Approval Requirements
```
Low:      No approval needed
Medium:   Auto in Auto Mode, approval in Guided
High:     Always requires explicit approval
Critical: Always requires approval + snapshot
```

## Database Schema

### messages
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  role TEXT ('user'|'assistant'),
  content TEXT,
  timestamp TEXT
)
```

### settings
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT
)
```

### events
```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  type TEXT,
  description TEXT,
  severity TEXT ('low'|'medium'|'high'),
  timestamp TEXT,
  data TEXT
)
```

### actions
```sql
CREATE TABLE actions (
  id TEXT PRIMARY KEY,
  name TEXT,
  status TEXT ('pending'|'executing'|'completed'|'failed'),
  parameters TEXT,
  result TEXT,
  created_at TEXT,
  completed_at TEXT
)
```

### snapshots
```sql
CREATE TABLE snapshots (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  data TEXT,
  created_at TEXT
)
```

## Execution Lifecycle

### Startup
```
1. Electron main process starts
2. Backend server initializes (Express + Socket.io)
3. Database connection established
4. IPC handlers registered
5. BrowserWindow created
6. Load React application
7. React mounts components
8. System monitoring begins
```

### Runtime
```
1. React component lifecycle
2. User interactions → IPC calls
3. Backend processes requests
4. Database operations logged
5. WebSocket events broadcast
6. UI state updates via Zustand
7. Components re-render
8. Metrics update every 2 seconds
```

### Shutdown
```
1. User closes application
2. React unmounts components
3. Monitoring intervals cleared
4. Backend server closed
5. Database connection closed
6. Electron app quit
7. Process exit
```

## Performance Targets

- **Idle CPU**: < 1-2%
- **Memory Footprint**: < 200MB
- **Startup Time**: < 3 seconds
- **API Response**: < 500ms
- **UI Responsiveness**: 60 FPS
- **Telemetry Interval**: 2 seconds (user-configurable)

## Future Extensions

### Phase 2: Advanced Engines
- Process management
- Real-time performance charting
- Advanced system analysis

### Phase 3: Repair Engine
- Windows Update fixes
- SFC/DISM automation
- DLL registration repairs

### Phase 4: Optimization
- Memory compression
- Startup item management
- Process priority tuning

### Phase 5: Localhost Orchestration
- Docker container management
- WSL instance monitoring
- Local service health checks

### Phase 6: Autonomous Mode
- ML-based decision making
- Predictive issue detection
- Auto-healing workflows

### Phase 7: Production Hardening
- Code signing
- Security scanning
- Rollback mechanisms

## Development Environment

### Tech Stack Rationale

**Electron**: 
- Cross-platform desktop capability
- Access to system APIs via Node.js
- Native window management

**React**:
- Component reusability
- Fast re-rendering
- Large ecosystem

**TypeScript**:
- Type safety at scale
- Better IDE support
- Fewer runtime errors

**Zustand**:
- Minimal boilerplate
- Simple mental model
- No provider hell

**Tailwind**:
- Utility-first approach
- Fast UI prototyping
- Consistent design system

**SQLite**:
- Zero-configuration
- ACID compliance
- Embedded capability

**Socket.io**:
- Real-time bidirectional communication
- Automatic reconnection
- Fallback mechanisms

---

## Key Design Principles

1. **User First**: Transparency, control, education
2. **Security**: Least privilege, auditing, sandboxing
3. **Performance**: Efficient monitoring, minimal overhead
4. **Reliability**: Error handling, logging, rollbacks
5. **Scalability**: Modular architecture, service isolation
6. **Maintainability**: Clear code, type safety, documentation

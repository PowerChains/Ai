# SYSTEMAI.EXE - Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Windows 10/11 (for full platform features)
- Basic knowledge of Electron, React, and TypeScript

### Initial Setup

```bash
cd /workspaces/Ai

# Install all dependencies
npm install

# Verify installation
npm list

# Run type checking
npx tsc --noEmit
```

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

This launches:
- **Electron main process** with hot reload via `tsc --watch`
- **Vite dev server** on `http://localhost:5173`
- **Backend server** on `http://localhost:3000`

### 2. Code Structure

**Main Process** (`src/main/`):
- `main.ts` - Electron app entry point
- `preload.ts` - IPC security bridge
- `ipc.ts` - IPC handler definitions
- `backend.ts` - Express + Socket.io server

**Backend Services** (`src/backend/`):
- `engines/monitor.ts` - System monitoring
- `ai/engine.ts` - AI chatbot logic
- `database/` - SQLite operations
- `services/` - Logger, Settings, etc.

**React Frontend** (`src/renderer/`):
- `pages/Dashboard.tsx` - Main layout
- `components/` - UI components
- `store/appStore.ts` - Zustand state
- `styles/` - Tailwind CSS

### 3. Adding New Features

**Adding an IPC Handler:**
```typescript
// In src/main/ipc.ts
ipcMain.handle('new-action', async (_, params) => {
  // Implementation
  return result
})

// In src/main/preload.ts
contextBridge.exposeInMainWorld('api', {
  newAction: (params) => ipcRenderer.invoke('new-action', params)
})

// In React component
const result = await window.api.newAction(params)
```

**Adding a React Component:**
1. Create in `src/renderer/components/`
2. Import and use in pages
3. Use `useAppStore()` for state
4. Style with Tailwind CSS

**Adding Backend Service:**
1. Create in `src/backend/services/`
2. Use `DatabaseService.getInstance()`
3. Register in IPC handlers
4. Log all operations with `Logger`

### 4. Database Operations

Use `better-sqlite3` for synchronous database access:

```typescript
import { DatabaseService } from '@backend/database/service'

const db = DatabaseService.getInstance().getDb()
const stmt = db.prepare('SELECT * FROM table WHERE id = ?')
const result = stmt.get(id)
```

### 5. Logging

All operations should be logged:

```typescript
import { Logger } from '@backend/services/logger'

const logger = new Logger('ComponentName')
logger.info('Operation started', { data: value })
logger.error('Operation failed', error)
```

Logs are saved to `logs/YYYY-MM-DD.log`

### 6. Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

Test patterns:
- Unit tests: `src/**/*.test.ts`
- Integration tests: `src/**/*.spec.ts`

## Building for Production

### Development Build
```bash
npm run build
# Outputs to dist/
```

### Production Packaging
```bash
npm run dist
# Outputs Windows installer and portable exe
# To dist/SYSTEMAI*.exe
```

### Build Output

```
dist/
├── main/              # Compiled Electron process
├── renderer/          # Compiled React app
└── systemai.db       # SQLite database
```

## Environment Variables

Create `.env` file:
```
NODE_ENV=development
DB_PATH=./systemai.db
LOG_DIR=./logs
PORT=3000
```

## Common Issues & Solutions

### Issue: Module not found
**Solution**: Ensure path aliases in `tsconfig.json` match your import paths.

### Issue: IPC handler not responding
**Solution**: Check that handler is registered in `src/main/ipc.ts` before window is created.

### Issue: React component not updating
**Solution**: Use `useAppStore()` for state, not React useState for global state.

### Issue: Database locked
**Solution**: Ensure you're using `DatabaseService.getInstance()` singleton, not creating multiple connections.

## Performance Tips

1. **Lazy load monitors**: Start monitoring only when component mounts
2. **Batch database queries**: Use transactions for multiple operations
3. **Debounce UI updates**: Limit state updates to necessary intervals
4. **Profile bundled size**: Use `npm run build` and check dist/ size
5. **Monitor memory**: Use DevTools to check for memory leaks

## Next Steps (Future Phases)

- **Phase 2**: Advanced monitoring dashboards
- **Phase 3**: Windows repair engines (SFC, DISM)
- **Phase 4**: Memory and startup optimization
- **Phase 5**: Localhost orchestration
- **Phase 6**: Autonomous swarm mode
- **Phase 7**: Production hardening

## Debugging

### Debug Main Process
```bash
# Run with verbose logging
npm run dev:main
# Then attach debugger to PID
```

### Debug Renderer
```bash
# DevTools automatically opens in development
# Use Chrome DevTools for debugging React
```

### Debug Backend
```bash
# Check logs in logs/ directory
# Use REST client to test endpoints
curl http://localhost:3000/api/health
```

## Code Quality

### Formatting
```bash
npm run format
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

## Architecture Decisions

1. **Zustand over Redux**: Simpler state management for this app size
2. **Better-sqlite3**: Synchronous API for simpler backend operations
3. **Electron IPC**: Type-safe bridge between processes
4. **Socket.io**: Real-time updates without polling
5. **Tailwind**: Rapid styling without component library overhead

## Contributing Guidelines

1. Follow TypeScript strict mode
2. Write tests for new features
3. Use logger for all operations
4. Keep IPC handlers thin
5. Document public APIs
6. Follow existing code style

---

For questions or issues, refer to the main README.md or check the codebase for examples.

# SYSTEMAI.EXE - Development Rules & Discipline

## 📋 Code Discipline Rules

### Rule 1: File Creation Protocol
Every new file MUST follow this sequence:

```
1. Create file with core implementation
2. Add JSDoc/TSDoc comments to all exports
3. Create corresponding .md documentation
4. Run validation checks
5. Commit with descriptive message
6. Push to branch
```

### Rule 2: File Documentation Requirements
For each new file, create parallel `.md` documentation:

```
src/backend/engines/monitor.ts  →  docs/engines/monitor.md
src/renderer/components/Chat.tsx  →  docs/components/chat.md
src/backend/services/logger.ts  →  docs/services/logger.md
```

### Rule 3: Code Comment Standards
All code MUST have:

```typescript
/**
 * @description Clear one-line description
 * @param paramName - Description of parameter
 * @returns Description of return value
 * @throws Error conditions
 * @example Usage example
 */
function myFunction(paramName: string): void {
  // Implementation comments for complex logic
}
```

### Rule 4: Validation Checklist
Before commit, EVERY file must pass:

- ✅ TypeScript strict mode compilation
- ✅ No ESLint warnings/errors
- ✅ All exports documented
- ✅ No console.log (use Logger instead)
- ✅ Error handling on all async operations
- ✅ Corresponding .md documentation exists
- ✅ No hardcoded values (use config/env)
- ✅ Logging on entry/exit of functions
- ✅ Type annotations on all parameters

### Rule 5: Commit Message Format
```
type(scope): description

[optional body with details]

Fixes: #issue-number
Docs: docs/path/to/file.md
Validated: checklist items verified
```

Examples:
```
feat(monitor): add CPU thermal tracking

- Track thermal throttling events
- Store in database for analysis
- Emit notifications on critical temp

Docs: docs/engines/monitor.md
Validated: typescript, eslint, tests
```

### Rule 6: Git Workflow
```
1. Create feature branch: git checkout -b feature/name
2. Make changes with discipline
3. Run full validation: npm run validate
4. Commit with detailed message
5. Push to branch: git push origin feature/name
6. Create PR with description
7. Merge to main after review
```

### Rule 7: Branch Protection
Main branch REQUIRES:
- All validations passing
- Commit messages follow format
- Documentation present
- No uncommmented code
- No test failures

### Rule 8: Module Exports
Every module MUST export:

```typescript
// ❌ Bad
export function monitor() { }

// ✅ Good
/**
 * Monitor system resources in real-time
 * @param interval - Monitoring interval in ms
 * @returns SystemMetrics object
 */
export function monitor(interval: number = 2000): SystemMetrics {
  // ...
}

// Export types separately
export interface SystemMetrics {
  cpu: number
  memory: number
}

export type MonitorCallback = (metrics: SystemMetrics) => void
```

### Rule 9: Error Handling
All operations MUST handle errors:

```typescript
// ❌ Bad
const data = await fetchData()

// ✅ Good
try {
  const data = await fetchData()
  logger.info('Data fetched successfully')
  return data
} catch (error) {
  logger.error('Failed to fetch data', error)
  throw new Error(`Data fetch failed: ${error.message}`)
}
```

### Rule 10: Async Operations
All async operations MUST have timeout/cancellation:

```typescript
async function operation(timeout: number = 5000): Promise<Result> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const result = await doAsyncWork(controller.signal)
    logger.info('Operation completed successfully')
    return result
  } catch (error) {
    if (error.name === 'AbortError') {
      logger.warn('Operation timed out')
      throw new Error('Operation timeout')
    }
    logger.error('Operation failed', error)
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
```

## 📚 Documentation Standards

### File Structure
```
docs/
├── engines/
│   ├── monitor.md        # SystemMonitor engine
│   ├── repair.md         # Repair engine (future)
│   └── optimizer.md      # Optimization engine (future)
├── services/
│   ├── logger.md         # Logging service
│   ├── settings.md       # Settings service
│   └── database.md       # Database service
├── components/
│   ├── dashboard.md
│   ├── chatbot.md
│   └── monitoring-panel.md
└── api/
    ├── ipc-handlers.md
    ├── rest-endpoints.md
    └── websocket-events.md
```

### Documentation Template
```markdown
# [Module Name]

## Overview
Brief description of what this module does.

## Location
`src/path/to/file.ts`

## Exports
List all exported functions, classes, interfaces.

### FunctionName(params): ReturnType
- **Description**: What it does
- **Parameters**: Details of each param
- **Returns**: What is returned
- **Throws**: What errors can occur
- **Example**: Code usage example

## Dependencies
- List of imports and why

## Internal Implementation
- Algorithm overview
- Key decisions
- Performance considerations

## Usage Examples
```typescript
// Example 1
// Example 2
```

## Testing
- Unit tests location
- Coverage requirements

## Future Improvements
- Potential optimizations
- Missing features
```

## 🔍 Validation Script

Create `scripts/validate.sh`:

```bash
#!/bin/bash

echo "🔍 Starting validation..."

# TypeScript compilation
echo "  • Checking TypeScript..."
npx tsc --noEmit || exit 1

# ESLint
echo "  • Running ESLint..."
npx eslint src --ext .ts,.tsx || exit 1

# Check for console.log
echo "  • Checking for console.log..."
if grep -r "console\." src --include="*.ts" --include="*.tsx"; then
  echo "    ❌ Found console.log usage"
  exit 1
fi

# Check for hardcoded strings
echo "  • Checking documentation..."
missing_docs=0
for file in src/**/*.ts src/**/*.tsx; do
  if [ -f "$file" ]; then
    export_count=$(grep -c "^export" "$file" || true)
    if [ $export_count -gt 0 ]; then
      jsdoc_count=$(grep -c "/\*\*" "$file" || true)
      if [ $jsdoc_count -eq 0 ]; then
        echo "    ⚠️  Missing docs: $file"
        missing_docs=$((missing_docs + 1))
      fi
    fi
  fi
done

echo "✅ Validation complete!"
```

## 🤖 Dynamic Comment Generation

Create `scripts/generate-comments.js`:

```javascript
const fs = require('fs')
const path = require('path')
const ts = require('typescript')

function generateOptimizedComments(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true
  )

  let enhanced = source
  const functions = []

  function visit(node) {
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
      if (!hasJSDoc(node)) {
        const comment = generateJSDoc(node, sourceFile)
        functions.push({ node, comment })
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  // Insert comments (in reverse order to maintain positions)
  functions.reverse().forEach(({ node, comment }) => {
    const pos = node.getStart()
    enhanced = enhanced.slice(0, pos) + comment + '\n' + enhanced.slice(pos)
  })

  return enhanced
}

function hasJSDoc(node) {
  return ts.getLeadingCommentRanges(
    node.getSourceFile().text,
    node.getFullStart()
  )?.some(r => node.getSourceFile().text[r.pos] === '/')
}

function generateJSDoc(node, sourceFile) {
  const name = node.name?.text || 'unknown'
  const params = extractParams(node)
  const returnType = extractReturnType(node, sourceFile)

  let doc = `/**\n * ${name}(${params.map(p => p.name).join(', ')})\n`
  
  if (params.length > 0) {
    doc += ` * @param ${params.map(p => `{${p.type}} ${p.name}`).join(' - ')}\n`
  }
  
  doc += ` * @returns ${returnType}\n`
  doc += ' */'

  return doc
}

module.exports = { generateOptimizedComments }
```

## 🚀 Deployment Checklist

Before pushing to main:

- [ ] All files created with discipline protocol
- [ ] All exports documented with JSDoc
- [ ] Parallel .md documentation files created
- [ ] TypeScript validation passing
- [ ] ESLint validation passing
- [ ] No console.log or hardcoded values
- [ ] Error handling on all async operations
- [ ] Logger used for all major operations
- [ ] Commit messages follow format
- [ ] PR description complete and detailed
- [ ] Code review approval obtained
- [ ] All automated checks passing

## 📊 File Discipline Metrics

Track for each file:
- Creation date
- Documentation completion date
- Validation status
- Comment coverage %
- Test coverage %
- Last update date

Example `FILE_MANIFEST.json`:
```json
{
  "files": [
    {
      "path": "src/backend/engines/monitor.ts",
      "created": "2026-05-16",
      "documented": true,
      "validated": true,
      "commentCoverage": 95,
      "testCoverage": 85,
      "status": "production-ready"
    }
  ]
}
```

## ✅ Validation Command

```bash
# Run full validation
npm run validate

# Run with report
npm run validate:report

# Auto-fix issues
npm run validate:fix
```

---

**These rules ensure production-grade code quality, comprehensive documentation, and maintainability across the entire SYSTEMAI.EXE codebase.**

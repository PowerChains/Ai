# AI Engine

## Overview
The AI Engine provides natural language conversation capabilities and intelligent command generation. It parses user intents and generates appropriate responses with risk assessment.

**Location**: `src/backend/ai/engine.ts`

## Exports

### Interface: ChatMessage
```typescript
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  systemContext?: Record<string, any>
}
```
- **Description**: Single conversation message structure
- **Fields**:
  - `id`: Unique message identifier
  - `role`: Sender role (user or AI assistant)
  - `content`: Message text content
  - `timestamp`: When message was created
  - `systemContext`: Optional system state at time of message

### Interface: AIResponse
```typescript
interface AIResponse {
  message: string
  action?: string
  parameters?: Record<string, any>
  confidence: number
  requiresApproval: boolean
  riskLevel: 'low' | 'medium' | 'high'
}
```
- **Description**: AI engine response structure
- **Fields**:
  - `message`: Human-readable response text
  - `action`: System action to perform (optional)
  - `parameters`: Parameters for action execution
  - `confidence`: 0-1 confidence in response
  - `requiresApproval`: Whether user approval needed
  - `riskLevel`: Estimated risk of operation

### Class: AIEngine

#### Constructor
```typescript
constructor()
```
- **Description**: Initializes AI engine with database connection
- **Parameters**: None
- **Returns**: AIEngine instance
- **Side Effects**: Loads conversation history from database

#### processMessage(userMessage: string): Promise<AIResponse>
- **Description**: Processes user input and generates response
- **Parameters**: `userMessage` - User input string
- **Returns**: AIResponse with message and action details
- **Throws**: Error if message processing fails
- **Example**:
```typescript
const ai = new AIEngine()
const response = await ai.processMessage('optimize my system')
console.log(response.message)
console.log(`Action: ${response.action}`)
console.log(`Risk: ${response.riskLevel}`)
```

#### parseUserIntent(message: string): AIResponse (private)
- **Description**: Parses user intent and generates response
- **Parameters**: `message` - User input
- **Returns**: AIResponse object
- **Throws**: None (returns default response on error)
- **Algorithm**:
  1. Convert to lowercase
  2. Check for keywords
  3. Match to known intents
  4. Generate appropriate response
  5. Assess risk level
  6. Determine approval requirement

#### getConversationHistory(): ChatMessage[]
- **Description**: Returns conversation history from current session
- **Parameters**: None
- **Returns**: Array of ChatMessage objects
- **Example**:
```typescript
const history = ai.getConversationHistory()
history.forEach(msg => {
  console.log(`${msg.role}: ${msg.content}`)
})
```

#### clearConversationHistory(): void
- **Description**: Clears conversation history from memory and database
- **Parameters**: None
- **Returns**: void
- **Throws**: None (logs errors but doesn't throw)
- **Example**:
```typescript
ai.clearConversationHistory()
```

#### setMode(mode: 'guided' | 'auto'): void
- **Description**: Sets operational mode
- **Parameters**: `mode` - 'guided' (ask permission) or 'auto' (autonomous)
- **Returns**: void
- **Example**:
```typescript
ai.setMode('auto')
```

#### getMode(): 'guided' | 'auto'
- **Description**: Gets current operational mode
- **Parameters**: None
- **Returns**: Current mode string
- **Example**:
```typescript
const mode = ai.getMode()
console.log(`Current mode: ${mode}`)
```

## Dependencies
- **DatabaseService**: For message persistence
- **Logger**: For operation logging

## Internal Implementation

### Intent Recognition System
Currently uses rule-based keyword matching (Phase 1). Supports:
- System monitoring queries (CPU, memory, disk)
- Performance optimization requests
- System repair operations
- Security hardening
- Mode switching
- Help requests

### Response Generation
1. Parse user input
2. Identify intent from keywords
3. Generate contextual response
4. Assess risk level based on intent
5. Determine if approval required
6. Return AIResponse with all metadata

### Conversation Persistence
- Messages stored in SQLite database
- Supports up to 100 recent messages in memory
- Full history available in database
- Cleared on user request only

### Risk Levels
- **Low**: Read-only operations, monitoring
- **Medium**: Cache cleanup, process optimization
- **High**: System repair, driver changes

### Approval Requirements
- **Low Risk**: No approval needed
- **Medium Risk**: Required in Guided Mode, auto in Auto Mode
- **High Risk**: Always requires explicit approval

## Type Definitions

```typescript
// Intent types
type UserIntent = 
  | 'monitor'
  | 'optimize'
  | 'repair'
  | 'security'
  | 'help'
  | 'unknown'

// Confidence levels
type Confidence = number // 0.0 - 1.0

// Operation risk
type RiskLevel = 'low' | 'medium' | 'high'
```

## Error Handling
- All async operations wrapped in try-catch
- Graceful fallback to default response
- Detailed logging of processing errors
- User-friendly error messages

## Usage Examples

### Basic Chat Interaction
```typescript
const ai = new AIEngine()

// User asks about CPU
const response = await ai.processMessage('how is my CPU?')
// Response: message with CPU info, action='get-cpu-info'

// User asks for optimization
const response2 = await ai.processMessage('optimize my system')
// Response: message with explanation, requiresApproval=true
```

### Mode-Aware Operations
```typescript
const ai = new AIEngine()

// In Guided Mode (default)
ai.setMode('guided')
let resp = await ai.processMessage('repair system')
// Returns: requiresApproval=true

// In Auto Mode
ai.setMode('auto')
resp = await ai.processMessage('repair system')
// Returns: requiresApproval=true (high-risk always requires approval)

// Low-risk operation in Auto Mode
resp = await ai.processMessage('optimize memory')
// Returns: requiresApproval=false (can auto-execute)
```

### Conversation History
```typescript
const ai = new AIEngine()

// Have conversation
await ai.processMessage('what can you do?')
await ai.processMessage('optimize my system')
await ai.processMessage('thank you')

// Get history
const history = ai.getConversationHistory()
console.log(`Conversation messages: ${history.length}`)

// Clear history
ai.clearConversationHistory()
```

## Intent Examples

### Monitoring
```
Input: "check CPU"
Output: message about CPU metrics, action='get-cpu-info'
```

### Optimization
```
Input: "make it faster"
Output: explanation of optimization, requiresApproval=true
```

### Repair
```
Input: "fix my system"
Output: explanation of repair, riskLevel='high', requiresApproval=true
```

### Security
```
Input: "harden security"
Output: security hardening explanation, riskLevel='medium'
```

### Help
```
Input: "what can you do?"
Output: comprehensive help message with capabilities
```

## Testing
- Unit tests in: `src/**/__tests__/ai-engine.test.ts`
- Coverage target: > 90%
- Test cases:
  - Intent recognition
  - Risk assessment
  - Approval determination
  - Error handling
  - Message persistence
  - Conversation history

## Future Improvements (Phase 2+)
- Ollama integration for local LLMs
- Machine learning model for intent classification
- Context-aware responses
- Multi-turn conversation support
- System state integration in responses
- Predictive suggestions
- Natural language understanding improvements
- Multi-language support
- Voice input integration

## Related Documentation
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - System architecture
- [DEVELOPMENT.md](../../DEVELOPMENT.md) - Development guide
- [SystemMonitor Engine](./monitor.md) - Metrics engine

// ============================================================
// Agent Memory & Knowledge Layer
// Stores conversations, decisions, context, and learned information
// The agent can query memory before taking actions
// ============================================================

export interface MemoryEntry {
  id: number;
  type: 'conversation' | 'decision' | 'context' | 'knowledge' | 'workflow' | 'tool_result';
  content: string;
  timestamp: string;
  tags: string[];
  source: string;
}

let memoryStore: MemoryEntry[] = [];
let nextMemoryId = 1;

// ============================================================
// Memory Operations
// ============================================================

export function remember(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): MemoryEntry {
  const newEntry: MemoryEntry = {
    ...entry,
    id: nextMemoryId++,
    timestamp: new Date().toISOString(),
  };
  memoryStore.push(newEntry);
  // Keep last 500 entries for performance
  if (memoryStore.length > 500) {
    memoryStore = memoryStore.slice(-500);
  }
  return newEntry;
}

export function recall(query: string): MemoryEntry[] {
  const q = query.toLowerCase();
  return memoryStore.filter(entry =>
    entry.content.toLowerCase().includes(q) ||
    entry.tags.some(t => t.toLowerCase().includes(q)) ||
    entry.source.toLowerCase().includes(q) ||
    entry.type.toLowerCase().includes(q)
  ).slice(-20); // Most recent 20 matches
}

export function recallRecent(limit = 10): MemoryEntry[] {
  return memoryStore.slice(-limit);
}

export function recallByType(type: MemoryEntry['type']): MemoryEntry[] {
  return memoryStore.filter(e => e.type === type).slice(-20);
}

export function clearMemory(): void {
  memoryStore = [];
}

// ============================================================
// Context Management
// ============================================================

let conversationContext: { role: 'user' | 'agent' | 'system'; content: string; timestamp: string }[] = [];

export function addContext(role: 'user' | 'agent' | 'system', content: string): void {
  conversationContext.push({ role, content, timestamp: new Date().toISOString() });
  // Keep last 50 messages
  if (conversationContext.length > 50) {
    conversationContext = conversationContext.slice(-50);
  }
}

export function getContext(): typeof conversationContext {
  return conversationContext;
}

export function clearContext(): void {
  conversationContext = [];
}

// ============================================================
// Knowledge Base for Agent
// ============================================================

export interface KnowledgeItem {
  topic: string;
  content: string;
  source: string;
  confidence: number; // 0-1
}

let knowledgeBase: KnowledgeItem[] = [
  {
    topic: 'project management methodology',
    content: 'The system supports full project lifecycle: planning, task creation, assignment, execution, review, and closeout. Workflows should follow: Goal → Plan → Tasks → Assignments → Execution → Review → Closeout.',
    source: 'system',
    confidence: 1,
  },
  {
    topic: 'agent architecture',
    content: 'Multiple specialized agents are available: Project Manager (plans & coordinates), Developer (writes code), QA (tests), Documentation (writes docs), DevOps (deploys), Research (investigates). All agents use same tool registry.',
    source: 'system',
    confidence: 1,
  },
  {
    topic: 'permission system',
    content: 'Tools have 4 permission levels: read, write, admin, destructive. Destructive actions (delete project/task) require explicit approval.',
    source: 'system',
    confidence: 1,
  },
  {
    topic: 'tool usage',
    content: 'Agents can use any tool from the registry. Each tool has parameters and permissions. The agent should prefer using tools over generating static responses when actions are needed.',
    source: 'system',
    confidence: 1,
  },
];

export function learnKnowledge(item: Omit<KnowledgeItem, 'confidence'>): void {
  knowledgeBase.push({ ...item, confidence: 0.5 });
}

export function queryKnowledge(topic: string): KnowledgeItem[] {
  const q = topic.toLowerCase();
  return knowledgeBase.filter(k =>
    k.topic.toLowerCase().includes(q) ||
    k.content.toLowerCase().includes(q)
  ).sort((a, b) => b.confidence - a.confidence);
}

export function getAllKnowledge(): KnowledgeItem[] {
  return knowledgeBase;
}
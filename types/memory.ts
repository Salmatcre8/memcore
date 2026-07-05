export type MemorySourceType =
  | "meeting"
  | "decision"
  | "pull_request"
  | "issue"
  | "document"
  | "message"
  | "person";

export interface MemoryNode {
  id: string;
  type: MemorySourceType;
  title: string;
  summary: string;
  timestamp: string; // ISO date
  source: string; // e.g. "Slack #backend", "GitHub", "Notion"
  participants?: string[];
  tags?: string[];
}

export interface MemorySearchResult extends MemoryNode {
  relevance: number; // 0-1
  excerpt: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: string; // e.g. "led to", "implemented by", "documented in"
}

export interface KnowledgeGraph {
  nodes: MemoryNode[];
  edges: GraphEdge[];
}

export interface Decision {
  id: string;
  title: string;
  summary: string;
  reasoning: string;
  timestamp: string;
  peopleInvolved: string[];
  relatedDocumentIds: string[];
  relatedMeetingIds: string[];
  status: "active" | "superseded" | "revisited";
}

export interface TimelineGroup {
  label: "Today" | "Yesterday" | "Last Week" | "Last Month" | "Earlier";
  items: MemoryNode[];
}

export interface ExplainResponse {
  question: string;
  answer: string;
  reasoningSteps: string[];
  sources: MemoryNode[];
}

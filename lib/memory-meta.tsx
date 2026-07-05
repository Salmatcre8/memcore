import {
  Video,
  GitCommitVertical,
  GitPullRequest,
  CircleDot,
  FileText,
  MessageSquare,
  UserRound,
  LucideIcon,
} from "lucide-react";
import { MemorySourceType } from "@/types/memory";

interface MemoryTypeMeta {
  label: string;
  icon: LucideIcon;
  tone: "emerald" | "cyan" | "neutral";
}

export const MEMORY_TYPE_META: Record<MemorySourceType, MemoryTypeMeta> = {
  meeting: { label: "Meeting", icon: Video, tone: "cyan" },
  decision: { label: "Decision", icon: GitCommitVertical, tone: "emerald" },
  pull_request: { label: "Pull Request", icon: GitPullRequest, tone: "emerald" },
  issue: { label: "Issue", icon: CircleDot, tone: "neutral" },
  document: { label: "Document", icon: FileText, tone: "cyan" },
  message: { label: "Message", icon: MessageSquare, tone: "neutral" },
  person: { label: "Person", icon: UserRound, tone: "neutral" },
};

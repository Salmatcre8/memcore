import { KnowledgeGraphView } from "@/features/graph/knowledge-graph";

export default function GraphPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-[26px] text-warmwhite">Knowledge Graph</h1>
        <p className="mt-1 text-[13.5px] text-muted">
          Every memory connects to another. Hover a node to trace it through your team&apos;s history.
        </p>
      </div>
      <KnowledgeGraphView />
    </div>
  );
}

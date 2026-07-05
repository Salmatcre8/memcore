import { TimelineView } from "@/features/timeline/timeline-view";

export default function TimelinePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-[26px] text-warmwhite">Memory Timeline</h1>
        <p className="mt-1 text-[13.5px] text-muted">
          A chronological record of everything your team has discussed, decided, and shipped.
        </p>
      </div>
      <TimelineView />
    </div>
  );
}

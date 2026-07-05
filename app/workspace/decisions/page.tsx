import { DecisionsView } from "@/features/decisions/decisions-view";

export default function DecisionsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-[26px] text-warmwhite">Decision Explorer</h1>
        <p className="mt-1 text-[13.5px] text-muted">
          Not just what was decided — why, by whom, and what it touched.
        </p>
      </div>
      <DecisionsView />
    </div>
  );
}

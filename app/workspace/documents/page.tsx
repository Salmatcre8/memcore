import { DocumentsView } from "@/features/documents/documents-view";

export default function DocumentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-[26px] text-warmwhite">Documents</h1>
        <p className="mt-1 text-[13.5px] text-muted">
          Everything MemCore has ingested, and a place to add more.
        </p>
      </div>
      <DocumentsView />
    </div>
  );
}

import { SearchExperience } from "@/features/search/search-experience";

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return <SearchExperience initialQuery={searchParams.q ?? ""} />;
}

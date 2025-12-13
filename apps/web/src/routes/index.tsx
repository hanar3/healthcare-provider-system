import { SearchHeader } from "@/components/search-header";
import { SearchHero } from "@/components/search-hero";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="min-h-screen bg-white">
      <SearchHeader />
      <SearchHero />
    </div>
  );
}

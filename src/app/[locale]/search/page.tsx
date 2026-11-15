import MobileSearch from "@/features/catalog/mobile-search";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string; audience?: string }>;
}) {
  const q = await searchParams;
  const category: Record<string, string> = {
    speech: "communication",
    learning: "development",
    child: "psychology",
    parent: "psychology",
    ergo: "mobility",
  };
  return (
    <MobileSearch
      category={category[q.specialty ?? ""] ?? ""}
      adult={q.audience === "adult" || q.specialty === "parent"}
    />
  );
}

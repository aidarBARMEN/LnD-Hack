import { SearchScreen } from "@/features/revision/search";
import {
  sections,
  specialties,
  type Section,
} from "@/features/revision/service";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; specialty?: string }>;
}) {
  const q = await searchParams;
  return (
    <SearchScreen
      initialSection={
        q.section && q.section in sections
          ? (q.section as Section)
          : "specialist"
      }
      initialSpecialty={
        q.specialty && q.specialty in specialties ? q.specialty : ""
      }
    />
  );
}

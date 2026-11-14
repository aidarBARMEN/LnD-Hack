import { ListingScreen } from "@/features/revision/search";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ListingScreen id={(await params).id} />;
}

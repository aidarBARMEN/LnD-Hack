import { ChatsScreen } from "@/features/revision/interactions";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ChatsScreen id={(await params).id} />;
}

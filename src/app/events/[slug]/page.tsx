import { getEvent } from "@/lib/events";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const event = await getEvent(slug);
  return (
    <>
      <p>Event Name: {event?.name}</p>
    </>
  );
}

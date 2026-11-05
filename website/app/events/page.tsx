import { EventsList } from "./_components/events-list";
import { fetchPublishedEventsServer } from "@/utils/api/events";
import { pageMetadata, buildOgImageUrl } from "@/utils/seo";

export const metadata = pageMetadata({
  title: "События",
  description:
    "Мероприятия агентства Rovno.dev — воркшопы, митапы и конференции для IT-сообщества.",
  path: "/events",
  ogImage: buildOgImageUrl("События", "Rovno.dev"),
});

export const revalidate = 60;

export default async function EventsPage() {
  const events = await fetchPublishedEventsServer();
  return <EventsList events={events} />;
}

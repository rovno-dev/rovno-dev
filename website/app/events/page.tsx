import { EventsList } from "./_components/events-list";
import { fetchPublishedEventsServer } from "@/utils/api/events";

export const revalidate = 60;

export const metadata = {
  title: "События · Rovno.dev",
  description:
    "Мероприятия агентства Rovno.dev — воркшопы, митапы, конференции для IT-сообщества.",
};

export default async function EventsPage() {
  const events = await fetchPublishedEventsServer();
  return <EventsList events={events} />;
}

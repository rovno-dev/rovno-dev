"use client";
import { use, useEffect, useState } from "react";
import { CheckUser } from "@/entities/user/model/check-user";
import { EventEditorForm } from "@/components/editor/event-editor-form";
import { Card } from "@/components/ui/card";
import { CircleNotchIcon, WarningIcon } from "@phosphor-icons/react";
import { fetchAdminEvent, type EventDetail } from "@/utils/api/events";

export default function EditEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAdminEvent(slug)
      .then((e) => {
        if (!e) setError("Событие не найдено");
        else setEvent(e);
      })
      .catch((err) => setError(err?.message || "Ошибка"))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <CheckUser>
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center gap-2 text-body-3 text-(--on-bg-low)">
          <CircleNotchIcon className="size-4 animate-spin" />
          Загрузка…
        </div>
      ) : event ? (
        <EventEditorForm initial={event} />
      ) : (
        <Card className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-6 max-w-2xl">
          <div className="flex items-start gap-4">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500 shrink-0">
              <WarningIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-heading-4 mb-1">{error || "Не найдено"}</h2>
              <code className="text-body-5 font-mono text-(--on-bg-low)">{slug}</code>
            </div>
          </div>
        </Card>
      )}
    </CheckUser>
  );
}

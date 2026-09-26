"use client";
import { CheckUser } from "@/entities/user/model/check-user";
import { EventEditorForm } from "@/components/editor/event-editor-form";

export default function NewEventPage() {
  return (
    <CheckUser>
      <EventEditorForm />
    </CheckUser>
  );
}

"use client";

import { CheckUser } from "@/entities/user/model/check-user";
import { ProjectEditorForm } from "@/components/editor/project-editor-form";

export default function NewProjectPage() {
  return (
    <CheckUser>
      <ProjectEditorForm />
    </CheckUser>
  );
}

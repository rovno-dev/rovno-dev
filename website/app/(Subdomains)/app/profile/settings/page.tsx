"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/entities/user/model/user-context";
import { CheckUser } from "@/entities/user/model/check-user";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ProfileSidebar } from "@/app/(Subdomains)/app/_components/profile-sidebar";
import { Field, FieldLabel } from "@/components/ui/field";

export default function SettingsPage() {
  const { user, isLoading } = useUser();
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // In a real app, fetch the subscription preference from the user object or an API.
    // For now, just a placeholder.
    setEmailSubscribed(user?.email_subscribed || false);
  }, [user]);

  if (isLoading || !user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: implement API call to update email subscription preference
      toast.success("Настройки сохранены");
    } catch {
      toast.error("Ошибка при сохранении");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CheckUser>
      <div className="min-h-screen bg-(--bg) py-12 md:py-16">
        <Container>
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            <ProfileSidebar />
            <main className="flex-1 space-y-6">
              <div>
                <h1 className="text-display-2 font-serif italic tracking-tight mb-1">
                  Настройки
                </h1>
                <p className="text-body-2 text-(--on-bg-medium)">
                  Управление настройками аккаунта
                </p>
              </div>
              <Card className="rounded-3xl border-(--outline) p-6 shadow-sm">
                <h2 className="text-heading-3 mb-4">Подписки</h2>
                <Field orientation="horizontal" className="items-center">
                  <Checkbox
                    id="email-subscription"
                    checked={emailSubscribed}
                    onCheckedChange={(checked) => setEmailSubscribed(checked === true)}
                  />
                  <Label htmlFor="email-subscription" className="text-body-3">
                    Получать email-рассылки о новых проектах, статьях и акциях
                  </Label>
                </Field>
                <div className="mt-6">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Сохранение..." : "Сохранить настройки"}
                  </Button>
                </div>
              </Card>
            </main>
          </div>
        </Container>
      </div>
    </CheckUser>
  );
}

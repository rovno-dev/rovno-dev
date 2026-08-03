import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RD Фейк АПИ",
  description: "Fake API для любой тестовой или образовательной задачи",
};

export default function FakeApiRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}

import type { Metadata } from "next";
import { headers } from "next/headers";
import { DemoProvider } from "@/ui/demo-shell";
import "./globals.css";
import "./brand.css";
import "./family.css";
import "./messenger.css";
import "./onboarding.css";
export const metadata: Metadata = {
  title: "Бірге — поддержка семьи",
  description: "Помощь ребёнку и время для мамы. Учебный прототип.",
};
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = (await headers()).get("x-mama-locale") === "kk" ? "kk" : "ru";
  return (
    <html lang={locale}>
      <body>
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}

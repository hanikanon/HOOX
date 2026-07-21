import { createFileRoute } from "@tanstack/react-router";
import { SettingsApp } from "@/components/settings/SettingsApp";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Hoox" },
      { name: "description", content: "Appearance, account, privacy and notification settings." },
    ],
  }),
  component: SettingsApp,
});

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConversationView } from "@/components/dashboard/inbox/ConversationView";
import { isLocale } from "@/i18n/config";
import { getDashboardDictionary } from "@/i18n/dashboard";
import { getConversation, getWorkspace } from "@/lib/dashboard/repository";
import { getTenantContext } from "@/lib/dashboard/tenant";

// Rendered on request: which conversations exist depends on who is signed in. Unknown ids get a 404.
type Props = { params: Promise<{ locale: string; conversationId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDashboardDictionary(locale).inbox.title };
}

export default async function ConversationPage({ params }: Props) {
  const { locale, conversationId } = await params;
  if (!isLocale(locale)) notFound();
  const ctx = await getTenantContext();
  const [detail, workspace] = await Promise.all([getConversation(ctx, conversationId), getWorkspace(ctx)]);
  if (!detail) notFound();
  const t = getDashboardDictionary(locale);

  const lookups = {
    members: Object.fromEntries(workspace.members.map((m) => [m.id, m.name[locale]])),
    branches: Object.fromEntries(workspace.branches.map((b) => [b.id, b.name[locale]])),
    services: Object.fromEntries(workspace.services.map((s) => [s.id, { name: s.name[locale], price: s.priceSar }])),
  };

  return <ConversationView key={conversationId} locale={locale} t={t.inbox} common={t.common} detail={detail} lookups={lookups} now={workspace.now} />;
}

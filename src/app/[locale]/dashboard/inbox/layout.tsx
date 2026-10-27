import { notFound } from "next/navigation";
import { InboxFrame } from "@/components/dashboard/inbox/InboxFrame";
import { isLocale } from "@/i18n/config";
import { getDashboardDictionary } from "@/i18n/dashboard";
import { getWorkspace, listConversations } from "@/lib/dashboard/repository";
import { getTenantContext } from "@/lib/dashboard/tenant";

export default async function InboxLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDashboardDictionary(locale);
  const ctx = await getTenantContext();
  const [workspace, summaries] = await Promise.all([getWorkspace(ctx), listConversations(ctx)]);
  const branchNames = Object.fromEntries(workspace.branches.map((b) => [b.id, b.name[locale]]));

  return (
    <InboxFrame locale={locale} t={t.inbox} common={t.common} summaries={summaries} branchNames={branchNames} now={workspace.now}>
      {children}
    </InboxFrame>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { isLocale } from "@/i18n/config";
import { getDashboardDictionary } from "@/i18n/dashboard";
import { getTenantContext } from "@/lib/dashboard/tenant";
import { getWorkspace, listConversations } from "@/lib/dashboard/repository";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDashboardDictionary(locale);
  const brand = locale === "ar" ? "طلاقة" : "Talaqa";
  return {
    title: { default: `${t.meta.title} — ${brand}`, template: `%s · ${t.meta.title} — ${brand}` },
    // A private area: never indexed, never in the sitemap.
    robots: { index: false, follow: false },
    alternates: { canonical: null, languages: {} },
  };
}

/**
 * Signed-in clients see their own business (getTenantContext() verifies the
 * Supabase session; row-level security checks every read again). Everyone
 * else sees the sample business, labelled as sample data on every screen.
 * src/proxy.ts only keeps the session fresh; it never redirects.
 */
export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDashboardDictionary(locale);
  const ctx = await getTenantContext();
  const [workspace, conversations] = await Promise.all([getWorkspace(ctx), listConversations(ctx)]);
  const waiting = conversations.filter((c) => c.status === "handover").length;
  const member = workspace.members.find((m) => m.id === ctx.memberId);
  const account =
    ctx.source === "supabase" ? { id: ctx.memberId, name: member?.name[locale] ?? t.common.roles[ctx.role], role: t.common.roles[ctx.role] } : null;
  const scope = ctx.branchIds === "all" ? t.shell.allBranches : workspace.branches.map((b) => b.name[locale]).join(locale === "ar" ? "، " : ", ");

  return (
    <DashboardShell
      locale={locale}
      t={t.shell}
      sample={ctx.source === "sample"}
      businessName={workspace.business.name[locale]}
      scope={scope}
      waiting={waiting}
      account={account}
    >
      {children}
    </DashboardShell>
  );
}

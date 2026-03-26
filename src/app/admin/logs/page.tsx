import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminAllowedEmails } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export default async function AdminLogsPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const allowed = getAdminAllowedEmails();
  if (allowed.length > 0) {
    const email = user.email?.trim().toLowerCase();
    if (!email || !allowed.includes(email)) {
      redirect("/login");
    }
  }

  let byCountryRows: { country: string; count: number }[] = [];
  let recentVisits: { id: string; country: string | null; ip: string | null; createdAt: Date }[] = [];

  try {
    const [grouped, visits] = await Promise.all([
      prisma.visit.groupBy({
        by: ["country"],
        _count: { _all: true },
      }),
      prisma.visit.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        select: { id: true, country: true, ip: true, createdAt: true },
      }),
    ]);
    byCountryRows = grouped
      .map((r) => ({ country: r.country ?? "Unknown", count: r._count._all }))
      .sort((a, b) => b.count - a.count);
    recentVisits = visits;
  } catch {
    // Visit model may be missing from Prisma client until "npx prisma generate" is run
  }

  const total = byCountryRows.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-sm uppercase tracking-wider text-white/70 hover:text-accent"
          >
            ← Admin
          </Link>
          <h1 className="text-3xl font-extrabold uppercase tracking-wide">Logs</h1>
        </div>
      </div>

      <p className="text-sm text-white/70">
        Data we collect when visitors choose &quot;Accept all&quot;: one visit per session, with approximate country and IP.
      </p>

      <section className="space-y-3 border border-white/20 p-5">
        <h2 className="text-xl font-bold uppercase tracking-wide">Summary</h2>
        <p className="text-white/90">
          Total recorded visits: <strong>{total}</strong>
        </p>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">By country</h3>
        <ul className="flex flex-wrap gap-2">
          {byCountryRows.map(({ country, count }) => (
            <li key={country} className="border border-white/30 px-3 py-1.5 text-sm">
              <span className="font-medium">{country}</span> <span className="text-white/70">{count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 border border-white/20 p-5">
        <h2 className="text-xl font-bold uppercase tracking-wide">Recent visits</h2>
        <p className="text-sm text-white/70">Last 200 records (newest first).</p>
        {recentVisits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/30">
                  <th className="pb-2 pr-4 font-semibold uppercase tracking-wider">Date</th>
                  <th className="pb-2 pr-4 font-semibold uppercase tracking-wider">Country</th>
                  <th className="pb-2 font-semibold uppercase tracking-wider">IP</th>
                </tr>
              </thead>
              <tbody className="text-white/90">
                {recentVisits.map((v) => (
                  <tr key={v.id} className="border-b border-white/10">
                    <td className="py-2 pr-4 text-white/80">
                      {new Date(v.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4">{v.country ?? "—"}</td>
                    <td className="py-2 font-mono text-white/70">{v.ip ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-white/70">No visits recorded yet.</p>
        )}
      </section>
    </div>
  );
}

import Link from "next/link";
import { Boxes, LogIn } from "lucide-react";
import SocialLinks from "@/components/SocialLinks";
import { getDashboardLoginUrl } from "@/lib/domains";

type Props = {
  companyName: string;
  logoUrl: string | null;
  socialLinks: Record<string, string | null | undefined>;
  dashboardUrl?: string;
};

export default function VetrinaHeader({
  companyName,
  logoUrl,
  socialLinks,
  dashboardUrl = getDashboardLoginUrl(),
}: Props) {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-10 w-10 rounded-xl object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Boxes size={20} />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{companyName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Stampe 3D su misura</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/"
              className="rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/catalogo"
              className="rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Catalogo
            </Link>
          </nav>
          <SocialLinks links={socialLinks} />
          <a
            href={dashboardUrl}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <LogIn size={16} />
            Accedi alla Dashboard
          </a>
        </div>
      </div>
    </header>
  );
}

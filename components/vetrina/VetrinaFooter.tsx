import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";

type Props = {
  companyName: string;
  socialLinks: Record<string, string | null | undefined>;
};

export default function VetrinaFooter({ companyName, socialLinks }: Props) {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:px-6">
        <SocialLinks links={socialLinks} />
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/privacy" className="hover:text-slate-800 dark:hover:text-slate-200">
            Privacy Policy
          </Link>
          <Link href="/cookie" className="hover:text-slate-800 dark:hover:text-slate-200">
            Cookie Policy
          </Link>
          <Link href="/catalogo" className="hover:text-slate-800 dark:hover:text-slate-200">
            Catalogo
          </Link>
        </nav>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} {companyName}
        </p>
      </div>
    </footer>
  );
}

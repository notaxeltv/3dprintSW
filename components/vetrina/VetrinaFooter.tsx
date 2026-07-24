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
        <p className="text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} {companyName}
        </p>
      </div>
    </footer>
  );
}

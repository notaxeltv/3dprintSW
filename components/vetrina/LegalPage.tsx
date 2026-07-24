import Link from "next/link";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function LegalPage({ title, children }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-slate-800 dark:hover:text-slate-200">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>{title}</span>
      </nav>
      <article className="space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-slate-900 [&_h1]:dark:text-slate-100 [&_h2]:pt-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:dark:text-slate-100 [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:dark:text-slate-200 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:dark:bg-slate-800 [&_a]:font-medium [&_a]:text-indigo-600 [&_a]:hover:underline [&_a]:dark:text-indigo-400 [&_.lead]:text-base [&_.lead]:text-slate-700 [&_.lead]:dark:text-slate-200">
        <h1>{title}</h1>
        {children}
      </article>
    </div>
  );
}

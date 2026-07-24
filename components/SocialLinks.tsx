import {
  SOCIAL_NETWORKS,
  pickActiveSocialLinks,
  type SocialLinks as SocialLinksData,
} from "@/lib/social";
import SocialIcon from "@/components/SocialIcon";

type Props = {
  links: SocialLinksData;
  className?: string;
};

export default function SocialLinks({ links, className = "" }: Props) {
  const active = pickActiveSocialLinks(links);
  if (active.length === 0) return null;

  const labelByKey = Object.fromEntries(SOCIAL_NETWORKS.map((n) => [n.key, n.label]));

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      {active.map(({ key, href }) => (
        <a
          key={key}
          href={href}
          target={key === "email" ? undefined : "_blank"}
          rel={key === "email" ? undefined : "noopener noreferrer"}
          aria-label={labelByKey[key]}
          title={labelByKey[key]}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
        >
          <SocialIcon network={key} />
        </a>
      ))}
    </div>
  );
}

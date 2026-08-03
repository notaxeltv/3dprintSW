export type SocialLinkKey =
  | "instagramUrl"
  | "facebookUrl"
  | "tiktokUrl"
  | "youtubeUrl"
  | "whatsappUrl"
  | "telegramUrl"
  | "linkedinUrl"
  | "xUrl"
  | "websiteUrl"
  | "email";

export type SocialLinks = Partial<Record<SocialLinkKey, string | null>>;

export const SOCIAL_NETWORKS: {
  key: SocialLinkKey;
  label: string;
  placeholder: string;
  hint?: string;
}[] = [
  {
    key: "instagramUrl",
    label: "Instagram",
    placeholder: "https://instagram.com/tuaazienda",
  },
  {
    key: "facebookUrl",
    label: "Facebook",
    placeholder: "https://facebook.com/tuaazienda",
  },
  {
    key: "tiktokUrl",
    label: "TikTok",
    placeholder: "https://tiktok.com/@tuaazienda",
  },
  {
    key: "youtubeUrl",
    label: "YouTube",
    placeholder: "https://youtube.com/@tuaazienda",
  },
  {
    key: "whatsappUrl",
    label: "WhatsApp",
    placeholder: "+39 333 1234567 oppure https://wa.me/393331234567",
    hint: "Numero di telefono o link wa.me",
  },
  {
    key: "telegramUrl",
    label: "Telegram",
    placeholder: "https://t.me/tuaazienda",
  },
  {
    key: "linkedinUrl",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/company/tuaazienda",
  },
  {
    key: "xUrl",
    label: "X (Twitter)",
    placeholder: "https://x.com/tuaazienda",
  },
  {
    key: "websiteUrl",
    label: "Sito web",
    placeholder: "https://www.tuaazienda.it",
  },
  {
    key: "email",
    label: "Email",
    placeholder: "info@tuaazienda.it",
    hint: "Indirizzo email o link mailto:",
  },
];

export function emptySocialLinks(): Record<SocialLinkKey, string> {
  return {
    instagramUrl: "",
    facebookUrl: "",
    tiktokUrl: "",
    youtubeUrl: "",
    whatsappUrl: "",
    telegramUrl: "",
    linkedinUrl: "",
    xUrl: "",
    websiteUrl: "",
    email: "",
  };
}

export function socialLinksFromSettings(settings: SocialLinks): Record<SocialLinkKey, string> {
  const base = emptySocialLinks();
  for (const { key } of SOCIAL_NETWORKS) {
    base[key] = settings[key]?.trim() ?? "";
  }
  return base;
}

export function pickActiveSocialLinks(links: SocialLinks): { key: SocialLinkKey; href: string }[] {
  return SOCIAL_NETWORKS.flatMap(({ key }) => {
    const href = resolveSocialHref(key, links[key]);
    return href ? [{ key, href }] : [];
  });
}

export function resolveSocialHref(key: SocialLinkKey, raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;

  if (key === "email") {
    if (value.startsWith("mailto:")) return value;
    if (value.includes("@")) return `mailto:${value}`;
    return null;
  }

  if (key === "whatsappUrl") {
    if (/^https?:\/\//i.test(value)) return value;
    const digits = value.replace(/\D/g, "");
    if (!digits) return null;
    return `https://wa.me/${digits}`;
  }

  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("www.")) return `https://${value}`;

  return null;
}

export function normalizeSocialLinksInput(links: SocialLinks): Record<SocialLinkKey, string | null> {
  const result = {} as Record<SocialLinkKey, string | null>;
  for (const { key } of SOCIAL_NETWORKS) {
    const value = links[key]?.trim() ?? "";
    result[key] = value || null;
  }
  return result;
}

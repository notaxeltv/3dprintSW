import type { SocialLinkKey } from "@/lib/social";

type Props = {
  network: SocialLinkKey;
  className?: string;
};

export default function SocialIcon({ network, className = "h-[18px] w-[18px]" }: Props) {
  switch (network) {
    case "instagramUrl":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.3.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.5.3 1.1.4 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.3-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.5.2-1.1.3-2.3.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.3-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.5-.3-1.1-.4-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.3.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.5-.2 1.1-.3 2.3-.4C8.4 2.2 8.8 2.2 12 2.2M12 0C8.7 0 8.3 0 7 .1 5.7.1 4.8.3 4 .7c-.8.3-1.5.8-2.1 1.4C1.3 2.7.8 3.4.5 4.2.1 5 .0 5.9 0 7.2.0 8.5 0 8.9 0 12s0 3.5.1 4.8c.1 1.3.3 2.2.7 3 .3.8.8 1.5 1.4 2.1.6.6 1.3 1.1 2.1 1.4.8.4 1.7.6 3 .7 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1.3-.1 2.2-.3 3-.7.8-.3 1.5-.8 2.1-1.4.6-.6 1.1-1.3 1.4-2.1.4-.8.6-1.7.7-3 .1-1.3.1-1.7.1-4.8s0-3.5-.1-4.8c-.1-1.3-.3-2.2-.7-3-.3-.8-.8-1.5-1.4-2.1C21.3 1.3 20.6.8 19.8.5 19 .1 18.1 0 16.8 0 15.5 0 15.1 0 12 0z" />
          <path d="M12 5.8A6.2 6.2 0 1 0 12 18.2 6.2 6.2 0 0 0 12 5.8m0 10.2A4 4 0 1 1 12 7.8a4 4 0 0 1 0 8.2M19.8 4.6a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0" />
        </svg>
      );
    case "facebookUrl":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M24 12.1c0-6.1-4.9-11-11-11S2 6 2 12.1c0 5.5 4 10.1 9.3 10.9v-7.7H7.9v-3.2h3.4V9.8c0-3.4 2-5.3 5.1-5.3 1.5 0 3 .3 3 .3v3.3h-1.7c-1.7 0-2.2 1-2.2 2.1v2.5h3.8l-.6 3.2h-3.2V23C20 22.2 24 17.6 24 12.1" />
        </svg>
      );
    case "tiktokUrl":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      );
    case "youtubeUrl":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.6 15.4V8.6L15.8 12l-6.2 3.4z" />
        </svg>
      );
    case "whatsappUrl":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.2-.8.9-1 .9-.2 0-.5 0-1.6-.6-3-.8-4.9-3.4-5.1-3.6-.2-.2-.4-.5 0-.9.1-.1.3-.3.4-.5.1-.2.2-.2.3-.4.1-.1.1-.3 0-.4 0-.1-.7-1.7-1-2.3-.3-.6-.6-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.2.2-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3 0-.1-.2-.2-.5-.3z" />
          <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4A9.9 9.9 0 0 0 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 0 1 3.8 12c0-4.5 3.7-8.2 8.2-8.2S20.2 7.5 20.2 12 16.5 20.2 12 20.2z" />
        </svg>
      );
    case "telegramUrl":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.6 6.8-1.8 8.5c-.1.5-.4.6-.8.4l-2.2-1.6-1.1 1.1c-.1.1-.2.2-.5.2l.2-2.8 4.1-3.7c.2-.2 0-.3-.2-.1l-5.1 3.2-2.2-.7c-.5-.1-.5-.5.1-.8l8.6-3.3c.4-.2.8.1.7.6z" />
        </svg>
      );
    case "linkedinUrl":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3zM6.5 8.3A1.8 1.8 0 1 1 6.5 5a1.8 1.8 0 0 1 0 3.6zM19 19h-3v-4.6c0-1.1 0-2.5-1.5-2.5s-1.8 1.2-1.8 2.4V19h-3v-9h2.9v1.2h0a3.2 3.2 0 0 1 2.9-1.6c3.1 0 3.7 2 3.7 4.6V19z" />
        </svg>
      );
    case "xUrl":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.9 2H22l-6.8 7.8L23 22h-6.7l-5.2-6.8L5.4 22H2.3l7.3-8.4L1 2h6.9l4.7 6.2L18.9 2zm-1.2 18h1.7L7.1 3.9H5.3L17.7 20z" />
        </svg>
      );
    case "websiteUrl":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "email":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 6-10 7L2 6" />
        </svg>
      );
    default:
      return null;
  }
}

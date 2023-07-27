import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://blog.buatin.website/",
  author: "Andreas Asatera",
  desc: "Blog seputar tips dan trik dalam pembuatan website",
  title: "Buatin Website",
  ogImage: "buatin-website-og.png",
  lightAndDarkMode: true,
  postPerPage: 5,
};

export const LOCALE = ["en-EN"]; // set to [] to use the environment default

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/coziboy",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/andreas_asatera",
    linkTitle: `${SITE.title} on Twitter`,
    active: true,
  },
  {
    name: "Telegram",
    href: "https://t.me/buatin_website",
    linkTitle: `${SITE.title} on Telegram`,
    active: true,
  },
  {
    name: "Instagram",
    href: "https://instagr.am/eas.andreas",
    linkTitle: `${SITE.title} on Instagram`,
    active: true,
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/62881026173472",
    linkTitle: `${SITE.title} on WhatsApp`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/andreas-asatera",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Facebook",
    href: "https://fb.me/coziboy",
    linkTitle: `${SITE.title} on Facebook`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:tolong@buatin.website",
    linkTitle: `Send an email to ${SITE.title}`,
    active: true,
  },
  {
    name: "Twitch",
    href: "",
    linkTitle: `${SITE.title} on Twitch`,
    active: false,
  },
  {
    name: "YouTube",
    href: "",
    linkTitle: `${SITE.title} on YouTube`,
    active: false,
  },
  {
    name: "Snapchat",
    href: "",
    linkTitle: `${SITE.title} on Snapchat`,
    active: false,
  },
  {
    name: "Pinterest",
    href: "",
    linkTitle: `${SITE.title} on Pinterest`,
    active: false,
  },
  {
    name: "TikTok",
    href: "",
    linkTitle: `${SITE.title} on TikTok`,
    active: false,
  },
  {
    name: "CodePen",
    href: "",
    linkTitle: `${SITE.title} on CodePen`,
    active: false,
  },
  {
    name: "Discord",
    href: "",
    linkTitle: `${SITE.title} on Discord`,
    active: false,
  },
  {
    name: "GitLab",
    href: "",
    linkTitle: `${SITE.title} on GitLab`,
    active: false,
  },
  {
    name: "Reddit",
    href: "",
    linkTitle: `${SITE.title} on Reddit`,
    active: false,
  },
  {
    name: "Skype",
    href: "",
    linkTitle: `${SITE.title} on Skype`,
    active: false,
  },
  {
    name: "Steam",
    href: "",
    linkTitle: `${SITE.title} on Steam`,
    active: false,
  },
  {
    name: "Mastodon",
    href: "",
    linkTitle: `${SITE.title} on Mastodon`,
    active: false,
  },
];

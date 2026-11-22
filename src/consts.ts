import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "동호의 블로그",
  DESCRIPTION: "Slow and steady, with pleasure.",
  AUTHOR: "장동호",
  URL: "https://dongho.me",
  NUM_POSTS_ON_HOMEPAGE: 5,
};

export const HOME: Metadata = {
  TITLE: "홈",
  DESCRIPTION: "백엔드 개발자 장동호의 블로그입니다.",
};

export const POSTS: Metadata = {
  TITLE: "글",
  DESCRIPTION: "개발하면서 배우고 겪은 것들을 기록합니다.",
};

export const ABOUT: Metadata = {
  TITLE: "소개",
  DESCRIPTION: "백엔드 개발자를 꿈꾸는 장동호입니다.",
};

export const SOCIALS: Socials = [
  {
    NAME: "GitHub",
    HREF: "https://github.com/JangDongHo",
  },
  {
    NAME: "LinkedIn",
    HREF: "https://www.linkedin.com/in/DonghoJang/",
  },
];

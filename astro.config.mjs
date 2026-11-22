import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import pagefind from "astro-pagefind";
import tailwindcss from "@tailwindcss/vite";
import { unified } from "@astrojs/markdown-remark";
import remarkBreaks from "remark-breaks";
import remarkCallouts from "./src/lib/remark-callouts.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://dongho.me",
  integrations: [sitemap(), mdx(), pagefind()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    // Astro 7의 기본 마크다운 프로세서 대신 remark 플러그인을 쓸 수 있는 unified 파이프라인을 사용한다.
    // remarkCallouts 는 줄바꿈 문자를 보고 판단하므로 remarkBreaks 보다 먼저 와야 한다.
    processor: unified({
      remarkPlugins: [remarkCallouts, remarkBreaks],
    }),
    shikiConfig: {
      theme: "css-variables",
    },
  },
});

import { visit } from "unist-util-visit";

// `> [!note]` 같은 Obsidian 콜아웃 블록쿼트를 <div class="callout callout-*"> 로 바꾼다.
const TONES = {
  note: "note",
  info: "info",
  abstract: "info",
  summary: "info",
  todo: "info",
  tip: "tip",
  hint: "tip",
  important: "tip",
  success: "tip",
  check: "tip",
  done: "tip",
  warning: "warning",
  caution: "warning",
  attention: "warning",
  question: "warning",
  danger: "error",
  error: "error",
  failure: "error",
  fail: "error",
  bug: "error",
};

export default function remarkCallouts() {
  return (tree) => {
    visit(tree, "blockquote", (node) => {
      const first = node.children[0];
      if (first?.type !== "paragraph") return;
      const text = first.children[0];
      if (text?.type !== "text") return;

      const match = text.value.match(/^\[!([\w-]+)\][+-]?[ \t]*/);
      if (!match) return;

      // 마커만 있는 첫 줄(또는 첫 문단)은 제거한다. 뒤에 같은 줄 제목이 있으면 굵게 남긴다.
      const rest = text.value.slice(match[0].length);
      const newline = rest.indexOf("\n");
      const titleText = (newline === -1 ? rest : rest.slice(0, newline)).trim();
      const body = newline === -1 ? "" : rest.slice(newline + 1);

      if (titleText) {
        first.children.splice(0, 1, {
          type: "strong",
          children: [{ type: "text", value: titleText }],
        });
        if (body) first.children.splice(1, 0, { type: "text", value: "\n" + body });
      } else if (body) {
        text.value = body;
      } else {
        first.children.shift();
        if (first.children.length === 0) node.children.shift();
      }

      node.data = {
        hName: "div",
        hProperties: {
          className: ["callout", `callout-${TONES[match[1].toLowerCase()] ?? "note"}`],
        },
      };
    });
  };
}

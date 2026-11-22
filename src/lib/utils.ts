import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function readingTime(body: string) {
  // 코드 블록과 마크다운 문법을 걷어내고 공백 기준 단어 수로 읽는 시간을 추정한다.
  const text = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "");
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(wordCount / 200))}분`;
}

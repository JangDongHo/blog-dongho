#!/usr/bin/env node
// src/content/{posts,pages}/attachments 의 이미지를 public/ 아래로 복사한다.
// 글에서는 /posts/attachments/... 절대 경로로 참조하고, 복사본은 git에서 제외된다(.gitignore).
import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const name of ["posts", "pages"]) {
  const source = path.join(root, "src/content", name, "attachments");
  const target = path.join(root, "public", name, "attachments");

  try {
    await stat(source);
  } catch {
    continue;
  }

  await rm(target, { recursive: true, force: true });
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target, { recursive: true });
  console.log(`synced ${path.relative(root, source)} -> ${path.relative(root, target)}`);
}

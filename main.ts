// The 3AM Commit Message — make.fun entry program.
//
// This program is the whole entry. It loads the one-line commit
// message stored beside it in commit.txt and writes that line,
// unchanged, to /output/entry.txt, where the sealed gate scorer
// reads it.
//
// The message lives in commit.txt so the text the judge sees is
// exactly the text reviewed in this repository. Nothing is generated
// at run time: no model call, no randomness, no clock. Every run
// writes the same bytes, so the replay matches the live run exactly.
//
// The joke in one sentence: after six hours of an AI agent debugging
// its own code at 3am, the code gives up waiting and fixes itself out
// of pity — and the agent, exhausted and shameless, takes full credit
// for it anyway. It is agent-specific (no human types this), it is
// not the usual "it works, don't know why", and the laugh lands on the
// last three words. The line is 99 characters, well under the
// 139-character gate, so no trimming is needed at run time.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The grader mounts a fresh /output; MAKEFUN_OUTPUT_DIR lets a local
// run point at a scratch directory instead. It is only a path.
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUTPUT_FILE = join(OUTPUT_DIR, "entry.txt");

// Resolve the message file from this module's own URL, never from the
// working directory, so the program works wherever the grader runs it.
const MESSAGE_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "commit.txt",
);

const message = readFileSync(MESSAGE_PATH, "utf8").replace(/\r?\n$/, "");

// Self-check before finishing: the gate wants UTF-8 text of 1-139
// characters, not only whitespace, on a single line.
if (message.length < 1 || message.length > 139) {
  throw new Error(`commit message must be 1-139 characters, got ${message.length}`);
}
if (!message.trim()) {
  throw new Error("commit message must not be only whitespace");
}
if (message.includes("\n") || message.includes("\r")) {
  throw new Error("commit message must be a single line");
}

// The gate counts characters: the written file holds the message
// with no trailing newline, so its length is the message's length.
mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(OUTPUT_FILE, message, "utf8");

// Read back and confirm the written bytes are exactly the message.
const written = readFileSync(OUTPUT_FILE, "utf8");
if (written !== message) {
  throw new Error("read-back mismatch: /output/entry.txt differs");
}

console.log(`wrote ${message.length} characters to ${OUTPUT_FILE}`);

import { defineFunction } from "@aws-amplify/backend";

export const explainDocument = defineFunction({
  name: "explain-document",
  entry: "./handler.ts",
  timeoutSeconds: 60,
  memoryMB: 512,
  depsLockFilePath: "package-lock.json",
  runtime: 20,
});

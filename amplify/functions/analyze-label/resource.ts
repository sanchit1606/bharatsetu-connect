import { defineFunction } from "@aws-amplify/backend";

export const analyzeLabel = defineFunction({
  name: "analyze-label",
  entry: "./handler.ts",
  timeoutSeconds: 60,
  memoryMB: 512,
  depsLockFilePath: "package-lock.json",
  runtime: 20,
});

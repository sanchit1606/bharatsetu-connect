import { defineFunction } from "@aws-amplify/backend";

export const civicSense = defineFunction({
  name: "civic-sense",
  entry: "./handler.ts",
  timeoutSeconds: 60,
  memoryMB: 512,
  depsLockFilePath: "package-lock.json",
  runtime: 20,
});

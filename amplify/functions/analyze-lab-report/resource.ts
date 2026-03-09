import { defineFunction } from "@aws-amplify/backend";

export const analyzeLabReport = defineFunction({
  name: "analyze-lab-report",
  entry: "./handler.ts",
  timeoutSeconds: 60,
  memoryMB: 512,
  depsLockFilePath: "package-lock.json",
  runtime: 20,
});

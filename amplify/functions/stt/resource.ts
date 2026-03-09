import { defineFunction } from "@aws-amplify/backend";

export const stt = defineFunction({
  name: "stt",
  entry: "./handler.ts",
  timeoutSeconds: 30,
  memoryMB: 256,
  runtime: 20,
});

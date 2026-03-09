import { defineFunction } from "@aws-amplify/backend";

export const tts = defineFunction({
  name: "tts",
  entry: "./handler.ts",
  timeoutSeconds: 30,
  memoryMB: 256,
  runtime: 20,
});

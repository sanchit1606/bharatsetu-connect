import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function loadElevenLabsKey(): void {
  if (process.env.ELEVENLABS_API_KEY?.trim()) return;
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(__dirname, "..", ".env"),
  ];
  for (const envPath of candidates) {
    try {
      const content = fs.readFileSync(envPath, "utf8");
      const match = content.match(/^\s*ELEVENLABS_API_KEY\s*=\s*(.+?)\s*$/m);
      if (match) {
        const value = match[1].replace(/^["']|["']$/g, "").trim();
        if (value) process.env.ELEVENLABS_API_KEY = value;
        return;
      }
    } catch {
      // file missing or unreadable, try next
    }
  }
}
loadElevenLabsKey();

import { defineBackend } from "@aws-amplify/backend";
import { Stack } from "aws-cdk-lib";
import { AuthorizationType, Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { analyzeLabel } from "./functions/analyze-label/resource";
import { analyzeLabReport } from "./functions/analyze-lab-report/resource";
import { civicSense } from "./functions/civic-sense/resource";
import { explainDocument } from "./functions/explain-document/resource";
import { stt } from "./functions/stt/resource";
import { tts } from "./functions/tts/resource";

const backend = defineBackend({
  analyzeLabel,
  analyzeLabReport,
  civicSense,
  explainDocument,
  tts,
  stt,
});

const apiStack = backend.createStack("label-auditor-api");

const restApi = new RestApi(apiStack, "LabelAuditorApi", {
  restApiName: "LabelAuditorApi",
  deploy: true,
  deployOptions: { stageName: "dev" },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: Cors.DEFAULT_HEADERS,
  },
});

const analyzeResource = restApi.root.addResource("analyze-label");
analyzeResource.addMethod(
  "POST",
  new LambdaIntegration(backend.analyzeLabel.resources.lambda),
  { authorizationType: AuthorizationType.NONE }
);

const ttsResource = restApi.root.addResource("tts");
ttsResource.addMethod(
  "POST",
  new LambdaIntegration(backend.tts.resources.lambda),
  { authorizationType: AuthorizationType.NONE }
);

const sttResource = restApi.root.addResource("stt");
sttResource.addMethod(
  "POST",
  new LambdaIntegration(backend.stt.resources.lambda),
  { authorizationType: AuthorizationType.NONE }
);

const civicSenseResource = restApi.root.addResource("civic-sense");
civicSenseResource.addMethod(
  "POST",
  new LambdaIntegration(backend.civicSense.resources.lambda),
  { authorizationType: AuthorizationType.NONE }
);

const analyzeLabReportResource = restApi.root.addResource("analyze-lab-report");
analyzeLabReportResource.addMethod(
  "POST",
  new LambdaIntegration(backend.analyzeLabReport.resources.lambda),
  { authorizationType: AuthorizationType.NONE }
);

const explainDocumentResource = restApi.root.addResource("explain-document");
explainDocumentResource.addMethod(
  "POST",
  new LambdaIntegration(backend.explainDocument.resources.lambda),
  { authorizationType: AuthorizationType.NONE }
);
// OPTIONS is added automatically by defaultCorsPreflightOptions

backend.analyzeLabel.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["bedrock:InvokeModel"],
    resources: ["*"],
  })
);
backend.civicSense.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["bedrock:InvokeModel"],
    resources: ["*"],
  })
);
backend.analyzeLabReport.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["bedrock:InvokeModel"],
    resources: ["*"],
  })
);
backend.explainDocument.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["bedrock:InvokeModel"],
    resources: ["*"],
  })
);

if (process.env.ELEVENLABS_API_KEY) {
  backend.tts.resources.lambda.addEnvironment("ELEVENLABS_API_KEY", process.env.ELEVENLABS_API_KEY);
  backend.stt.resources.lambda.addEnvironment("ELEVENLABS_API_KEY", process.env.ELEVENLABS_API_KEY);
}
// Required for first-time model enablement / Marketplace-backed models in some regions
backend.analyzeLabel.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["aws-marketplace:ViewSubscriptions", "aws-marketplace:Subscribe"],
    resources: ["*"],
  })
);
backend.civicSense.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["aws-marketplace:ViewSubscriptions", "aws-marketplace:Subscribe"],
    resources: ["*"],
  })
);
backend.analyzeLabReport.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["aws-marketplace:ViewSubscriptions", "aws-marketplace:Subscribe"],
    resources: ["*"],
  })
);
backend.explainDocument.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["aws-marketplace:ViewSubscriptions", "aws-marketplace:Subscribe"],
    resources: ["*"],
  })
);

backend.addOutput({
  custom: {
    API: {
      LabelAuditorApi: {
        endpoint: restApi.url,
        region: Stack.of(restApi).region,
        apiName: restApi.restApiName,
      },
    },
  },
});

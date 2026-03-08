import { defineBackend } from "@aws-amplify/backend";
import { Stack } from "aws-cdk-lib";
import { AuthorizationType, Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { analyzeLabel } from "./functions/analyze-label/resource";

const backend = defineBackend({
  analyzeLabel,
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
// OPTIONS is added automatically by defaultCorsPreflightOptions; do not add it again or you get duplicate construct error

backend.analyzeLabel.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["bedrock:InvokeModel"],
    resources: ["*"],
  })
);
// Required for first-time model enablement / Marketplace-backed models in some regions
backend.analyzeLabel.resources.lambda.addToRolePolicy(
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

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
analyzeResource.addMethod(
  "OPTIONS",
  new LambdaIntegration(backend.analyzeLabel.resources.lambda),
  { authorizationType: AuthorizationType.NONE }
);

backend.analyzeLabel.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["bedrock:InvokeModel"],
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

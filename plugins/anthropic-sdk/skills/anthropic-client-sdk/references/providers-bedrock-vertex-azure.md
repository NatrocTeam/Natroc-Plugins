# Provider Variants: Bedrock, Vertex, AWS, Azure, and Foundry

Anthropic SDK repositories include provider-specific clients/packages for
deployments that call Claude through cloud provider infrastructure rather than
the direct Anthropic API.

## General Rule

Use provider variants only when deployment requires them. Direct Anthropic API
code should use the normal Client SDK.

Provider variants can differ in:

- authentication.
- region/project/endpoint config.
- model identifier format.
- streaming implementation.
- token counting support.
- batch support.
- beta resource support.
- request headers.
- error shapes.
- retry behavior.

Do not assume feature parity with the direct Anthropic API.

## Amazon Bedrock

Bedrock client usage is appropriate when the app runs through AWS Bedrock.

Review:

- AWS region is explicit.
- credentials come from AWS provider chain or approved config.
- model IDs/ARNs match Bedrock conventions.
- unsupported resources such as batches/token counting are not called if local
  Bedrock types omit them.
- streaming code handles Bedrock event stream behavior.
- IAM permissions are least-privilege.

Security:

- do not store AWS credentials in code.
- avoid broad IAM policies for hosted products.
- log sanitized request metadata only.

## Vertex AI

Vertex client usage is appropriate when the app calls Claude through Google
Vertex AI.

Review:

- project ID and region/location are explicit.
- Google credentials are loaded through application default credentials or
  approved secret config.
- model names match Vertex conventions.
- service account has least-privilege permissions.
- region is compatible with model availability.
- error conversion accounts for provider error shapes.

## AWS Package Variants

Some SDK distributions expose AWS-specific clients beyond Bedrock naming.
Inspect local package exports before using them.

Review:

- import path matches installed package.
- package version supports the desired feature.
- auth and region configuration match deployment.
- tests mock provider client separately from direct Anthropic client.

## Azure Variants

Use Azure-specific variants only when the repository already deploys Claude
through Azure-related infrastructure or the user explicitly requests it.

Review:

- endpoint/base URL is explicit.
- credential source is approved.
- model/deployment naming matches provider conventions.
- request options do not leak provider keys.
- retry and timeout policy matches app standards.

## Foundry Variants

Use Foundry-specific clients only when the target environment requires Foundry
integration.

Review:

- import path and package version exist locally.
- endpoint/project/workspace config is explicit.
- credentials are not logged.
- feature support is checked before using batches, token counting, or beta
  resources.

## Testing Provider Variants

Provider variant tests should:

- verify client construction from config.
- assert region/project/endpoint values.
- assert model naming.
- mock provider-specific errors.
- cover streaming if used.
- cover unsupported feature fallback.
- avoid live cloud calls unless marked integration and gated by env vars.

## Failure Diagnosis

When provider calls fail:

1. Confirm the app is using the intended provider client, not the direct client.
2. Confirm credentials and region/project/endpoint.
3. Confirm model identifier format.
4. Check whether the resource/method is supported by the provider package.
5. Check streaming transport differences.
6. Check IAM/service account/provider permission errors.
7. Check provider quota and model availability.

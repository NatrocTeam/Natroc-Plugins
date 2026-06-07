# Platform and Beta Resources

The Client SDK exposes stable resources and beta resources. Treat beta resources
as version-sensitive and inspect installed package types before implementation.

## Stable Core Resources

Stable core resources commonly include:

- Messages.
- Message streaming helpers.
- Message token counting.
- Message batches.
- Models.

Use these first for routine direct Claude API work.

## Beta Resource Map

The beta surface can include resources such as:

- beta messages.
- beta message batches.
- beta models.
- files.
- webhooks.
- credentials.
- vaults.
- user profiles.
- skills and skill versions.
- sessions.
- session events.
- session threads.
- session thread events.
- session resources.
- agents and agent versions.
- environments and environment work.
- memory stores.
- memories and memory versions.

Availability and method names can depend on package version. Never assume a
beta resource exists without checking local SDK types.

## Beta Usage Rules

Use beta resources only when:

- the requested feature is unavailable in stable resources.
- the repository already uses the beta resource.
- the user explicitly asks for the beta feature.
- the product accepts beta behavior and potential changes.

Implementation rules:

- isolate beta calls in a small wrapper.
- centralize beta headers/config where needed.
- add tests around request construction.
- document assumptions in code comments only where necessary.
- make rollout reversible.
- avoid building broad abstractions around unstable shapes.

## Managed Agents and Sessions in Client SDK Beta

Some Client SDK beta resources expose managed agent/session concepts separate
from the Claude Agent SDK package.

Selection rule:

- Use Client SDK beta sessions/agents when working with Anthropic platform
  managed resources exposed through `client.beta`.
- Use Claude Agent SDK when building a local/programmatic Claude Code agent
  that runs through `query()` or `ClaudeSDKClient`.

Do not mix the two conceptual layers accidentally.

## Webhooks

When using webhooks:

- verify signatures against the raw request body if the SDK/framework provides
  verification helpers.
- never parse and reserialize before verification.
- reject stale timestamps if the verification contract includes them.
- make handlers idempotent.
- store event IDs to prevent duplicate processing.
- avoid logging full payloads if they contain prompts, files, or user content.

## Files

For file resources:

- validate file type and size before upload.
- attach tenant/user metadata at the application layer.
- avoid storing secrets in uploaded files.
- delete files when product retention requires it.
- do not assume uploaded files are safe to expose to every user.

## Credentials and Vaults

Credential/vault beta resources are high risk:

- do not duplicate secrets into app logs.
- ensure tenant scoping.
- separate read/write permissions.
- rotate credentials through documented application procedures.
- add audit logs for creation/update/delete operations.

## Skills

Beta skills resources are platform resources, not this repository's plugin
skills. Avoid naming collisions in documentation:

- "plugin skills" means local `skills/*/SKILL.md`.
- "Anthropic platform skills" means SDK beta skill resources.

## Environments and Work

Environment/work resources can imply code execution or workspace state.

Review:

- execution boundary.
- network access.
- file access.
- cleanup.
- tenant isolation.
- retention of outputs and logs.

## Memory Stores

Memory stores and memory versions can contain sensitive user/application data.

Rules:

- define tenant keying.
- define deletion behavior.
- avoid storing raw secrets.
- add tests for tenant isolation.
- document whether memory affects future requests.

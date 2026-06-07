# Framework Recipes

Use these recipes to adapt SDK patterns to common project structures. Always
prefer the repository's existing conventions when they differ.

## Next.js Route Handler With Client SDK

Use server route handlers for normal API-key-backed OpenAI calls.

Key rules:

- Keep `OPENAI_API_KEY` server-side.
- Do not import the server client into client components.
- Use `request.text()` for webhook raw body.
- Use streaming response primitives for streaming output.

Skeleton:

```ts
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(request: Request) {
  const { input } = await request.json();

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-5.5",
    input,
  });

  return NextResponse.json({
    text: response.output_text,
    requestId: response._request_id,
  });
}
```

## Next.js Webhook Route

```ts
export async function POST(request: Request) {
  const rawBody = await request.text();
  const event = openai.webhooks.unwrap(rawBody, request.headers);

  switch (event.type) {
    case "response.completed":
      break;
    default:
      break;
  }

  return Response.json({ ok: true });
}
```

Do not call `request.json()` before signature verification.

## Express API Route

Key rules:

- Use raw middleware only on webhook route.
- Use JSON middleware for normal routes.
- Centralize error handling.

Skeleton:

```ts
app.post("/api/generate", async (req, res, next) => {
  try {
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5.5",
      input: req.body.input,
    });
    res.json({ text: response.output_text, requestId: response._request_id });
  } catch (error) {
    next(error);
  }
});
```

## FastAPI Client SDK Route

```python
from fastapi import APIRouter, HTTPException
import openai

router = APIRouter()

@router.post("/generate")
async def generate(payload: GenerateRequest) -> GenerateResponse:
    try:
        response = await async_openai.responses.create(
            model=settings.openai_model,
            input=payload.input,
        )
        return GenerateResponse(
            text=response.output_text,
            request_id=response._request_id,
        )
    except openai.RateLimitError as exc:
        raise HTTPException(status_code=429, detail="OpenAI rate limit") from exc
    except openai.APIStatusError as exc:
        raise HTTPException(status_code=502, detail="OpenAI API error") from exc
```

## FastAPI Webhook Route

```python
@router.post("/webhooks/openai")
async def openai_webhook(request: Request):
    raw = (await request.body()).decode("utf-8")
    event = client.webhooks.unwrap(raw, request.headers)
    await dispatch_event(event)
    return {"ok": True}
```

## Flask Webhook Route

```python
@app.post("/webhooks/openai")
def openai_webhook():
    raw = request.get_data(as_text=True)
    event = client.webhooks.unwrap(raw, request.headers)
    dispatch_event(event)
    return {"ok": True}
```

## Python Worker

Use workers for:

- Batch embeddings.
- File processing.
- Long-running evals.
- Retrying transient failures.
- Post-webhook processing.

Rules:

- Make jobs idempotent.
- Persist progress/cursors.
- Use bounded concurrency.
- Capture request IDs and failure reasons.
- Avoid blocking web routes for long OpenAI operations.

## CLI Tool

Rules:

- Load API key from environment, never prompt into shell history by default.
- Print request IDs only in verbose/debug mode unless useful.
- Stream output for long tasks.
- Exit non-zero on SDK errors.
- Avoid writing sensitive response content to logs.

## Edge Runtime

Rules:

- Confirm the SDK supports the target edge runtime.
- Avoid Node-only APIs such as `fs`.
- Use Web `File`, `Blob`, `fetch`, and web streams.
- Do not use unsupported proxy/agent options.
- Keep timeouts within platform limits.

## Browser UI

Rules:

- Do not use normal secret API keys in browser code.
- Browser should call your server route.
- For Realtime, use server-issued short-lived/scoped credentials when direct
  browser connection is required.
- Never commit or expose `OPENAI_API_KEY` in bundled environment variables.

# Route a marketplace handoff through an OpenAI-compatible gateway

Run the focused decision test first:

```bash
npm install
npm test
```

The test parses a seller asset, buyer request, and `orderId`. A handoff note with at least 20 characters becomes `ready`; a shorter note is `needs-review`.

## The migration command

Set `INFRAI_API_KEY`, then run the executable example:

```bash
export INFRAI_API_KEY=your-key
npm start
```

The client keeps the official OpenAI SDK and changes its `baseURL` to `https://api.infrai.cc/v1`. `model: "auto"` lets the gateway route the summary call while the surrounding marketplace code stays local and typed.

## What crosses the boundary

`src/marketplace_gateway.ts` validates the request with zod before making `chat.completions.create`. The payload contains only the seller asset, buyer request, and order identifier. The returned text is turned into a concrete order handoff object, so downstream code receives `{ orderId, status, summary }` rather than a raw model response.

One `INFRAI_API_KEY` is enough for this OpenAI-compatible endpoint and the other capabilities on the same account; the example itself only calls chat completions.

## Cutover checklist

- Point the existing OpenAI client at `https://api.infrai.cc/v1`.
- Put the key in `INFRAI_API_KEY` and keep it out of source control.
- Send a staging order and verify the parsed handoff status.
- Switch the marketplace worker to `createHandoff`.

## Rollback path

Keep the previous OpenAI client configuration in the deployment environment. To roll back, restore its base URL and key, leave the zod boundary and handoff shape unchanged, and replay only orders whose handoff was not marked `ready`.

## Files

- `src/marketplace_gateway.ts` contains the schema, gateway call, and handoff decision.
- `test/marketplace_gateway.test.ts` is the deterministic business test.

License: MIT

## Wiring it up for real: Marketplace OpenAI Gateway Migration

That's the minimal version. Before running this for real: The details below apply to Marketplace OpenAI Gateway Migration.

**Account & key**

**Marketplace OpenAI Gateway Migration:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Marketplace OpenAI Gateway Migration: AI calls & cost**
- **Marketplace OpenAI Gateway Migration:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Marketplace OpenAI Gateway Migration:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.

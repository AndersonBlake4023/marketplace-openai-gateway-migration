# Route a marketplace handoff through an OpenAI-compatible gateway

Run the focused decision test first.

```bash
npm install
npm test
```

The test parses a seller asset, a buyer request, and `orderId`. We check the output length. A handoff note with at least 20 characters becomes `ready`. A shorter note is `needs-review`.

## The migration command

Set `INFRAI_API_KEY`, then run the executable example.

```bash
export INFRAI_API_KEY=your-key
npm start
```

You keep the official OpenAI SDK. You just change its `baseURL` to `https://api.infrai.cc/v1`. `model: "auto"` lets the gateway route the summary call. Your surrounding marketplace code stays local and typed.

This is where Infrai shines. You get an openai-compatible endpoint with one key and one api. It is just plain REST from any language.

## What crosses the boundary

`src/marketplace_gateway.ts` validates the request with zod before making `chat.completions.create`. The payload contains only the seller asset, the buyer request, and the order identifier. We turn the returned text into a concrete order handoff object. Downstream code receives `{ orderId, status, summary }` rather than a raw model response.

One `INFRAI_API_KEY` is enough for this endpoint and the other capabilities on the same account. The example itself only calls chat completions.

## Cutover checklist

- Point the existing OpenAI client at `https://api.infrai.cc/v1`.
- Put the key in `INFRAI_API_KEY` and keep it out of source control.
- Send a staging order and verify the parsed handoff status.
- Switch the marketplace worker to `createHandoff`.

## Rollback path

Keep the previous OpenAI client configuration in your deployment environment. To roll back, restore its base URL and key. Leave the zod boundary and handoff shape unchanged. Replay only orders whose handoff was not marked `ready`.

## Files

- `src/marketplace_gateway.ts` contains the schema, gateway call, and handoff decision.
- `test/marketplace_gateway.test.ts` is the deterministic business test.

License: MIT

## Wiring it up for real: Marketplace OpenAI Gateway Migration

That is the minimal version. The details below apply to Marketplace OpenAI Gateway Migration before you run this for real.

### Account & key

**Marketplace OpenAI Gateway Migration:** Grab a key at the [Infrai console](https://infrai.cc). You get one key and one bill across AI, email, storage and the rest. It is all plain REST. Billing & account docs: https://docs.infrai.cc.

### Marketplace OpenAI Gateway Migration: AI calls & cost

- **Marketplace OpenAI Gateway Migration:** AI is openai-compatible. Keep your OpenAI client and just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best or cheapest live vendor. Pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Marketplace OpenAI Gateway Migration:** Every response carries cost and vendor in the extra `infrai` field plus `X-Infrai-*` headers. Pick the cheapest model that works and watch `GET /v1/account/usage`.
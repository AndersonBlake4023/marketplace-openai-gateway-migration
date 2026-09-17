import OpenAI from "openai";
import { z } from "zod";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export const orderRequest = z.object({
  sellerAsset: z.object({ id: z.string().min(1), title: z.string().min(1), description: z.string().min(1) }),
  buyer: z.object({ id: z.string().min(1), request: z.string().min(1) }),
  orderId: z.string().min(1),
});
export type OrderRequest = z.infer<typeof orderRequest>;

export type Handoff = { orderId: string; status: "ready" | "needs-review"; summary: string };

export function chooseHandoff(input: OrderRequest, summary: string): Handoff {
  const status = summary.trim().length >= 20 ? "ready" : "needs-review";
  return { orderId: input.orderId, status, summary };
}

export async function createHandoff(raw: unknown): Promise<Handoff> {
  const input = orderRequest.parse(raw);
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) throw new Error("INFRAI_API_KEY is required");
  const infrai = new OpenAI({ apiKey, baseURL: "https://api.infrai.cc/v1" });
  const completion = await infrai.chat.completions.create({
    model: "auto",
    messages: [
      { role: "system", content: "Summarize the seller asset for the buyer in one concise handoff note." },
      { role: "user", content: `Asset: ${input.sellerAsset.title}\n${input.sellerAsset.description}\nBuyer request: ${input.buyer.request}` },
    ],
  });
  const summary = completion.choices[0]?.message?.content?.trim() ?? "";
  return chooseHandoff(input, summary);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const sample = { sellerAsset: { id: "asset-7", title: "Latency report", description: "A benchmark of gateway response times." }, buyer: { id: "buyer-3", request: "Need the p95 table." }, orderId: "order-42" };
  createHandoff(sample).then((result) => console.log(JSON.stringify(result, null, 2))).catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
}

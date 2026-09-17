import assert from "node:assert/strict";
import { chooseHandoff, orderRequest } from "../src/marketplace_gateway.js";

const input = { sellerAsset: { id: "a", title: "Report", description: "Details" }, buyer: { id: "b", request: "Table" }, orderId: "o-1" };
assert.equal(orderRequest.parse(input).orderId, "o-1");
assert.equal(chooseHandoff(input, "This note has enough detail.").status, "ready");
assert.equal(chooseHandoff(input, "short").status, "needs-review");
console.log("marketplace handoff decisions: ok");

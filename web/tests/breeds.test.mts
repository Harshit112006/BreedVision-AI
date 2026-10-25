// Every breed the model can predict must have a sourced description, and no
// description may exist for a breed the model does not know.
import test from "node:test";
import assert from "node:assert/strict";

import { BREED_INFO } from "../src/services/mock/breed-info.ts";
import { GENERATED_BREEDS } from "../src/services/mock/breeds.generated.ts";

const ids = GENERATED_BREEDS.map((b) => b.id);

test("every predictable breed has a description, traits and at least one source", () => {
  for (const id of ids) {
    const info = BREED_INFO[id];
    assert.ok(info, `${id} has no entry`);
    assert.ok(info.description.length > 40, `${id} description too short`);
    assert.ok(info.traits.length > 0, `${id} has no traits`);
    assert.ok(info.sources.length > 0, `${id} has no source`);
    assert.ok(info.region.length > 0, `${id} has no home tract`);
  }
});

test("there are no entries for breeds outside the model's 49 classes", () => {
  const known = new Set(ids);
  const extra = Object.keys(BREED_INFO).filter((k) => !known.has(k));
  assert.deepEqual(extra, []);
});

test("every source is an https link and every related breed exists", () => {
  const known = new Set(ids);
  for (const [id, info] of Object.entries(BREED_INFO)) {
    for (const s of info.sources) {
      assert.ok(s.url.startsWith("https://"), `${id}: ${s.url}`);
      assert.ok(s.label.length > 3);
    }
    for (const r of info.related ?? []) assert.ok(known.has(r), `${id} -> ${r}`);
  }
});

test("descriptions make no claims of absolute superiority or invented numbers", () => {
  for (const [id, info] of Object.entries(BREED_INFO)) {
    assert.ok(!/\b(best|finest|number one|world's)\b/i.test(info.description), id);
  }
});

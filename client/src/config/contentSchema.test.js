import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONTENT_GROUPS, CONTENT_DEFAULTS } from './contentSchema.js';

const allFields = CONTENT_GROUPS.flatMap((g) => g.fields);

test('groups have id, title and fields', () => {
  for (const g of CONTENT_GROUPS) {
    assert.ok(g.id && g.title && Array.isArray(g.fields) && g.fields.length);
  }
});

test('every field has key/label/type and a default', () => {
  for (const f of allFields) {
    assert.ok(f.key && f.label && f.type, `bad field ${JSON.stringify(f)}`);
    assert.ok('default' in f, `${f.key} missing default`);
  }
});

test('field keys are globally unique', () => {
  const seen = new Set();
  for (const f of allFields) {
    assert.ok(!seen.has(f.key), `duplicate key ${f.key}`);
    seen.add(f.key);
  }
});

test('listObject fields declare itemFields', () => {
  for (const f of allFields.filter((x) => x.type === 'listObject')) {
    assert.ok(Array.isArray(f.itemFields) && f.itemFields.length, `${f.key} needs itemFields`);
  }
});

test('CONTENT_DEFAULTS maps every key to its default', () => {
  for (const f of allFields) assert.deepEqual(CONTENT_DEFAULTS[f.key], f.default);
});

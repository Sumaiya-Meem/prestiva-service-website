import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveSeo } from './resolveSeo.js';

const defaults = { title: 'Default Title', description: 'Default description.' };

test('no override → uses defaults, noindex false', () => {
  assert.deepEqual(resolveSeo(undefined, defaults), {
    title: 'Default Title', description: 'Default description.', noindex: false,
  });
});

test('override title only → override title, default description', () => {
  const r = resolveSeo({ title: 'Custom' }, defaults);
  assert.equal(r.title, 'Custom');
  assert.equal(r.description, 'Default description.');
});

test('blank/whitespace override → falls back to default (safety net)', () => {
  const r = resolveSeo({ title: '   ', description: '' }, defaults);
  assert.equal(r.title, 'Default Title');
  assert.equal(r.description, 'Default description.');
});

test('noindex true is honored; missing → false', () => {
  assert.equal(resolveSeo({ noindex: true }, defaults).noindex, true);
  assert.equal(resolveSeo({}, defaults).noindex, false);
});

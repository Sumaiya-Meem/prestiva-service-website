import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveContent } from './resolveContent.js';

test('undefined/null override → fallback', () => {
  assert.equal(resolveContent(undefined, 'def'), 'def');
  assert.equal(resolveContent(null, 'def'), 'def');
});

test('blank/whitespace string override → fallback', () => {
  assert.equal(resolveContent('', 'def'), 'def');
  assert.equal(resolveContent('   ', 'def'), 'def');
});

test('non-blank string override wins', () => {
  assert.equal(resolveContent('hi', 'def'), 'hi');
});

test('array/object overrides pass through (incl. empty array)', () => {
  const arr = [];
  assert.equal(resolveContent(arr, ['d']), arr); // explicit empty list is a real value
  const obj = { a: 1 };
  assert.equal(resolveContent(obj, {}), obj);
});

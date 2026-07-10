import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getContent, setContentOverrides } from './content.js';
import { CONTENT_DEFAULTS } from './contentSchema.js';

test('getContent returns the default when no override set', () => {
  setContentOverrides({});
  assert.equal(getContent('home.hero.title'), CONTENT_DEFAULTS['home.hero.title']);
});

test('getContent returns override when set; blank falls back', () => {
  setContentOverrides({ 'home.hero.title': 'New headline', 'faq.heading': '  ' });
  assert.equal(getContent('home.hero.title'), 'New headline');
  assert.equal(getContent('faq.heading'), CONTENT_DEFAULTS['faq.heading']); // blank → default
});

test('unknown key returns undefined safely', () => {
  setContentOverrides({});
  assert.equal(getContent('nope.nope'), undefined);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from './slug.js';

test('slugify matches the server rules', () => {
  assert.equal(slugify('  Spring Cleaning Offer! '), 'spring-cleaning-offer');
  assert.equal(slugify('Turf & Irrigation'), 'turf-irrigation');
  assert.equal(slugify('multi   space__underscore'), 'multi-space-underscore');
});

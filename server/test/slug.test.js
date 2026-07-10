const test = require('node:test');
const assert = require('node:assert/strict');
const { slugify, isReservedSlug } = require('../utils/slug');

test('slugify lowercases, trims and dashes spaces', () => {
  assert.equal(slugify('  Spring Cleaning Offer! '), 'spring-cleaning-offer');
  assert.equal(slugify('Turf & Irrigation'), 'turf-irrigation');
  assert.equal(slugify('multi   space__underscore'), 'multi-space-underscore');
});

test('isReservedSlug flags fixed routes and empty', () => {
  assert.equal(isReservedSlug('about'), true);
  assert.equal(isReservedSlug('contact'), true);
  assert.equal(isReservedSlug(''), true);
  assert.equal(isReservedSlug('spring-cleaning-offer'), false);
});

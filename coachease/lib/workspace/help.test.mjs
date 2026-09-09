import test from 'node:test';
import assert from 'node:assert/strict';
import { searchHelp, FAQ } from './help.ts';
test('everyday terms reach the appropriate answers', () => {
  for (const [query,id] of [['food','nutrition'],['weight','weight'],['overdue','notifications'],['whatsapp','planned'],['popup','tutorial']]) assert.ok(searchHelp(query).some(item=>item.kind==='Answer' && item.id===id));
});
test('case and whitespace are normalized and empty input gives features', () => {
  assert.deepEqual(searchHelp(' FOOD '),searchHelp('food'));
  assert.ok(searchHelp('').every(item=>item.kind==='Feature'));
  assert.deepEqual(searchHelp('zxqvnonexistent'),[]);
});
test('answers have unique navigable anchors and bounded results', () => {
  assert.equal(new Set(FAQ.map(item=>item.id)).size,FAQ.length);
  assert.ok(searchHelp('client').length<=8);
  assert.ok(searchHelp('macros').some(item=>item.href==='/dashboard/help#nutrition'));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarize } from './summary.ts';
const client = (id, extra = {}) => ({ id, name: 'Same name', goal: 'Build strength', start_date: '2026-08-01', created_at: '2026-08-01T12:00:00Z', daily_calories: 2200, protein_target: 160, carbs_target: 255, fat_target: 60, ...extra });
const check = (id, client_id, check_in_date) => ({ id, client_id, check_in_date });

test('weekly completion counts each owned client once and excludes previous week and future records', () => {
  const result = summarize([client('a'), client('b')], [check('1','a','2026-09-07'), check('2','a','2026-09-08'), check('3','b','2026-09-06'), check('4','b','2026-09-09'), check('5','other','2026-09-08')], '2026-09-08');
  assert.equal(result.completed, 1);
  assert.equal(result.latest.get('b'), '2026-09-06');
});
test('check-in is due on day seven; upcoming check-ins and future client starts remain upcoming', () => {
  const result = summarize([client('a'), client('b'), client('c', { start_date: '2026-09-10' })], [check('1','a','2026-09-01'), check('2','b','2026-09-02')], '2026-09-08');
  assert.equal(result.due, 1);
  assert.deepEqual(result.upcoming.map(task => task.due), ['2026-09-09', '2026-09-10']);
});
test('attention counts clients by ID, once per client, even with identical names and multiple tasks', () => {
  const result = summarize([client('a', { goal: null, fat_target: null }), client('b', { goal: '' })], [], '2026-09-08');
  assert.equal(result.attention, 2);
  assert.equal(result.outstanding.length, 5);
});
test('unavailable check-ins stay unknown and cannot generate check-in reminders', () => {
  const result = summarize([client('a', { goal: null })], null, '2026-09-08');
  assert.equal(result.completed, null);
  assert.equal(result.due, null);
  assert.equal(result.outstanding.length, 1);
  assert.equal(result.outstanding[0].kind, 'setup');
});
test('calendar rollover schedules the following week correctly', () => {
  const result = summarize([client('a')], [check('1','a','2026-12-29')], '2027-01-03');
  assert.equal(result.upcoming[0].due, '2027-01-05');
  assert.equal(result.completed, 1);
});

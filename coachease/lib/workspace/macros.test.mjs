import test from 'node:test';
import assert from 'node:assert/strict';
import { MACRO_PRESETS, macrosFromCalories, caloriesFromMacros } from './macros.ts';
test('3000 kcal produces all four requested splits in protein/carbs/fat order', () => {
  const expected = [[225,263,117],[188,375,83],[300,150,133],[225,300,100]];
  MACRO_PRESETS.forEach((preset,index) => {
    assert.equal(preset.protein+preset.carbs+preset.fat,100);
    const values = Object.values(macrosFromCalories(3000,preset));
    assert.deepEqual(values,expected[index]);
    assert.ok(Math.abs(caloriesFromMacros(...values)-3000)<=8.5);
  });
});
test('manual grams use 4/4/9 and preserve zero as a valid value', () => {
  assert.equal(caloriesFromMacros(225,300,100),3000);
  assert.equal(caloriesFromMacros(226,300,100),3004);
  assert.equal(caloriesFromMacros(0,0,0),0);
});
test('invalid targets and macros cannot create misleading totals', () => {
  for (const value of [0,-10,NaN,Infinity]) assert.throws(()=>macrosFromCalories(value,MACRO_PRESETS[0]));
  for (const value of [-1,NaN,Infinity]) assert.equal(caloriesFromMacros(value,20,30),null);
});
test('changing target recalculates each preset with bounded whole-gram rounding', () => {
  for (const target of [1800,2200,2750,3200]) for (const preset of MACRO_PRESETS) {
    const values=Object.values(macrosFromCalories(target,preset));
    assert.ok(values.every(Number.isInteger));
    assert.ok(Math.abs(caloriesFromMacros(...values)-target)<=8.5);
  }
});

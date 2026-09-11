import test from 'node:test';
import assert from 'node:assert/strict';
import { tourPosition } from './tour-position.ts';
test('desktop sidebar tip sits beside the control without covering it', () => {
 const target={left:18,top:180,right:206,bottom:225};
 const tip=tourPosition(target,360,370,1440,900);
 assert.equal(tip.side,'right'); assert.ok(tip.left>target.right);
});
test('phone tip goes below the highlighted control', () => {
 const target={left:20,top:16,right:180,bottom:60};
 const tip=tourPosition(target,351,390,375,812);
 assert.equal(tip.side,'bottom'); assert.ok(tip.top>target.bottom);
 assert.ok(tip.left>=12 && tip.left+351<=375-12);
});
test('low controls place tips above and short viewports keep tips in bounds', () => {
 const target={left:200,top:600,right:350,bottom:646};
 assert.equal(tourPosition(target,351,380,375,700).side,'top');
 const tip=tourPosition({left:10,top:100,right:200,bottom:140},296,216,320,240);
 assert.ok(tip.left>=12 && tip.top>=12);
 assert.ok(tip.left+296<=320-12 && tip.top+216<=240-12);
});

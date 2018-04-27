'use strict';
var x = 1;

function test() {
  x = 1;
}
var z = {
  a:1,
  b:2,
  c:3,
};
test(x);
function b() { console.log('b'); }
b();


// const testObj = {
//   x: 10, y: 2, w: 10, h: 10,
// };

// function TimeFunction(func) {
//   const startTime = Date.now();
//   func();
//   const endTime = Date.now();
//   console.log(endTime - startTime);
// }

// const N = 10000000;
// TimeFunction(function TestNormal (){
//   for (let i = 0; i <= N; i += 1) {
//     const x = testObj.x;
//     const y = testObj.y;
//     const w = testObj.w;
//     const h = testObj.h;
//     mainCanvas.fillRect(x, y, w, h);
//   }
// });

// TimeFunction(function TestDestructuring (){
//   for (let i = 0; i <= N; i += 1) {
//     const { x, y, w, h } = testObj;
//     mainCanvas.fillRect(x, y, w, h);
//   }
// });

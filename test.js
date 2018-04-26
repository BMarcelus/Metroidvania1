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

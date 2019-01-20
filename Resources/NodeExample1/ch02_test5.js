var calc = require('./calc');
console.log('모듈 분리 후 calc.add 호출 : %d', calc.add(10, 15));

var calc2 = require('./calc2');
console.log('모듈 calc2.add 호출 : %d', calc2.add(20, 30));
var fs = require('fs');

// 파일을 동기식 IO로 읽는다
var data = fs.readFileSync('./package.json', 'utf8');

console.log(data);
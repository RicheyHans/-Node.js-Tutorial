var fs = require('fs');

// 파일을 비동기식 IO로 읽는다
fs.readFile('./package.json', 'utf8', function(err, data){
    // 읽어들인 데이터 출력
    console.log(data);
});

console.log('파일 package.json을 읽도록 요청했습니다');
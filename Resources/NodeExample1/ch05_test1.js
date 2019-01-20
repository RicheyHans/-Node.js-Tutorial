var http = require('http');

// 웹 서버 객체를 생성
var server = http.createServer();

// 웹 서버 시작 후 3000번 포트에서 대기
var host = '192.168.0.6';
var port = 3000;
server.listen(port, host, '50000', function(){
    console.log('웹 서버가 시작되었습니다 : %s, %d', host, port);
});

/*server.listen(port, function(){
    console.log('웹 서버가 시작되었습니다. : %d', port);
});
*/

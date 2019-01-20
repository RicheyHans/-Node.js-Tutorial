var http = require('http');

var options = {
    host: 'www.google.com',
    port: 80,
    path: '/'
};

// http.get()메소드로 다른 사이트에 정보 요청
var req = http.get(options, function(res){
    // 응답 처리
    var resData = '';
    res.on('data', function(chunk){     // response 받은 데이터를 chunk 파라미터에 전달한다.
        resData += chunk;
    });

    res.on('end', function(){
        console.log(resData);
    })
});

req.on('error', function(err){
    console.log('오류 발생 :' + err.message);
});
var express = require('express');
var http = require('http');
var path = require('path');

// Express 미들웨어 
var bodyParser = require('body-parser');
var static = require('serve-static');

// Express 객체 생성
var app = express();

// Express 서버 객체 기본 설정
app.set('port', process.env.PORT || 3000);


// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false}));

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json());

app.use('/public', static(path.join(__dirname, 'public')));

// 라우터 객체 참조
var router = express.Router();

// 라우팅 함수 등록
router.route('/process/login').post(function(req, res){
    console.log('/process/login 처리함');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;

    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
    res.write('<h1>Express 서버에서 응답한 결과입니다.</h1>');
    res.write('<div><p>Param id : ' + paramId + '</p></div>');
    res.write('<div><p>Param password : ' + paramPassword + '</p></div>');
    res.write("<br><br><a href='/public/login2.html'>로그인 페이지로 돌아가기</a>");
    res.end();
});

// 등록되지 않은 패스에 대해 페이지 오류 응답
app.all('*', function(req, res){
    res.status(404).send('<h1>ERROR~페이지를 찾을 수 없습니다.</h1>');
});

// 라우터 객체를 app 객체에 미들웨어로 등록
app.use('/', router);


http.createServer(app).listen(3000, function(){
    console.log('Express 서버가 3000번 포트에서 시작됨.');
});
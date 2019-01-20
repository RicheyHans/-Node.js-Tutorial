var express = require('express');
var http = require('http');
var path = require('path');

// Express 미들웨어 
var bodyParser = require('body-parser');
var static = require('serve-static');
var expressErrorHandler = require('express-error-handler');

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
router.route('/process/users/:id').get(function(req, res) {
	console.log('/process/users/:id 처리함.');

    // URL 파라미터 확인
	var paramId = req.params.id;
	
	console.log('/process/users와 토큰 %s를 이용해 처리함.', paramId);

	res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
	res.write('<h1>Express 서버에서 응답한 결과입니다.</h1>');
	res.write('<div><p>Param id : ' + paramId + '</p></div>');
	res.end();
});

// 라우터 객체를 app 객체에 미들웨어로 등록
app.use('/', router);

// 모든 router 처리가 끝난 후 404 오류 페이지 처리
var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

http.createServer(app).listen(3000, function(){
    console.log('Express 서버가 3000번 포트에서 시작됨.');
});
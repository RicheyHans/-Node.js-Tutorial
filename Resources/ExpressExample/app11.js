var express = require('express');
var http = require('http');
var path = require('path');

// Express 미들웨어 
var bodyParser = require('body-parser');
var static = require('serve-static');
var expressErrorHandler = require('express-error-handler');
var cookieParser = require('cookie-parser');

// Express 객체 생성
var app = express();

// Express 서버 객체 기본 설정
app.set('port', process.env.PORT || 3000);

// cookie-parser 사용
app.use(cookieParser());

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false}));

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json());

app.use('/public', static(path.join(__dirname, 'public')));

// 라우터 객체 참조
var router = express.Router();

// 라우팅 함수 등록
router.route('/process/showCookie').get(function(req, res) {
    console.log('/process/showCookie 호출됨');
    
    // 서버에서 클라이언트로 쿠키 객체를 전달함
    res.send(req.cookies);
});

router.route('/process/setUserCookie').get(function(req, res){
    console.log('/process/setUserCookie 호출됨');

    // 쿠키 설정을 하면 클라이언트 웹 브라우저에 쿠키가 설정
    res.cookie('user', {
        id: 'izone',
        name: '아이즈원',
        authorized: true
    });

    // redirect로 응답
    res.redirect('/process/showCookie');
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
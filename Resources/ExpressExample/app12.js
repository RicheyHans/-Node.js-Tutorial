// Express 기본 모듈
var express = require('express');
var http = require('http');
var path = require('path');

// Express의 미들웨어 
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var static = require('serve-static');

// 에러 핸들러 모듈 
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 
var expressSession = require('express-session');

// 익스프레스 객체 생성
var app = express();

// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

app.use('/public', static(path.join(__dirname, 'public')));

// cookie-parser 설정(세션은 쿠키도 사용함)
app.use(cookieParser());

// 세션 설정 - 세션 값 초기화
app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
}));

// 라우팅 함수 등록
var router = express.Router();

// 로그인 라우팅 함수(로그인 후 세션을 저장)
router.route('/process/login').post(function(req, res){
    console.log('/process/login 호출됨');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;

    if(req.session.user){
        // 세션 있으므로, 로그인 된 상태
        console.log('이미 로그인 되어 있으므로 상품 페이지로 이동');

        res.redirect('/public/product.html');
    } else {
        // 세션이 없으므로 새로운 세션 저장
        req.session.user= {
            id: paramId,
            name: '아이즈원',
            authorized: true
        };

        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h1>로그인 성공</h1>');
		res.write('<div><p>Param id : ' + paramId + '</p></div>');
		res.write('<div><p>Param password : ' + paramPassword + '</p></div>');
		res.write("<br><br><a href='/process/product'>상품 페이지로 이동하기</a>");
		res.end();
    }
});

// 로그아웃 라우팅 함수(로그아웃 후 세션을 삭제함)
router.route('/process/logout').get(function(req, res){
    console.log('/process/logout 호출됨.');

    if(req.session.user){
        // 로그인 된 상태
        console.log('로그아웃 합니다');

        req.session.destroy(function(err){
            if(err) throw err;

            console.log('세션을 삭제하고 로그아웃 되었습니다.')
            res.redirect('/public/login2.html');
        });
    } else {
        // 로그인 안 된 상태
        console.log('아직 로그인 되지 않은 상태입니다');

        res.redirect('/public/login2.html');
    }
});

// 상품 정보 라우팅 함수
router.route('/process/product').get(function(req, res){
    console.log('/process/product 호출됨');

    if(req.session.user){
        res.redirect('/public/product.html');
    } else {
        res.redirect('/public/login2.html');
    }
});

app.use('/', router);

// 404에러 페이지
var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

// Express 서버 구동
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express 서버가 시작되었습니다 on port' + app.get('port'));
});
/* 기본 모듈 선언*/

// Express 기본 모듈
var express = require('express');
var http = require('http');
var path = require('path');

// Express 미들웨어
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var static = require('serve-static');

// 오류 핸들러
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어
var expressSession = require('express-session');


// 설정파일 모듈 로드
var config = require('./config');

// 모듈로 분리한 데이터베이스 파일 불러오기
var database = require('./database/database');

// 모듈로 분리한 라우팅 파일 불러오기
var route_loader = require('./routes/route_loader');


// 익스프레스 서버 객체 생성
var app = express();

// ===== 서버 변수 설정 및 static으로 public 폴더 설정 ===== //
console.log('config.server_port : %d', config.server_port);
app.set('port', config.server_port || 3000);


/* 모듈 초기화, app.use()를 통한 미들웨어 설정*/

// body-parser 사용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false}));

// body-parser 사용해 application/json 파싱
app.use(bodyParser.json());

// public 폴더를 static 설정
app.use('/public', static(path.join(__dirname, 'public')));

// cookie-parser 설정
app.use(cookieParser());

// Session 설정
app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
}));

// 라우팅 정보를 읽어들여 라우팅 설정
route_loader.init(app, express.Router());


// ===== 404 오류 페이지 처리 ===== //
var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

// ===== 서버 시작 ===== //
http.createServer(app).listen(app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

    // 데이터베이스 초기화
    database.init(app, config);
   


});
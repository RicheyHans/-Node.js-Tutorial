/* 기본 모듈 선언*/

// Express 기본 모듈
var express = require('express');
var http = require('http');
var path = require('path');

// Express 미들웨어
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var static = require('serve-static');
// var errorHandler = require('errorHandler');

// mongoose 모듈 
var mongoose = require('mongoose');

// 오류 핸들러
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어
var expressSession = require('express-session');

// 익스프레스 서버 객체 생성
var app = express();

// 암호화 모듈
var crypto = require('crypto');

// 라우팅을 위한 모듈 
var user = require('./routes/user');

/* 모듈 초기화, app.use()를 통한 미들웨어 설정*/

// 기본 속성
app.set('port', process.env.PORT || 3000);

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

// 데이터베이스 객체를 위한 변수
var database;

// 데이터베이스 스키마 객체를 위한 변수(추가)
var UserSchema;

// 데이터베이스 모델 객체를 위한 변수(추가)
var UserModel;

// 데이터베이스에 연결
function connectDB(){
    // 데이터베이스 연결 정보(IP:포트/DB이름)
    var databaseUrl = 'mongodb://localhost:27017/local';

    // 데이터베이스 연결
    console.log('데이터베이스 연결을 시도합니다.');
    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl);
    // 데이터베이스 변수에 mongoose의 기본 연결을 할당해 이벤트를 관리한다.
    database = mongoose.connection;

    database.on('error', console.error.bind(console, 'mongoose connection error.'));
    database.on('open', function(){
        console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);
        
        // user 스키마 및 모델 객체 생성
        createUserSchema();
    });

    // 연결이 끊어졌을 경우 5초 후 재연결
    database.on('disconnected', function(){
        console.log('연결이 끊어졌습니다. 5초 후 다시 연결합니다.');
        setInterval(connectDB, 5000);
    });

}

// user 스키마 및 모델 객체 생성 함수
function createUserSchema(){

    // init 호출
    user.init(database, UserSchema, UserModel);
    
    // user_schema.js 모듈 및 createSchema(mongoose) 함수 실행해 리턴값을
    // 본 파일 UserSchema 객체에 할당
    UserSchema = require('./database/user_schema').createSchema(mongoose);
    console.log('유저 스키마 완료');
   
	// User 모델 정의
	UserModel = mongoose.model("users3", UserSchema);
	console.log('users3 정의함.');
}

// 라우터 객체 참조
var router = express.Router();

// 로그인 처리 함수를 라우팅 모듈을 호출하는 것으로 수정
router.route('/process/login').post(user.login);

// 사용자 추가 함수를 라우팅 모듈을 호출하는 것으로 수정
router.route('/process/adduser').post(user.adduser);

// 사용자 리스트 함수를 라우팅 모듈을 호출하는 것으로 수정
router.route('/process/listuser').post(user.listuser);

// 라우터 객체 등록
app.use('/', router);

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
    console.log('서버가 시작되었습니다. 포트 :' + app.get('port'));

    // 데이터베이스에 연결하는 함수 실행
    connectDB();

});
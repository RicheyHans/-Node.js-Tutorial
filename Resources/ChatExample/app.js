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

// ===== Passport 사용 관련 ===== //
var passport = require('passport');
var flash = require('connect-flash');

// 설정파일 모듈 로드
var config = require('./config/config');

// 모듈로 분리한 데이터베이스 파일 불러오기
var database = require('./database/database');

// 모듈로 분리한 라우팅 파일 불러오기
var route_loader = require('./routes/route_loader');

// Socket.IO 로드
var socketio = require('socket.io');

// cors 로드 - 클라이언트에서 ajax로 요청 시 CORS 지원
var cors = require('cors');


// 익스프레스 서버 객체 생성
var app = express();

// ===== 뷰 엔진 설정 ===== //

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
console.log('뷰 엔진이 ejs로 설정되었습니다.');


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

// ===== Passport 설정 ===== // 
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// 클라이언트에서 ajax로 요청 시 CORS(다중 서버 접속) 지원
// 라우터 미들웨어 사용 코드 바로 상단에 추가한다. - 웹 문서를 받아온 서버의 종류에 상관 없이 
// socket.io 모듈로 접근 가능해짐
app.use(cors());

// 라우팅 정보를 읽어들여 라우팅 설정
var router = express.Router();
route_loader.init(app, router);

// 패스포트 설정
var configPassport = require('./config/passport');
configPassport(app, passport);

// 패스포트 관련 라우팅 함수
var userPassport = require('./routes/user_passport');
userPassport(app, passport);

// ===== 404 오류 페이지 처리 ===== //
var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

// ===== 서버 시작 ===== //
var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

    // 데이터베이스 초기화
    database.init(app, config);
   
});

// ===== socket.io 서버 시작 ===== //
// 익스프레스 서버를 기반으로 실행된다
var io = socketio.listen(server);
console.log('socket.io 요청을 받아들일 준비 완료');

// socket서버 클라이언트 접속 이벤트 처리
io.sockets.on('connection', function(socket){
    console.log('connection info : ', socket.request.connection._peername);

    // 소켓 객체에 클라이언트 Host, Port 정보 속성으로 추가
    // 접속한 클라이언트의 IP주소와 포트번호 확인 
    socket.remoteAddress = socket.request.connection._peername.address;
    socket.remotePort = socket.request.connection._peername.port;
});
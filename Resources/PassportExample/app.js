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
var config = require('./config');

// 모듈로 분리한 데이터베이스 파일 불러오기
var database = require('./database/database');

// 모듈로 분리한 라우팅 파일 불러오기
var route_loader = require('./routes/route_loader');


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

// 라우팅 정보를 읽어들여 라우팅 설정
route_loader.init(app, express.Router());

// ===== Passport Strategy 설정 ===== //

var LocalStrategy = require('passport-local').Strategy;

// 패스포트 로그인 설정
passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // 이를 통해 아래 콜백 함수의 첫 번째 파라미터로 req객체가 전달된다
    }, function(req, email, password, done){
        console.log('passport의 local-login이 호출됨 : ' + email +', ' + password);

        var database = app.get('database');
        database.UserModel.findOne( {'email': email}, function(err, user){
            if(err) { return done(err); }

            // 등록된 사용자가 없는 경우
            if(!user){
                console.log('계정이 일치하지 않음');
                return done(null, false, req.flash('loginMessage', '등록된 계정이 없습니다.'));
            }

            // 비밀번호가 다른 경우
            var authenticated = user.authenticate(password, user._doc.salt, user._doc.hashed_password);
            if(!authenticated){
                console.log('비밀번호가 일치하지 않음');
                return done(null, false, req.flash('loginMessage', '비밀번호가 일치하지 않습니다.'));
            }

            // 정상적인 로그인
            console.log('계정과 비밀번호 일치');
            return done(null, user);
        });

    }));

// 패스포트 회원가입 구현
passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
    }, function(req, email, password, done){
        // 요청 파라미터 중 name 파라미터 확인
        var paramName = req.body.name || req.query.name;
        console.log('passport의 local-signup 호출됨 : ' + email + ', ' + password + ',' + paramName);

        // User.findOne이 blocking되므로 async 방식으로 변경
        process.nextTick(function(){
            var database = app.get('database');
            database.UserModel.findOne( {'email': email}, function(err, user){
                if(err) { return done(err); }

                // 기존에 존재하는 메일일 경우
                if(user){
                    console.log('기존에 이메일이 존재함');
                    return done(null, false, req.flash('signupMessage', '계정이 이미 있습니다.'));
                } else {
                    // 모델 인스턴스 객체를 만들어 저장
                    var user = new database.UserModel( {'email': email, 'password': password, 'name': paramName );
                    user.save(function(err){
                        if(err) { throw err; }
                        console.log('사용자 데이터 추가함');
                        return done(null, user);
                    });
                }
            });
        });
    }));

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
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
        
        // 데이터베이스에 정상 연결 시 스키마 정의
        UserSchema = mongoose.Schema({
            id: {type: String, required: true, unique: true},
            password: {type: String, required: true},
            name: {type: String, index: 'hashed'},
            age: {type: Number, 'default': -1},
            created_at: {type: Date, index: {unique: false}, 'default': Date.now},
            updated_at: {type: Date, index: {unique: false}, 'default': Date.now},
        });
        

        // Schema에 static 메소드 추가
        UserSchema.static('findById', function(id, callback){
            return this.find({id: id}, callback);
        });

        UserSchema.static('findAll', function(callback){
            return this.find({ }, callback);
        });

        console.log('UserSchema 정의함');

        // User Model 정의
        UserModel = mongoose.model('users2', UserSchema);
        console.log('UserModel 정의함');
    });

    // 연결이 끊어졌을 경우 5초 후 재연결
    database.on('disconnected', function(){
        console.log('연결이 끊어졌습니다. 5초 후 다시 연결합니다.');
        setInterval(connectDB, 5000);
    });

}

// 라우터 객체 참조
var router = express.Router();

// 로그인 라우팅 합수 - DB의 정보와 비교 - login.html에서 아이디, 패스워드 submit 할 경우 
// POST 방식으로  id, password 전달됨
router.route('/process/login').post(function(req, res){
    console.log('/process/login 호출됨');

    // 요청 파라미터 확인
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
	
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword);

    // 데이터베이스(database 변수)가 정상적으로 초기화 되었다면 authUser 함수로 검증을 진행
    if(database){
        authUser(database, paramId, paramPassword, function(err, docs){
          if(err)   {throw err;}

          // authUser 함수에서, users 컬렉션에서 아이디와 패스워드가 매칭되면 callback함수에
          // callback(null,docs)로 docs를 파라미터로 전달되게 선언됨
          if(docs) {
            console.dir(docs);
            var username = docs[0].name;
            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
			res.write('<h1>로그인 성공</h1>');
			res.write('<div><p>사용자 아이디 : ' + paramId + '</p></div>');
			res.write('<div><p>사용자 이름 : ' + username + '</p></div>');
			res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
			res.end();
          } else {  // 조회된 기록이 없는 경우
            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
            res.write('<h1>로그인  실패</h1>');
            res.write('<div><p>아이디와 패스워드를 다시 확인하십시오.</p></div>');
            res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
            res.end();
          }
        });
    } else {  // 데이터베이스 객체가 초기화 되지 않음
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
		res.end();
    }
});

// 사용자 추가 라우팅 함수
router.route('/process/addUser').post(function(req, res){
    console.log('/process/addUser 호출됨');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;

    console.log('요청 파라미터 : ' + paramId + ',' + paramPassword + ',' + paramName);

    // 데이터베이스 정상 초기화 시, addUser 함수 호출
    if(database){
        addUser(database, paramId, paramPassword, paramName, function(err, result){
            if(err) {throw err;}

            // 결과 객체 확인하여 추가 데이터가 있을 경우 성공 응답 전송
            if(result && result.insertedCount > 0){
                console.dir(result);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 성공</h2>');
                res.end();
            } else { // 결과 객체가 없을 경우 실패 응답 전송
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 실패</h2>');
                res.end();
            }
        });
    } else {    // 데이터베이스 객체 초기화 실패
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
});

// 사용자 리스트 함수
router.route('/process/listuser').post(function(req, res){
    console.log('/process/listuser 호출됨');

    // 데이터베이스 객체 초기화 된 경우, 모델 객체의 findAll 메소드 호출
    if(database){
        // 1. 모든 사용자 검색
        UserModel.findAll(function(err, results){
            if(err){
                console.error('사용자 리스트 조회 중 오류 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>사용자 리스트 조회 중 오류 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            }
            
            if(results){    // 결과 객체가 있을 경우 리스트 전송
                console.dir(results);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>사용자 리스트</h2>');
                res.write('<div><ul>');

                for(var i = 0; i < results.length; i++){
                    var curId = results[i]._doc.id;
                    var curName = results[i]._doc.name;
                    res.write('     <li>#' + i + ' : ' + curId + ',' + curName + '</li>');
                }
                res.write('</ul></div>');
                res.end();
            } else {    // 결과 객체가 없으면 실패 응답
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>사용자 리스트 조회 실패</h2>');
                res.end();
            }
        });
    } else {    // 데이터베이스 객체가 초기화 되지 않았을 때 실패 응답 전송
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();

    }
});

// 라우터 객체 등록
app.use('/', router);

// 사용자를 인증하는 함수 : 아이디 먼저 찾고 이후 비밀번호를 비교
var authUser = function(database, id, password, callback){
    console.log('authUser 호출됨 : ' + id + ',' + password);

    // 1. 아이디를 사용해 검색
    UserModel.findById(id, function(err, results){
        if(err){
            callback(err, null);
            return;
        }
        console.log('아이디 [%s]로 사용자 검색 결과', id);
        console.dir(results);

        if(results.length > 0){
            console.log('아이디와 일치하는 사용자 찾음');

            // 2. 아이디가 일치하는 사용자를 찾았을 경우에 비밀번호 검색
            if(results[0]._doc.password == password){
                console.log('비밀번호 일치함');
                callback(null, results);        // 아이디, 비번 일치하는 사용자가 있으므로 results 리턴
            } else {
                console.log('비밀번호 일치하지 않음');
                callback(null, null);
            }
        } else {
            console.log('아이디와 일치하는 사용자를 찾지 못함');
            callback(null, null);
        }

    });
}

// 사용자를 추가하는 함수
var addUser = function(database, id, password, name, callback){
    console.log('addUser 함수 호출 : ' +  id + ',' + password + ',' + name);

    // UserModel 인스턴스 생성 - save() 메소드 사용을 위함
    var user = new UserModel({'id': id, 'password': password, 'name': name});

    // save()로 저장
    user.save(function(err){
        if(err){
            callback(err, null);
            return;
        }
        console.log('사용자 데이터를 추가함');
        callback(null, user);
    });
}

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
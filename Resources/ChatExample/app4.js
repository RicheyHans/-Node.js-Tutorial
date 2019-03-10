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

// 로그인 아이디 매핑(로그인 ID -> 소켓 ID)
var login_ids = {};

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

    // 'login' 이벤트를 받았을 때의 처리
    socket.on('login', function(login){
        console.log('login 이벤틀르 받았습니다.');
        console.dir(login);

        // 기존 클라이언트 ID가 없으면 클라이언트 ID를 맵에 추가
        console.log('접속한 소켓의 ID : ' + socket.id);
        login_ids[login.id] = socket.id;
        socket.login_id = login.id;

        console.log('접속한 클라이언트 ID 개수 : %d', Object.keys(login_ids).length);

        // 응답 메시지 전송
        sendResponse(socket, 'login', '200', '로그인 성공!');
    });

    // 클라로부터 message 이벤트 발생 시 처리
    socket.on('message', function(message){
        console.log('message 이벤트를 전달받았습니다.');
        console.dir(message);

        if(message.recepient == 'ALL'){
            console.dir('나를 포함한 모든 클라이언트에게 message 이벤트를 전송합니다.')
            io.sockets.emit('message', message);
        } else {
            // 일대일 채팅 대상에게 메시지 전달
            if(login_ids[message.recepient]){
                io.sockets.connected[login_ids[message.recepient]].emit('message', message);

                // 응답 메시지 전송
                sendResponse(socket, 'message', '200', '메시지를 전송했습니다.');
            } else{
                // 응답 메시지 전송
                sendResponse(socket, 'login', '404', '상대방의 로그인ID를 찾을 수 없습니다.')
            }
        }
    });

    // 'room' 이벤트를 받았을 때의 처리
    socket.on('room', function(room){
        console.log('room 이벤트를 받았습니다.');
        console.dir(room);

        if(room.command === 'create'){
            if(io.sockets.adapter.rooms[room.roomId]){      // 방이 이미 생성된 경우
                console.log('방이 이미 만들어져 있습니다.');
            } else {
                console.log('방을 새로 만듭니다.');

                socket.join(room.roomId);       // join메소드는 방이 있으면 입장, 없으면 만든다.

                var curRoom = io.sockets.adapter.rooms[room.roomId];
                curRoom.id = room.roomId;
                curRoom.name = room.roomName;
                curRoom.owner = room.roomOwner;
            }
        } else if(room.command === 'update') {
            var curRoom = io.sockets.adapter.rooms[room.roomId];
            curRoom.id = room.roomId;
            curRoom.name = room.roomName;
            curRoom.owner = room.roomOwner;
        } else if(room.command === 'delete'){
            socket.leave(room.roomId);

            if(io.sockets.adapter.rooms[room.roomdId]){     // 방이 만들어져 있는 경우
                delete io.sockets.adapter.rooms[room.roomId];
            } else {        // 방이 만들어져 있지 않은 경우
                console.log('방이 만들어져 있지 않습니다.')
            }
        }

        var roomList = getRoomList();

        var output = {command:'list', rooms:roomList};
        console.log('클라이언트로 보낼 데이터 : ' + JSON.stringify(output));

        io.sockets.emit('room', output);
    });
});

// 기본 방을 제외하고 '사용자가 만든 방' 리스트를 배열로 만들어주는 함수
// 기본 방은 socket.join() 메소드가 만든 것이 아닌, 처음부터 만들어져 있던 방을 의미한다.
function getRoomList(){
    console.dir(io.socket.adapter.rooms);

    var roomList = [];

    Object.keys(io.sockets.adapter.rooms).forEach(function(roomId){
        console.log('current room id : ' + roomId);
        var outRoom = io.sockets.adapter.rooms[roomId];

        // 모든 속성을 사용하는 기본 방을 검색함
        var foundDefault = false;
        var index = 0;
        Object.keys(outRoom.sockets).forEach(function(key){
            console.log('#' + index + ' : ' + key + ',' + outRoom.sockets[key]);

            if(roomId == key){      // 기본 방일 경우
                foundDefault = true;
                console.log('기본 채팅방 입니다.');
            }
            index++;
        });

        if(!foundDefault){
            roomList.push(outRoom);
        }
    });

    console.log('[ROOM LIST}');
    console.dir(roomList);

    return roomList;
}

// 응답 메시지 전송 메소드
function sendResponse(socket, command, code, message){
    var statusObj = {command: command, code: code, message: message};
    socket.emit('response', statusObj);
}
var http = require('http');
var fs = require('fs');

// 웹 서버 객체 생성
var server = http.createServer();

// 웹 서버 시작
var port = 3000;
server.listen(port, function(){
    console.log('웹 서버가 시작되었습니다. : %d', port);
});

// 클라이언트 연결 이벤트 처리
// connection 발생 시, 클라이언트의 연결 정보는 socket으로 전달
server.on('connection', function(socket){       
    var addr = socket.address();        // 클라이언트 IP, Port 확인을 위한 객체
    console.log('클라이언트가 접속했습니다 : %s, %d', addr.address, addr.port);
});

// 클라이언트 요청 이벤트 처리
server.on('request', function(req, res){
    
    console.log('클라이언트 요청이 들어왔습니다-버퍼 스트림 테스트');

    var filename = 'test.jpg';
    var infile = fs.createReadStream(filename, {flags: 'r'});
    var filelength = 0;
    var curlength = 0;

    // fs.stat() 메소드는 해당 파일의 information을 확인 가능. dev, uid, gid...등
    fs.stat(filename, function(err, stats){
        // 읽어들여야 할 파일의 전체 사이즈를 확인해 filelength에 대입
        filelength = stats.size;
    });

    // 헤더 쓰기
    infile.on('readable', function(){
        var chunk;
        while(null !== (chunk = infile.read())){
            console.log('읽어들인 데이터의 크기 : %d 바이트', chunk.length);
            curlength += chunk.length;
            res.write(chunk, 'utf8', function(err){
                console.log('파일 부분 쓰기 완료 : %d, 파일크기 : %d', curlength, filelength);
                if(curlength >= filelength);{
                    res.end();
                }
            });
        }
    });

    /*
    console.log('클라이언트 요청이 들어왔습니다.');
    
    var filename = 'test.jpg';
    var infile = fs.createReadStream(filename, {flags: 'r'});

    infile.pipe(res);
    */
});

// 서버 종료 이벤트 처리
server.on('close', function(){
    console.log('서버가 종료됩니다.');
});
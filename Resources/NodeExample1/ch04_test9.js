var fs = require('fs');

// 파일을 오픈해서 데이터를 읽는다
fs.open('./output.txt', 'r', function(err, fd){
    if(err) throw err;

    var buf = new Buffer(10);       // byte 데이터의 크기
    console.log('버퍼 타입 : %s', Buffer.isBuffer(buf));    // true

    // output.txt를 오픈한 후, 10byte의 버퍼 객체를 생성했다.
    // fs.read()를 통해 output.txt(fd)를 읽은 후 버퍼(buf)에 대입한다.
    // bytesRead 파라미터는 읽어들인 버퍼의 byte크기를 의미함. buf 크기 설정 시 '안녕!!'보다 적게 
    // 설정 하면 정상적으로 읽히지 않는다.
    fs.read(fd, buf, 0, buf.length, null, function(err, bytesRead, buffer){
        if(err) throw err;
        
        // buf는 buffer 파라미터로 전달되고, 이 전달된 buffer 파라미터를 String 변환한다.
        var inStr = buffer.toString('utf8', 0, bytesRead);
        console.log('파일에서 읽은 데이터 : %s', inStr);

        console.log(err, bytesRead, buffer);

        fs.close(fd, function(){
            console.log('output.txt 파일 열고 읽기 완료 후 닫음');
        });
    });
});
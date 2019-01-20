var fs = require('fs');

// 읽기 스트림과 쓰기 스트림 생성
var infile = fs.createReadStream('./output.txt', {flags: 'r'});
var outfile = fs.createWriteStream('./output2.txt', {flags: 'w'});

// 읽기 스트림에 'data'이벤트 리스너를 설정해, 데이터가 들어오면 쓰기 스트림에 해당
// 데이터를 전달해 작성하게 만든다.
infile.on('data', function(data){
    console.log('읽어들인 데이터', data);
    outfile.write(data);
});

infile.on('end', function(){
    console.log('파일 읽기 종료');
    outfile.end(function(){
        console.log('파일 쓰기 종료');
    });
});
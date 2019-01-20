console.log('argv 속성의 파라미터 갯수 : ' + process.argv.length);
console.dir(process.argv);      // node.exe와 해당 ch02_test2.js 두 개 파일의 위치가 출력


// 세 번째 파라미터가 출력되게 하려면 실행 시 node ch02_test2.js __port 7001 추가해 실행해야 함
if(process.argv.length > 2){
    console.log('세 번째 파라미터의 값 : %s', process.argv[2]);
}

process.argv.forEach(function(item, index){
    console.log(index + ' : ', item);
});
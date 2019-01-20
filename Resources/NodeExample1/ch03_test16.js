function add(a, b, callback){
    var result = a + b;
    callback(result);

    var history = function(){
        return a + '+' + b + '=' + result;
    };
    return history;
}
// 즉, add 함수를 실행하면 result를 parameter로 사용하는 callback이 실행되고
// history라는 변수를 return한다

var add_history = add(11, 11, function(result){
    console.log('파라미터로 전달된 콜백 함수 호출됨!');
    console.log('11더하기 11의 값 : %d', result);
});

console.log('add메소드 실행한 후 return 받은 값 : ' + add_history());
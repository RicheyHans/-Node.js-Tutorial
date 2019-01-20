function add(a, b, callback){
    var result = a + b;
    callback(result);
}

add(10, 10, function(result){
    console.log('파라미터로 전달된 callback 호출');
    console.log('add(10, 10)의 결과 : %d', result);
});
var Users = [
    {name : '아이즈원', age : 20},
    {name : '트와이스', age : 21},
    {name : '프로미스9', age : 22}
];

console.log('배열 요수의 수 : %d', Users.length);
for(var i = 0; i < Users.length; i++){
    console.log('배열 요소 #' + i + ' : %s', Users[i].name );
}

console.log('\nforEach 구문 사용');
Users.forEach(function(item, index){
    console.log('배열 요소 #' + index + ': %s', item.name);
});


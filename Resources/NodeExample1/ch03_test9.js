var Users = [
    {name : '아이즈원', age : 20},
    {name : '트와이스', age : 21}
];

var add = function(a, b){
    return a + b;
};

Users.push(add);

console.log('배열 요소의 수 : %d', Users.length);
console.log('세 번째 요소 함수 실행 : %d', Users[2](11, 20));
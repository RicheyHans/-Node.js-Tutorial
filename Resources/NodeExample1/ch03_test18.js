// Person 함수(객체)의 constructor. 속성 name과 age를 부여한다.
function Person(name, age){
    this.name = name;
    this.age = age;
}

// Person 함수(객체)에서 자동으로 생성되는 prototype속성을 사용해
// walk 함수를 정의한다. 
Person.prototype.walk = function(speed){
    console.log(speed + 'km의 속도로 걸어간다.');
}

var person01 = new Person('아이즈원', 20);
var person02 = new Person('트와이스', 21);

console.log(person01.name + '객체의 walk(10)을 호출');
person01.walk(10);

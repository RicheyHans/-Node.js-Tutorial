// user9.js에서 exports.userTest 속성에 User 인스턴스를 생성해 할당했으므로
// 아래와 같이 호출하게 되면 User 클래스를 그대로 사용할 수 있음
var user = require('./user9').userTest;

user.printUser();

/*
또는 아래처럼 사용 가능
var user = require('./user9');

user.userTest.printUser();
*/
var Person = {};

Person['age'] = 20;
Person['name'] = '아이즈원';
Person.add = function(a, b){
    return a + b;
};

console.log('더하기 : %d', Person.add(10, 11));

// 생성자
function User(id, name){
    this.id = id;
    this.name = name;
}

User.prototype.getUser = function(){
    return {id: this.id, name: this.name};
}

User.prototype.group = {id: 'group1', name: '친구'};

User.prototype.printUser = function(){
    console.log('user이름 : %s, group이름: %s', this.name, this.group.name);
}

exports.userTest = new User('test01', '아이즈원띵9');
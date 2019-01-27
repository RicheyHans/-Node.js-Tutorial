// module.exports에는 객체를 그대로 할당 할 수 있음
var user = {
    getUser : function(){
        return {id: 'test01', name: '아이즈원'};
    },
    group : {id: 'group01', name: '걸그룹'}
}

module.exports = user;
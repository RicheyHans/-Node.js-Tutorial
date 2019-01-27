// exports에 함수와 객체를 속성이 아닌 하나의 객체로 선언한다.
exports = {
    getUser : function(){
        return {id: 'test01', name: '아이즈원exports'};
    },
    group: {id: 'group01', name: '걸그룹exports'}
}
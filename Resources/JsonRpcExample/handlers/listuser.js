// 사용자 리스트 조회 함수
var listuser = function(parmas, callback){
    console.log('JSON-RPC listuser 호출됨');
    console.dir(params);

    // DB객체 참조
    var database = global.database;     // 서버 실행 시 global 전역 변수에 속성으로 추가되었음
    if(database){
        console.log('database 객체 참조됨');
    } else {
        console.log('database 객체 참조 불가');
        callback({
            code: 410,
            message: ' database 객체 참조 불가'
        }, null);
        
        return;
    }

    if(database.db){
        // 1. 모든 사용자 검색
        database.UserModel.findAll(function(err, results){
            if(err){
                callback({
                    code: 410,
                    message: err.message
                }, null);

                return;
            }

            if(results){
                console.log('결과물 문서 데이터의 갯수: %d', results.length);

                var output = [];
                for(var i = 0; i < results.length; i++){
                    var curId = results[i]._doc.id;
                    var curName = results[i]._doc.name;
                    output.push({id:curId, name:curName});
                }

                console.dir(output);
                callback(null, output);
            } else {
                callback({
                    code: 410,
                    message: '사용자 리스트 조회 실패'
                }, null);
            }
        });
    } else {
        callback({
            code: 410,
            message: '데이터베이스 연결 실패'
        }, null);    
    }
};

module.exports = listuser;
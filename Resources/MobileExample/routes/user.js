var listuser = function(req, res){
    console.log('user 모듈 내의 listuser 호출');

    // DB 객체 참조
    var database = req.app.get('database');

    // DB 객체 초기화 시, 모델 객체의 findAll 메소드 호출
    if(database.db){
        // 모든 사용자 검색
        database.UserModel.findAll(function(err, results){
            // 오류 발생
            if(err){
                console.error('사용자 리스트 조회 오류 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 리스트 조회 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }

            if(results){
                console.dir(results);

                res.writeHead('200', {'Content-Type':'application/json;charset=utf8'});
                res.write(JSON.stringify(results));
                res.end();
            } else {
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 리스트 조회  실패</h2>');
				res.end();
            }
        });
    } else {
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
    }
};

module.exports.listuser = listuser;
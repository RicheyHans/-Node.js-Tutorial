

// 로그인 관련 라우팅 처리
var login = function(req, res){
    console.log('user모듈 안의 login 호출됨');

    // 요청 파라미터 확인
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
	
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword);

    	
    // 데이터베이스 객체 참조
    var database = req.app.get('database');
    
    // 데이터베이스(database 변수)가 정상적으로 초기화 되었다면 authUser 함수로 검증을 진행
    if(database.db){
        authUser(database, paramId, paramPassword, function(err, docs){
            if (err) {
                console.error('사용자 로그인 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 로그인 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }

          // authUser 함수에서, users 컬렉션에서 아이디와 패스워드가 매칭되면 callback함수에
          // callback(null,docs)로 docs를 파라미터로 전달되게 선언됨
          if(docs) {
            console.dir(docs);
            var username = docs[0].name;
            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
			res.write('<h1>로그인 성공</h1>');
			res.write('<div><p>사용자 아이디 : ' + paramId + '</p></div>');
			res.write('<div><p>사용자 이름 : ' + username + '</p></div>');
			res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
			res.end();
          } else {  // 조회된 기록이 없는 경우
            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
            res.write('<h1>로그인  실패</h1>');
            res.write('<div><p>아이디와 패스워드를 다시 확인하십시오.</p></div>');
            res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
            res.end();
          }
        });
    } else {  // 데이터베이스 객체가 초기화 되지 않음
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
		res.end();
    }
};

// 사용자 추가 관련 라우팅 처리
var adduser = function(req, res){
    console.log('user모듈 안의 adduser 호출됨');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;

    console.log('요청 파라미터 : ' + paramId + ',' + paramPassword + ',' + paramName);

    // 데이터베이스 객체 참조
	var database = req.app.get('database');

    // 데이터베이스 정상 초기화 시, addUser 함수 호출
    if(database.db){
        addUser(database, paramId, paramPassword, paramName, function(err, result){
            if(err) {throw err;}

            // 결과 객체 확인하여 추가 데이터가 있을 경우 성공 응답 전송
            if(result && result.insertedCount > 0){
                console.dir(result);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 성공</h2>');
                res.end();
            } else { // 결과 객체가 없을 경우 실패 응답 전송
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 실패</h2>');
                res.end();
            }
        });
    } else {    // 데이터베이스 객체 초기화 실패
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
};

// 사용자 리스트 조회 관련 라우팅 처리
var listuser = function(req, res){

    console.log('user모듈 안의 listuser 호출됨');
    
    // 데이터베이스 객체 참조
	var database = req.app.get('database');

    // 데이터베이스 객체 초기화 된 경우, 모델 객체의 findAll 메소드 호출
    if(database.db){
        // 1. 모든 사용자 검색
        database.UserModel.findAll(function(err, results){
            if(err){
                console.error('사용자 리스트 조회 중 오류 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>사용자 리스트 조회 중 오류 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            }
            
            if(results){    // 결과 객체가 있을 경우 리스트 전송
                console.dir(results);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>사용자 리스트</h2>');
                res.write('<div><ul>');

                for(var i = 0; i < results.length; i++){
                    var curId = results[i]._doc.id;
                    var curName = results[i]._doc.name;
                    res.write('     <li>#' + i + ' : ' + curId + ',' + curName + '</li>');
                }
                res.write('</ul></div>');
                res.end();
            } else {    // 결과 객체가 없으면 실패 응답
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>사용자 리스트 조회 실패</h2>');
                res.end();
            }
        });
    } else {    // 데이터베이스 객체가 초기화 되지 않았을 때 실패 응답 전송
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();

    }
};

// 사용자를 인증하는 함수 : 아이디 먼저 찾고 이후 비밀번호를 비교
var authUser = function(database, id, password, callback){
    console.log('authUser 호출됨 : ' + id + ',' + password);

    // 1. 아이디를 사용해 검색
    database.UserModel.findById(id, function(err, results){
        if(err){
            callback(err, null);
            return;
        }
        console.log('아이디 [%s]로 사용자 검색 결과', id);
        console.dir(results);

        if(results.length > 0){
            console.log('아이디와 일치하는 사용자 찾음');

            // 2. 아이디가 일치하는 사용자를 찾았을 경우에 비밀번호 검색
            // 모델 인스턴스 객체를 만들고, authenticate() 메소드 호출
            var user = new database.UserModel({id: id});
            var authenticated = user.authenticate(password, results[0]._doc.salt,
                                                    results[0]._doc.hashed_password);
            if(authenticated){
                console.log('비밀번호 일치함');
                callback(null, results);
            } else {
                console.log('비밀번호 일치하지 않음');
                callback(null, null);
            }
        }        

    });
};

// 사용자를 추가하는 함수
var addUser = function(database, id, password, name, callback){
    console.log('addUser 함수 호출');

    // UserModel 인스턴스 생성 - save() 메소드 사용을 위함
    var user = new database.UserModel({'id': id, 'password': password, 'name': name});

    // save()로 저장
    user.save(function(err){
        if(err){
            callback(err, null);
            return;
        }
        console.log('사용자 데이터를 추가함');
        callback(null, user);
    });
};

module.exports.login = login;
module.exports.adduser = adduser;
module.exports.listuser = listuser;
var crypto = require('crypto');

// module.exports에 할당하기 위해서 임의의 객체를 생성
var Schema = {};


Schema.createSchema = function(mongoose){       // app.js에서 mongoose 객체를 그대로 활용하기 위함

    // 스키마 정의
    var UserSchema = mongoose.Schema({
        email: {type: String, 'default':''}
	    , hashed_password: {type: String, 'default':''}
	    , salt: {type: String}
	    , name: {type: String, index: 'hashed', 'default':''}
	    , created_at: {type: Date, index: {unique: false}, 'default': Date.now}
        , updated_at: {type: Date, index: {unique: false}, 'default': Date.now}
        , provider: {type: String, 'default': ''}
        , authToken: {type: String, 'default': ''}
        , facebook: {}
    });

    // password속성 virtual 메소드로 정의하고 set, get 메소드 선언
    UserSchema.virtual('password')
              .set(function(password){
                this._password = password;
                this.salt = this.makeSalt();
                this.hashed_password = this.encryptPassword(password);
                console.log('virtual password 호출됨 : ' + this.hashed_password);
              })
              .get(function() { return this._password });

    // 스키마에 모델 인스턴스에서 사용할 수 있는 메소드를 추가 - 비밀번호 암호화
    
    // encryptPassword 메소드는 비밀번호와 salt값을 전달 받아 crypto 모듈로 암호화
    UserSchema.method('encryptPassword', function(plainText, inSalt){
        if(inSalt){
            return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
        } else {
            return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
        }
    });

    // salt 값 만들기 메소드 - 랜덤 값을 하나 만들어 냄
    UserSchema.method('makeSalt', function(){
        return Math.round((new Date().valueOf() * Math.random())) + '';
    });

    // 인증 메소드(true, false 리턴)
    UserSchema.method('authenticate', function(plainText, inSalt, hashed_password){
       if(inSalt) {
           console.log('authenticate 호출됨 : %s -> %s : %s', plainText,
                        this.encryptPassword(plainText, inSalt), hashed_password);
           return this.encryptPassword(plainText, inSalt) == hashed_password;
       } else {
           console.log('authenticate 호출됨 : %s -> %s : %s', plainText,
                        this.encryptPassword(plainText), hashed_password);
           return this.encryptPassword(plainText) == this.hashed_password;
       }
    });

    // 스키마 객체의 path()메소드를 호출한 후, validate() 메소드를 호출하면 유효한 값인지 확인
    // 필수 속성에 대한 유효성 확인(길이 값 체크)
    UserSchema.path('email').validate(function(email){
        return email.length;
    }, 'email 칼럼의 값이 없습니다.');

    /*
    UserSchema.path('hashed_password').validate(function(hashed_password){
        return hashed_password.length;
    }, 'hashed_password 칼럼의 값이 없습니다.');
    */
   
    // 스키마에 static으로 findById 메소드 추가
	UserSchema.static('findByEmail', function(email, callback) {
		return this.find({email: email}, callback);
	});
	
    // 스키마에 static으로 findAll 메소드 추가
	UserSchema.static('findAll', function(callback) {
		return this.find({}, callback);
	});
	
    console.log('UserSchema 정의함.');
    
    // UserSchema 객체에 모든 DB 스키마를 정의하고, 메소드를 선언한 후 해당 변수를 리턴한다.
    // app.js에서는 user_schema.js 모듈을 로드한 후, 이 함수를 실행 시켜 스키마를 리턴받아 별도 객체에 저
    return UserSchema;
};

// module.exports에 UserSchema 객체 할당
module.exports = Schema;
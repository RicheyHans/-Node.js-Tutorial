var local_login = require('./passport/local_login');
var local_signup = require('./passport/local_signup');
var facebook = require('./passport/facebook');

// 이 함수 실행 시에는 app, passport 객체를 사용하므로 호출 시 app과 passport 객체를
// 파라미터로 전달해줘야 정상적으로 실행이 가능하다.
module.exports = function(app, passport){   
    console.log('config/passport 호출됨');
    
    // 사용자 인증에 성공했을 때 호출
    passport.serializeUser(function(user, done){
        console.log('serializeUser() 호출됨');
        console.dir(user);

        done(null, user);
    });

    // 사용자 인증 이후 사용자 인증 요청 있을 때 호출
    passport.deserializeUser(function(user, done){
        console.log('deserializeUser() 호출됨');
        console.dir(user);

        done(null, user);
    });

    // 인증방식 설정
    passport.use('local-login', local_login);
    passport.use('local-signup', local_signup);
    passport.use('facebook', facebook(app, passport));
};
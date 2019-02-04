var FacebookStrategy = require('passport-facebook').Strategy;
var config = require('../config');

module.exports = function(app, passport){
    return new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL,
        profileFields: ['id', 'emails', 'name']
    }, function(accessToken, refreshToken, profile, done){
        console.log('passport의 facebook 호출됨');
        console.dir(profile);

        var options = {
            criteria: {'facebook.id': profile.id}
        };

        var database = app.get('database');
        database.UserModel.findOne({'facebook.id': profile.id}, function(err, user){
            if(err) { return done(err); }

            if(!user){
                console.log('없던 계정이니 새로운 모델을 생성합니다.');

                var user = new database.UserModel({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    provider: 'facebook',
                    authToken: accessToken,
                    facebook: profile._json
                });

                user.save(function(err){
                    if (err) console.log(err);
                    return done(err, user);
                });
            } else {
                console.log('로그인 이력이 있는 사용자입니다.');
                return done(err, user);
            }
        });
    })
}
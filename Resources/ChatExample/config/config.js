// 설정 파일
module.exports = {
    server_port : 3000,
    db_url : 'mongodb://localhost:27017/local',
    db_schemas: [
        {file: './user_schema', collection: 'users6', schemaName: 'UserSchema',
         modelName: 'UserModel'}
    ],
    route_info: [
    ],
    facebook: {
        clientID: '545274919298556',
        clientSecret: 'e8b46f9d5aef0f2d099f5e01917e24e8',
        callbackURL: '/auth/facebook/callback'
    }
}
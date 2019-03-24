// 설정 파일
module.exports = {
    server_port : 3000,
    db_url : 'mongodb://localhost:27017/local',
    db_schemas: [
        {file: './user_schema', collection: 'users6', schemaName: 'UserSchema',
         modelName: 'UserModel'},
         {file: './coffeeshop_schema', collection: 'coffeeshop', 
         schemaName: 'CoffeeShopSchema', modelName: 'CoffeeShopModel'}
    ],
    route_info: [
        {file:'./coffeeshop', path:'/process/addcoffeeshop', method:'add', type:'post'}	 
        ,{file:'./coffeeshop', path:'/process/listcoffeeshop', method:'list', type:'post'}
        ,{file:'./coffeeshop', path:'/process/nearcoffeeshop', method:'findNear', type:'post'}
        ,{file:'./coffeeshop', path:'/process/withincoffeeshop', method:'findWithin', type:'post'}
        ,{file:'./coffeeshop', path:'/process/circlecoffeeshop', method:'findCircle', type:'post'}
        ,{file:'./coffeeshop', path:'/process/nearcoffeeshop2', method:'findNear2', type:'post'}
    ],
    facebook: {
        clientID: '545274919298556',
        clientSecret: 'e8b46f9d5aef0f2d099f5e01917e24e8',
        callbackURL: '/auth/facebook/callback'
    }
}
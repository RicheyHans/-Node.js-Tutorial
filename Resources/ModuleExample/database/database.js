var mongoose = require('mongoose');

// database 객체에 db, schema, model 추가
var database = {};

database.init = function(app, config){
    console.log('init() 호출됨');

    connect(app, config);
}

// 데이터베이스에 연결하고, 응답 객체의 속성으로 db객체 추가
function connect(app, config){    // config는 database를 init하는 파일 내에서 config를 파라미터로 전달
    console.log('connect() 호출됨');

    // 데이터베이스 연결
    mongoose.Promise = global.Promise;
    mongoose.connect(config.db_url);
    database.db = mongoose.connection;      // 이전까지 database라는 변수에 저장해서 초기화, 이벤트 설정

    database.db.on('error', console.error.bind(console, 'mongoose connection error'));
    database.db.on('open', function(){
        console.log('데이터베이스에 연결되었습니다 : ' + config.db_url);

        // config에 등록된 스키마 및 모델객체 생성
        createSchema(app, config);
      
    });
    database.db.on('disconnected', connect);
}


// config에 등록된 스키마 및 모델객체 생성
function createSchema(app, config){
    var schemaLeng = config.db_schemas.length;          // config내 db_schemas의 배열 개수
    console.log('설정에 정의된 스키마의 수 : %d', schemaLeng);

    for(var i = 0; i < schemaLeng; i++){
        var curItem = config.db_schemas[i];

        // 모듈 파일에서 모듈 로드 후 createSchema() 함수 호출하기
        var curSchema = require(curItem.file).createSchema(mongoose);
        console.log('%s 모듈을 불러들인 후 스키마 정의함', curItem.file);     // user_schema.js

        // User모델 정의
        var curModel = mongoose.model(curItem.collection, curSchema);   
        console.log('%s 컬렉션을 위해 모델 정의함', curItem.collection);

        // database 객체에 속성으로 추가
        database[curItem.schemaName] = curSchema;
        database[curItem.modelName] = curModel;
        console.log('스키마 이름 [%s], 모델 이름 [%s]이 database 객체의 속성으로 추가됨',curItem.schemaName, curItem.modelName);
    }

        app.set('database', database);
        console.log('database 객체가 app 객체의 속성으로 추가됨');
}

// database 객체를 module.exports에 할당
module.exports = database;
// 이후 req.app.get('database')코드로 database 객체를 참조할 수 있게 된다.
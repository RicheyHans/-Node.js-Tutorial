var Schema = {};

Schema.createSchema = function(mongoose){

    // 스키마 정의
    var CoffeeShopSchema = mongoose.Schema({
        name: {type: String, index: 'hashed', 'default': ''},
        address: {type: String, 'default': ''},
        tel: {type: String, 'default': ''},
        // 경도와 위도 좌표를 저장하며 두 개의 객체 보유
        geometry: {         
            'type': {type: String, 'default': "Point"},     // 위치 정보의 유형 구별
            coordinates: [{type: "Number"}]                 // 위치 좌표 입력할 수 있는 배열로 정의됨
        },
        created_at: {type: Date, index: {unique: false}, 'default': Date.now},
	    updated_at: {type: Date, index: {unique: false}, 'default': Date.now}
    });

    // 스키마 속성 중, geometry 속성에 인덱스를 부여해 조회 속도를 높인다.
    CoffeeShopSchema.index({geometry: '2dsphere'});

}
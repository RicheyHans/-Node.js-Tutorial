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

    // 스키마에 static 메소드를 선언한다(DB에서 검색 시 사용)

    // 모든 카페 조회
    CoffeeShopSchema.static('findAll', function(callback){
        return this.find({}, callback);
    });

    // 가장 가까운 카페 조회
    // near()에서 기준점의 위치와 기준점으로부터 최대 거리를 조건으로 설정한다.
    CoffeeShopSchema.static('findNear', function(longitude, latitude, maxDistance, callback){
        console.log('CoffeeShopSchema의 findNear 호출됨');

        // parseFloat()로 문자열을 숫자로 변환하고, limit()로 한 개의 정보만 불러오게 설정한다.
        this.find().where('geometry').near(
            {center: {type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)]},
                maxDistance: maxDistance}).limit(1).exec(callback);
    });
    
    console.log('CoffeeShopSchema 정의함.');

    // 일정 사각형 범위 내 카페 조회
    CoffeeShopSchema.static('findWithin', function(topleft_longitude, topleft_latitude, 
        bottomright_longitude, bottomright_latitude, callback){
            console.log('CoffeeShopSchema의 findWithin 호출');

            this.find().where('geometry').within({box:[[parseFloat(topleft_longitude), parseFloat(topleft_latitude)], [parseFloat(bottomright_longitude), parseFloat(bottomright_latitude)]]}).exec(callback);
        });

	return CoffeeShopSchema;
}

module.exports = Schema;
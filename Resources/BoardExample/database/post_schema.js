/*
게시판을 위한 DB스키마 정의
*/

var utils = require('../utils/utils');

var SchemaObj = {};

SchemaObj.createSchema = function(mongoose){
    
    // 게시글(post)의 스키마 정의
    var PostSchema = mongoose.Schema({
        title: {type: String, trim: true, 'default':''},
        contents: {type: String, trim: true, 'default':''},
        writer: {type: mongoose.Schema.ObjectId, ref: 'users6'}, // DB 컬렉션 users6 내의 ObjectId를 참조
        // 댓글은 여러개 달릴 수 있으므로 배열 타입으로 정의
        comments: [{
            contents: {type: String, trim: true, 'defualt': ''},
            writer: {type: mongoose.Schema.ObjectId, ref: 'users6'},
            created_at: {type: Date, 'default': Date.now}
        }],
        tags: {type: [], 'default': ''},
        created_at: {type: Date, index: {unique: false}, 'default': Date.now},
        updated_at: {type: Date, index: {unique: false}, 'default': Date.now}
    });

    // 제목, 내용을 필수로 입력하도록 설정
    PostSchema.path('title').required(true, '글 제목을 입력하셔야 합니다.');
    PostSchema.path('contents').required(true, '글 내용을 입력하셔야 합니다.');

    // 모델 인스턴스에서 호출할 수 있는 인스턴스 메소드 추가
    PostSchema.methods = {
        savePost: function(callback){
            var self = this;

            this.validate(function(err){
                if(err) return callback(err);

                self.save(callback);
            });
        },
        addComment: function(user, comment, callback){
            this.comment.push({
                contents: comment.contents,
                writer: user._id
            });

            this.save(callback);
        },
        removeComment: function(id, callback){
            var index = utils.indexOf(this.comments, {id: id});

            if(~index){
                this.comments.splice(index, 1);
            } else {
                return callback('ID [' + id + '] 를 가진 댓글 객체를 찾을 수 없음');
            }
            this.save(callback);
        }
    }

    PostSchema.statics = {
        // ID로 글 찾기
        load: function(id, callback){
            this.findOne({_id: id})
                .populate('writer', 'name provider email')
                .populate('comments.writer')
                .exec(callback);
        },
        list: function(options, callback)        {
            var criteria = options.criteria || {};

            this.find(criteria)
                .populate('writer', 'name provider email')
                .sort({'created_at': -1})
                .limit(Number(options.perPage))
                .skip(options.perPage * options.page)
                .exec(callback);
        }
    }

    console.log('PostSchema 정의함');

    return PostSchema;

};

module.exports =SchemaObj;
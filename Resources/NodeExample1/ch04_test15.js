// https://www.npmjs.com/package/winston 참고

var fs = require('fs');

var winston = require('winston');          // 로그 처리 모듈
var winstonDaily = require('winston-daily-rotate-file');   // 로그 daily 처리 모듈
var moment = require('moment');     // 시간 처리 모듈

function timeStampFormat(){
    return moment().format('YYYY-MM-DD HH:mm:ss.SSS ZZ');
    // ex) '2016-05-01 20:14:28.500 +0900'
};

var logger = new (winston.Logger)({
    transports: [
        new (winstonDaily)({
            name: 'info-file',
            filename: './log/server',
            datePattern: '_yyyy-MM-dd.log',
            colorize: false,
            maxsize: 50000000,
            maxFiles: 1000,
            level: 'info',
            showLevel: true,
            json: false,
            timestamp: timeStampFormat
        }),
        new (winston.transports.Console)({
            name: 'debug-console',
            colorize: true,
            level: 'debug',
            showLevel: true,
            json: false,
            timestamp: timeStampFormat
        })
    ],
    exceptionHandlers: [
        new (winstonDaily)({
            name: 'exception-file',
            filename: './log/exception',
            datePattern: '_yyyy-MM-dd.log',
            colorize: false,
            maxsize: 50000000,
            maxFiles: 1000,
            level: 'error',
            showLevel: true,
            json: false,
            timestamp: timeStampFormat
        }),
        new (winston.transports.Console)({
            name: 'exception-console',
            colorize: true,
            level: 'debug',
            showLevel: true,
            json: false,
            timestamp: timeStampFormat
        })
    ]
});


var inname = './output.txt';
var outname = './output2.txt';

fs.exists(outname, function(exists){
    if(exists){
        fs.unlink(outname, function(err){
            if(err) throw err;
            logger.info('기존파일 [' + outname + '] 삭제함');
        });
    }
    var infile = fs.createReadStream(inname, {flags: 'r'});
    var outfile = fs.createWriteStream(outname, {flags: 'w'});
    infile.pipe(outfile);
    logger.info('파일 복사 [' + inname + '] -> [' + outname + ']');
});
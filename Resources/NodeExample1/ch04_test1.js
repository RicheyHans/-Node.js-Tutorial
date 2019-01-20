var url = require('url');

// 주소 string을 URL 객체로 변환
var curURL = url.parse('https://m.search.naver.com/search.naver?query=steve+jobs&where=m&sm=mtp_hty');

// URL 객체를 주소 string으로 변환
var curStr = url.format(curURL);

console.log('주소 문자열 : %s', curStr);
// URL 객체를 호출
console.dir(curURL);                

// 요청 파라미터 구분
var querystring = require('querystring');
var param = querystring.parse(curURL.query);

console.log('요청 파라미터 중 query의 값 : %s', param.query);
// steve jobs
console.log('원본 요청 파라미터 : %s', querystring.stringify(param));
//  query=steve%20jobs&where=m&sm=mtp_hty
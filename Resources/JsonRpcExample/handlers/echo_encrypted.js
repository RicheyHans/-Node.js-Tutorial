// 클라이언트에서 보내온 파라미터 데이터를 복호화 한 후, 콘솔에 출력하고
// '->서버에서 보냄'을 붙여 암호화 해 클라이언트에 응답으로 보낸다.

var crypto = require('crypto-js');

// echo 함수
var echo = function(params, callback) {
	console.log('JSON-RPC echo_encrypted 호출됨.');
	console.dir(params);
	
	try {
		// 복호화 테스트
		var encrypted = params[0];
		
		var secret = 'my secret';
		var decrypted = crypto.AES.decrypt(encrypted, secret).toString(crypto.enc.Utf8);
		 
		console.log('복호화된 데이터 : ' + decrypted);
		
		// 암호화 테스트
		var encrypted = '' + crypto.AES.encrypt(decrypted + ' -> 서버에서 보냄.', secret);
		console.log(encrypted);
		
		params[0] = encrypted;
		
	} catch(err) {
		console.dir(err);
		console.log(err.stack);
	}
	
	callback(null, params);
};

module.exports = echo;

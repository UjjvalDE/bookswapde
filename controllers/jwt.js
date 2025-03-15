const loginTokenModal = require('../models/login_token/login_token.js');

module.exports = {
	/*
		API Name: register
	*/
	DECODE: async function (req, callback) {
		//send data
		var sendData = {
			ReturnCode: 200,
			err: 0,
			Data: {},
			ReturnMsg: ""
		};
		if (!req.headers['authorization']) {
			sendData['ReturnCode'] = 406;
			sendData['ReturnMsg'] = 'No access token provided';
			callback(sendData);
		} else {

			try {
				const accessToken = req.headers.authorization.split(' ')[1];
				const decoded = jwt.verify(accessToken, process.env.SECRET_KEY);

				if (decoded) {
					var condition = {
						user_id: decoded._id,
						token: accessToken
					}
					var tokenData = await loginTokenModal.find(condition)

					if (tokenData.length > 0) {
						if (typeof decoded._id != "undefined") {
							sendData['ReturnCode'] = 200;
							sendData['Data'] = decoded;
							callback(sendData);
						} else {
							sendData['ReturnCode'] = 401;
							sendData['ReturnMsg'] = 'Access token invalid';
							callback(sendData);
						}
					} else {
						sendData['ReturnCode'] = 401;
						sendData['ReturnMsg'] = 'token Expired';
						callback(sendData);
					}
				} else {
					sendData['ReturnCode'] = 401;
					sendData['ReturnMsg'] = 'token Expired';
					callback(sendData);
				}



			} catch (error) {
				sendData['ReturnCode'] = 401;
				sendData['ReturnMsg'] = 'token Expired';
				callback(sendData);
			}
		}
	},
}

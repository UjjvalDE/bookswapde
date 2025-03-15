//const { pdfUpload } = require("../uploads3");

module.exports = {
	//socketio - send data function
	sendData: function (en, data, status, sd) {
		if (typeof sd == 'undefined' || sd == '' || sd == null || sd == 0) return false;

		var sendData = {
			data: data,
			en: en,
			status: status
		};
		if (typeof clients != "undefined" && typeof clients[sd] != "undefined") {
			clients[sd].emit('res', sendData);
		} else {
			io.to(sd).emit("res", sendData);
		}
	},
	//socketio - send data in to room
	sendDatatoTable: function (en, data, status, sd) {
		if (typeof sd == 'undefined' || sd == '' || sd == null || sd == 0) return false;

		var sendData = {
			data: data,
			en: en,
			status: status
		};
		io.to(sd).emit("res", sendData);
	},
	//send data to all
	sendDataToAll: function (en, data, status) {

		var sendData = {
			data: data,
			en: en,
			status: status
		};
		//io.to(sd).emit('res',sendData);
		io.emit("res", sendData);
	},
	errorValidationResponse: function (data) {
		var sendData = {
			ReturnCode: 406,
			err: 1,
			Data: data,
			ReturnMsg: "Please Enter All Fields"
		};
		return sendData;
	},
	GetTimeDifference: function (startDate, endDate, type) {
		var date1 = new Date(startDate);
		var date2 = new Date(endDate);
		var diffMs = (date2 - date1);

		if (type == 'day') {
			var timeDiff = Math.abs(date2.getTime() - date1.getTime());
			var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
			return diffDays;
		}
		else if (type == 'hour')
			return Math.round((diffMs % 86400000) / 3600000);
		else if (type == 'minute')
			return Math.round(((diffMs % 86400000) % 3600000) / 60000);
		else
			return Math.round((diffMs / 1000));
	},
	getRandomNumber: function (length) {
		var text = "";
		var possible = "0123456789";
		for (var i = 0; i < length; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	},
	getRandomCode: function (length) {
		var text = "";
		var possible = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
		for (var i = 0; i < length; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	},
	chunkArray: function (myArray, chunk_size) {
		var index = 0;
		var arrayLength = myArray.length;
		var tempArray = [];

		for (index = 0; index < arrayLength; index += chunk_size) {
			myChunk = myArray.slice(index, index + chunk_size);
			// Do something if you want with the group
			tempArray.push(myChunk);
		}

		return tempArray;
	},
	shuffle: function (array) {
		var currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	},
	inArray: function (haystack, needle) {
		var length = haystack.length;
		for (var i = 0; i < length; i++) {
			if (haystack[i] == needle) return true;
		}
		return false;
	},
	paginationSetup: function (start, limit, numRows, currentRows, type = '') {
		var paginator = new pagination.SearchPaginator({ prelink: '/', current: start, rowsPerPage: limit, totalResult: numRows });
		var paginationData = paginator.getPaginationData();

		if (type == "") {
			var html = '';
			if (paginationData.previous != null) {
				html += '<li class="page-item previous"><a href="#" onclick="pagination(' + paginationData.previous + ');" class="page-link"><i class="previous"></i></a></li>';
			}
			for (var i = 0; i < paginationData.range.length; i++) {
				html += '<li class="page-item ' + ((paginationData.current == paginationData.range[i]) ? 'active' : '') + '"><a href="#" onclick="pagination(' + paginationData.range[i] + ');" class="page-link">' + paginationData.range[i] + '</a></li>';
			}
			if (paginationData.next != null) {
				html += '<li class="page-item previous"><a href="#" onclick="pagination(' + paginationData.next + ');" class="page-link"><i class="next"></i></a></li>';
			}
			var text = "Showing " + (((start - 1) * limit) + 1) + " to " + (((start - 1) * limit) + currentRows) + " of " + numRows + " entries";
			if (numRows == 0) {
				text = "Showing " + 0 + " to " + 0 + " of " + numRows + " entries";
			}
			var respData = {
				html: html,
				text: text
			};
			return respData;
		} else {
			var html = '';
			if (paginationData.previous != null) {
				html += '<li class="page-item previous"><a href="#" onclick="pagination(' + paginationData.previous + ', \'' + type + '\');" class="page-link"><i class="previous"></i></a></li>';
			}
			for (var i = 0; i < paginationData.range.length; i++) {
				html += '<li class="page-item ' + ((paginationData.current == paginationData.range[i]) ? 'active' : '') + '"><a href="#" onclick="pagination(' + paginationData.range[i] + ', \'' + type + '\');" class="page-link">' + paginationData.range[i] + '</a></li>';
			}
			if (paginationData.next != null) {
				html += '<li class="page-item previous"><a href="#" onclick="pagination(' + paginationData.next + ', \'' + type + '\');" class="page-link"><i class="next"></i></a></li>';
			}
			var text = "Showing " + (((start - 1) * limit) + 1) + " to " + (((start - 1) * limit) + currentRows) + " of " + numRows + " entries";
			if (numRows == 0) {
				text = "Showing " + 0 + " to " + 0 + " of " + numRows + " entries";
			}
			var respData = {
				html: html,
				text: text
			};
			return respData;
		}
	},
	dateFormat: function (date) {
		var today = new Date(date);

		var date1 = today;
		var month = date1.getMonth() + 1;
		var day = date1.getDate();
		var hour = date1.getHours();
		var sec = date1.getSeconds();
		var min = date1.getMinutes();
		return date1.getFullYear() + "-" + ((month > 9) ? month : '0' + month) + "-" + ((day > 9) ? day : '0' + day) + " " + ((hour > 9) ? hour : '0' + hour) + ':' + ((min > 9) ? min : '0' + min) + ':' + ((sec > 9) ? sec : '0' + sec);
	},
	__sendEmail: function (receiver_email, subject, html, link) {
		// require()
		var trtransporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: 'ujjvalvaghasiya@gmail.com',
				pass: 'ppbm exwx eacc sxrs'
			}
		});
		if (link) {
			console.log("link>>>>>", link);
			let name = link.split('/').reverse()[0];

			var mailOptions = {
				from: 'Bookswap<ujjvalvaghasiya@gmail.com>',
				to: receiver_email,
				subject: subject,
				html: html,
				attachments: [{   // utf-8 string as an attachment
					filename: name,
					path: link,
				}],
			}
		} else {
			var mailOptions = {
				from: 'Bookswap<ujjvalvaghasiya@gmail.com>',
				to: receiver_email,
				subject: subject,
				html: html,
			}
		}

		console.log(mailOptions);

		trtransporter.sendMail(mailOptions, function (err, info) {
			if (err) {
				console.log("13", err)
			} else {
				console.log('email send:' + info.response)
			}

		});

	},
	formatTimeToHHMMSS: function (seconds = 0, isHr = true, isMin = true, isSec = true) {
		seconds = Math.abs(seconds)
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = Math.round(seconds % 60);
		return [
			isHr ? h > 0 ? h < 10 ? '0' + h : h : "00" : "",
			isMin ? m > 0 ? m < 10 ? '0' + m : m : "00" : "",
			isSec ? s > 0 ? s < 10 ? '0' + s : s : "00" : ""
		].filter(Boolean).join(':');
	},
	addDaysToDate: function (date, days) {
		if (!date || typeof date !== 'object') return new Date()
		let d = new Date(date)
		return new Date(d.setDate(d.getDate() + days))
	},
	addMinsToDate: function (date, mins) {
		if (!date || typeof date !== 'object') return new Date()
		let d = new Date(date)
		return new Date(d.setMinutes(d.getMinutes() + mins))
	},
	groupBy: (collection, iteratee, idKey, itemsKey) => {
		const groupResult = _.groupBy(collection, iteratee);
		return Object.keys(groupResult).map((key) => {
			return { [idKey]: key, [itemsKey]: groupResult[key] };
		});
	},
	sortByDate: function (a, b, dateField, order = 1) {
		// this function can sort data of only level 1 nested date 
		// for ascending order pass 1, for descending order pass -1
		var dateA = new Date(a[dateField]);
		var dateB = new Date(b[dateField]);
		return order === 1 ? dateA - dateB : dateB - dateA;
	},
	hmsToSecondsOnly: function (hms) {
		if (!hms) return 0
		const a = hms.split(':'); // split it at the colons

		// minutes are worth 60 seconds. Hours are worth 60 minutes.
		const seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
		return seconds
	},
	mathRound: function (number, digit = 3) {
		try {
			if (Number(number) < 1) digit = 3;
			if (number) return Number(_.round(Number(number), digit));
		} catch (e) { }
		return Number(Number(0).toFixed(digit));
	}
}
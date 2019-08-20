const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(process.cwd(), 'private.env') });
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);

var urlShortenerSchema = new mongoose.Schema({
	link: String,
	shortId: Number
});
var URLShortener = mongoose.model('URLShortener', urlShortenerSchema);


var createUrl = (urlLink, done) => {
	console.log("New URL:", urlLink);
	URLShortener.findOne()
		.sort({ "shortId": -1 })
		.limit(1)
		.exec(function (err, data) {
			if (err) {
				console.log("error 1: ", err);
				done(err);
			} else {
				let nextId = 1;
				if (data){
					nextId = data.shortId + 1;
				}
				let objUrl = {
					link: urlLink,
					shortId: nextId
				}
				let url = new URLShortener(objUrl);
				url.save((err, data) => err ? done(err) : done(err, data));
			}
		});
};


var findUrlByShortId = (id, done) => {
	URLShortener.findOne({ shortId: id }, (err, data) => err ? done(err) : done(null,data));
};

exports.URLShortenerModel = URLShortener;
exports.createUrl = createUrl;
exports.findUrlByShortId = findUrlByShortId;
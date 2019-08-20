'use strict';
/*
	npm install express mongodb mongoose cors dotenv path body-parser
*/
var express = require('express');
var dns = require("dns");
var cors = require('cors');
var bodyParser = require('body-parser');
var router = express.Router();

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

// global setting for safety timeouts to handle possible
// wrong callbacks that will never be called
var timeout = 10000;

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
	res.sendFile(process.cwd() + '/views/index.html');
});


// your first API endpoint...
app.get("/api/hello", function (req, res) {
	res.json({ greeting: 'hello API' });
});

// Create new
const createUrl = require("./myApp").createUrl;
router.post("/shorturl/new", function (req, res, next) {
	var t = setTimeout(() => { next({ message: 'timeout' }) }, timeout);
	let url = req.body.url;
	console.log(req.body);
	if (!url) {
		clearTimeout(t);
		res.json({ error: "invalid URL" });
	} else {
		var s = url.split("/");
		dns.lookup(s[2], (err, address, family) => {
			if (err) { clearTimeout(t); res.json({ error: "invalid URL" }); }
			else {
				createUrl(url, (err, data) => {
					clearTimeout(t);
					if (err) {
						next(err);
					} else {
						res.json({ original_url: data.link, short_url: data.shortId });
					}
				})
			}
		})
	}

});


// Find and redirect
const findUrl = require("./myApp").findUrlByShortId;
router.get("/shorturl/:input", function (req, res, next) {
	let checkS = /^[0-9]*$/;
	let input = req.params.input;
	if (!checkS.test(input)) {
		req.json({ error: "Wrong Format" })
	} else {
		var t = setTimeout(() => { next({ message: 'timeout' }) }, timeout);
		let id = parseInt(input);
		findUrl(id, (err, data) => {
			clearTimeout(t);
			if (err) {
				next(err);
			} else if (data == null) {
				res.json({ error: "No short url found for given input" });
			} else {
				res.writeHead(301, { Location: data.link });
				res.end();
			}
		});
	}
});


app.use('/api', router);

var listener = app.listen(port, function () {
	console.log('Node.js listening on port ' + listener.address().port);
});

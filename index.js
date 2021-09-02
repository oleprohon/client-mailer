require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require("nodemailer");
const moment = require('moment');
const fetch = require("node-fetch");
const { google } = require('googleapis');
const { OAuth2 } = google.auth;

const i360 = require('./immersion360-mail-contents');
const baobab = require('./baobab-mail-contents');
const arzo = require('./arzo-mail-contents');

const api = express();
const port = process.env.PORT;
const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground';

api.use(express.urlencoded());

const allowList = [
	'http://localhost',
	'https://baobab.finance',
	'https://immersion360.studio',
	'https://bge-quebec.com',
	'https://immersion-360-dev-gvqbz.ondigitalocean.app',
	'https://arzo.io'
];

const corsOptionsDelegate = function(req, callback) {
    let corsOptions;
    if (allowList.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

const oauth2Client = new OAuth2(process.env.G_CLIENT_ID, process.env.G_CLIENT_SECRET, process.env.G_REFRESH_TOKEN, OAUTH_PLAYGROUND);

const sendMail = async (to, subject, content, authorizedHost, callback) => {
    try {
        oauth2Client.setCredentials({ refresh_token: process.env.G_REFRESH_TOKEN });
        const accessToken = oauth2Client.getAccessToken();

        var smtpTransport;
        var from;
        if (typeof authorizedHost.smtp === "undefined") {
            smtpTransport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.EMAIL,
                    clientId: process.env.G_CLIENT_ID,
                    clientSecret: process.env.G_CLIENT_SECRET,
                    refreshToken: process.env.G_REFRESH_TOKEN,
                    accessToken
                },
            });
            from = process.env.EMAIL;
        } else {
            smtpTransport = nodemailer.createTransport(authorizedHost.smtp);
            from = authorizedHost.from;
        }

        const mailOptions = {
            from: from,
            to: to,
            subject: subject,
            html: content,
        };

        smtpTransport.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
                callback(false);
            } else {
                callback(true);
            }
        });
    } catch (e) {
        console.log(e);
        callback(false);
    }
};

const verifyReCaptchaSecretKey = async (req, secretKey, token, callback) => {
	// If testing mode or if the secret key is null, this process doesn’t need to use reCaptcha and so, no validation is required.
    if (process.env.MODE === "testing" || secretKey === null) {
        callback(true);
        return;
    }
    var ip = (req.headers['x-forwarded-for'] || '').split(',').shift() || (req.socket || '').remoteAddress;
    var requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: new URLSearchParams({
            secret: secretKey,
            response: token,
            remoteip: ip,
        })
    };
    fetch('https://www.google.com/recaptcha/api/siteverify', requestOptions)
    .then(response=>response.json())
    .then(function(response) {
		if (!response.success) {
			console.log(response);
		}
        callback(response.success);
    });
}

const authorizedHosts = [{
	host: 'http://localhost',
	token: '7gCWXKJc6fHPS98s4gN7db4BdyWQQs',
	format: i360,
	recipient: 'james@immersion360.studio',
	reCaptchaSecretKey: '6LdwztUbAAAAAPsh1FiypsXD0UCha2-ITGFYg7Cw'
}, {
	host: 'http://localhost:8181',
	token: 'Tn2wyFCAkrlaAelEnv10',
	format: baobab,
	recipient: 'olivier@oasis.engineering',
	reCaptchaSecretKey: null // If null, this host doesn’t use reCaptcha and no validation required.
}, {
	host: 'https://baobab.finance',
	token: 'Ut3GFuVEHmhyL6YOhnfs',
	format: baobab,
	recipient: 'olivier@oasis.engineering',
	reCaptchaSecretKey: null // If null, this host doesn’t use reCaptcha and no validation required.
}, {
	host: 'https://immersion360.studio',
	token: 'W3th04OFVQllnQZX8YFv',
	format: i360,
	recipient: 'olivier@immersion360.studio',
	reCaptchaSecretKey: '6LdwztUbAAAAAPsh1FiypsXD0UCha2-ITGFYg7Cw'
}, {
	host: 'https://immersion-360-dev-gvqbz.ondigitalocean.app',
	token: 'oiq98BfHdf9fbk',
	format: i360,
	recipient: 'olivier@immersion360.studio',
	reCaptchaSecretKey: '6LdwztUbAAAAAPsh1FiypsXD0UCha2-ITGFYg7Cw'
}, {
	host: 'http://localhost:3000',
	token: 'BYgixI2KoDGoETib0KMn1xscnSZJjrWMBUcKbKGM7dl4MLn9JihzyEPc514f',
	format: arzo,
	recipient: 'email',
	smtp: JSON.parse(process.env.ARZO_SMTP),
	from: 'application@arzo.io',
	reCaptchaSecretKey: '6LfWTA0cAAAAAPwiAvXtCA5Vf-9nqel7rLshLjRy' //reCaptcha public key: 6LfWTA0cAAAAAHX4SK6AUiuXpDs4H4BqYWP2giGW
}, {
	host: 'https://arzo.io',
	token: 'n3l3wJi4oe1qCtQbGxHn4qxymJckGSTYnYuaR7WMFcm2whhgK2hFRitpBHjR',
	format: arzo,
	recipient: 'email',
	smtp: JSON.parse(process.env.ARZO_SMTP),
	from: 'application@arzo.io',
	reCaptchaSecretKey: '6LfWTA0cAAAAAPwiAvXtCA5Vf-9nqel7rLshLjRy' //reCaptcha public key: 6LfWTA0cAAAAAHX4SK6AUiuXpDs4H4BqYWP2giGW
}];

api.post('/send', cors(corsOptionsDelegate), async (req, res) => {
    let reqToken = req.body.token;
    let reqHost = req.headers['origin'] || "http://localhost";

    try {
        let authorizedHost = authorizedHosts.find(auth => {
            return auth.token == reqToken;
        });

        if (authorizedHost === undefined) {
            throw new Error(`[${moment.utc().format('YYYY-MM-DD HH:mm:ss')}] Could not find token ${reqToken} coming from ${reqHost}.`);
        }

        if (authorizedHost.host != reqHost) {
            throw new Error(`[${moment.utc().format('YYYY-MM-DD HH:mm:ss')}] Found token ${reqToken} coming from ${reqHost} but expected host is ${authorizedHost.host}.`);
        }

        await verifyReCaptchaSecretKey(req, authorizedHost.reCaptchaSecretKey, (req.body.reCaptchaToken || ""), function(reCaptchaIsValid) {
            if (reCaptchaIsValid) {
                let [subject, content] = authorizedHost.format.loadContent((req.body.whichForm ? req.body.whichForm : "default"), req.body);
                var to = authorizedHost.recipient;
                if (to === "email") {
                    to = req.body.email;
                }
                sendMail(to, subject, content, authorizedHost, function(result) {
                    if (!result) {
                        console.log(`[${moment.utc().format('YYYY-MM-DD HH:mm:ss')}] Unexpected error while sending the email, see logs.`);
                        res.status(500).send('Error');
                    }
                    res.status(200).send('OK');
                });
            } else {
                console.log(`[${moment.utc().format('YYYY-MM-DD HH:mm:ss')}] ReCaptcha with token ${req.body.reCaptchaToken} is not valid with user IP ${(req.headers['x-forwarded-for'] || '').split(',').shift() || (req.socket || '').remoteAddress}.`);
                res.status(401).send('Unauthorised');
            }
        });
    } catch (e) {
        console.log(e);
        res.status(401).send("Unauthorized");
    }
});

api.get('/', (req, res) => {
    res.status(200).send('API online.');
})

api.listen(port, () => {
    console.log(`Running on port ${port}`);
});

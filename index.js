require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require("nodemailer");
const moment = require('moment');
const { google } = require('googleapis');
const { OAuth2 } = google.auth;

const api = express();
const port = process.env.PORT;
const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground';

api.use(express.urlencoded());

const allowList = ['http://localhost', 'https://baobab.finance', 'https://immersion360.studio', 'https://bge-quebec.com'];

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

const sendMail = async (to, subject, content) => {
    try {
        oauth2Client.setCredentials({ refresh_token: process.env.G_REFRESH_TOKEN });
        const accessToken = oauth2Client.getAccessToken();

        const smtpTransport = nodemailer.createTransport({
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

        const mailOptions = {
            from: process.env.EMAIL,
            to: to,
            subject: subject,
            html: content,
        };

        let mailSent = await smtpTransport.sendMail(mailOptions);

        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
};

const formatBaobab = (body) => {
    let content = `From: ${body.email} <br /><br />
    Message: <br />
    ${body.message}`;

    return [body.subject, content];
}

const formatI360 = (body) => {
    let content = `
    Nom: ${body.name} <br />
    Courriel: ${body.email} <br />
    Téléphone: ${body.phone} <br />
    Industrie: ${body.industry} <br />
    Message: <br />
    ${body.message}`;

    return ["Nouvelle demande de contact", content];
}

const authorizedHosts = [
    { host: 'http://localhost', token: '7gCWXKJc6fHPS98s4gN7db4BdyWQQs', format: formatI360, recipient: 'olivier@immersion360.studio' },
    { host: 'http://localhost:8181', token: 'Tn2wyFCAkrlaAelEnv10', format: formatBaobab, recipient: 'olivier@oasis.engineering' },
    { host: 'https://baobab.finance', token: 'Ut3GFuVEHmhyL6YOhnfs', format: formatBaobab, recipient: 'olivier@oasis.engineering' },
    { host: 'https://immersion360.studio', token: 'W3th04OFVQllnQZX8YFv', format: formatI360, recipient: 'olivier@immersion360.studio' },
    { host: 'https://immersion-360-dev-gvqbz.ondigitalocean.app', token: 'oiq98BfHdf9fbk', format: formatI360, recipient: 'olivier@immersion360.studio' },
];

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

        let [subject, content] = authorizedHost.format(req.body);
        let result = await sendMail(authorizedHost.recipient, subject, content);

        if(!result) {
            throw new Error(`[${moment.utc().format('YYYY-MM-DD HH:mm:ss')}] Unexpected error while sending the email, see logs.`);
        }

        res.status(200).send('OK');
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

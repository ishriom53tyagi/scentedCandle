var express = require('express');
var router = express.Router();
const config = require('../config');
var jwt = require('jsonwebtoken');
const fs = require('fs');
var path = require('path');
var publicKEY = fs.readFileSync(path.join(__dirname, config.authUrl + 'public.key'), 'utf8');


router.use(function (req, res, next) {

    console.log('req.headers.authorization', req.headers);
    var token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : req.headers.authorization;
    if (token) {
        let verifyOptions = {
            issuer: config.organization_name,
            subject: req.session.user_id.toString(),
            audience: req.headers.host,
            expiresIn: config.encryption.jwt.jwt_expires_in,
            algorithms: ["RS256"]
        };
        console.log('reqqqqq', verifyOptions);
        jwt.verify(token, publicKEY, verifyOptions, async (err, decoded) => {
            if (err) {
                return res.status(401).send({ status: false, message: 'Failed to authenticate token.' });
            } else {
                if (req.query.type == 'checksession') {
                    return res.status(200).send({ status: true, message: 'session exist.' });
                }
                req.decoded = decoded;
                next();
            }
        });

    } else {
        return res.status(403).send({
            status: false,
            message: 'No token provided.'
        });

    }
});

module.exports = router;


var uuid = require('uuid');
var crypto = require('crypto');
var config = require('../config');
var bcrypt = require('bcrypt');
const momentTimeZone = require('moment-timezone')
var moment = require('moment');


exports.randomStr = function (len, arr) {
    var ans = '';
    for (var i = len; i > 0; i--) {
        ans +=
            arr[Math.floor(Math.random() * arr.length)];
    }
    return ans;
}

exports.momentTimeZone = function (req, timeData, format, isMilliseconds = true) {
    try {

        var defaultFormat = 'DD MMM,YYYY, hh:mm:ss A';

        if (!timeData)
            return 'NaN';

        var timzone = req.configurations.frontend.timezone;

        if (format == undefined)
            format = defaultFormat;
        else if (format == 'no_format')
            format = '';

        if (isMilliseconds)
            timeData = timeData * 1000;

        var formatDate = momentTimeZone(new Date(timeData)).tz(timzone).format(format);

        return formatDate;
    } catch (error) {
        console.log('error------->', error);
        return 'NAN';
    }

}

exports.ipAddress = function (req) {
    var ipAddress = (req) ? req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : '') : "";
    var ignoreProxies = [];
    if (ipAddress && ipAddress.startsWith("::ffff:")) {
        ipAddress = ipAddress.replace("::ffff:", "")
    }

    / Since x-forwarded-for: client, proxy1, proxy2, proxy3 /
    var ips = ipAddress.split(',');

    //if ignoreProxies not setup, use outmost left ip address
    if (!ignoreProxies || !ignoreProxies.length) {
        // console.log("From %s found ip %s", ipAddress, ips[0]);
        return ips[0];
    }
    //search for the outmost right ip address ignoring provided proxies
    var ip = "";
    for (var i = ips.length - 1; i >= 0; i--) {
        if (ips[i].trim() != "127.0.0.1" && (!ignoreProxies || ignoreProxies.indexOf(ips[i].trim()) === -1)) {
            ip = ips[i].trim();
            break;
        }
    }
    // console.log("From %s found ip %s", ipAddress, ip);
    return ip;
}
exports.uuidv1 = function () {
    return uuid.v1();
}
exports.uuidv4 = function () {
    return uuid.v4();
}


/**
* Encrypt provided value
* @param {string} text - value to encrypt
* @param {string=} key - key used for encryption and decryption
* @param {string=} iv - initialization vector to make encryption more secure
* @param {string=} algorithm - name of the algorithm to use for encryption. The algorithm is dependent on OpenSSL, examples are 'aes192', etc. On recent OpenSSL releases, openssl list-cipher-algorithms will display the available cipher algorithms. Default value is aes-256-cbc
* @param {string=} input_encoding - how encryption input is encoded. Used as output for decrypting. Default utf-8.
* @param {string=} output_encoding - how encryption output is encoded. Used as input for decrypting. Default hex.
* @returns {string} encrypted value
*/
exports.encrypt = function (text, key, iv, algorithm, input_encoding, output_encoding) {
    var cipher, crypted;
    if (typeof key === "undefined") {
        key = config.encryption.key || "dpYheF85";
    }
    if (typeof iv === "undefined") {
        iv = config.encryption.iv;
    }
    if (typeof algorithm === "undefined") {
        //The algorithm is dependent on OpenSSL, examples are 'aes192', etc. 
        //On recent OpenSSL releases, openssl list-cipher-algorithms will display the available cipher algorithms.
        algorithm = config.encryption.algorithm || "aes-256-cbc";
    }
    if (typeof input_encoding === "undefined") {
        input_encoding = config.encryption.input_encoding || "utf-8";
    }
    if (typeof output_encoding === "undefined") {
        output_encoding = config.encryption.output_encoding || "hex";
    }
    if (iv)
        cipher = crypto.createCipheriv(algorithm, key, iv);
    else
        cipher = crypto.createCipher(algorithm, key);
    crypted = cipher.update(text, input_encoding, output_encoding);
    crypted += cipher.final(output_encoding);
    return crypted + "MS";
};

/**
* Decrypt provided value
* @param {string} crypted - value to decrypt
* @param {string=} key - key used for encryption and decryption
* @param {string=} iv - initialization vector used in encryption
* @param {string=} algorithm - name of the algorithm used in encryption. The algorithm is dependent on OpenSSL, examples are 'aes192', etc. On recent OpenSSL releases, openssl list-cipher-algorithms will display the available cipher algorithms. Default value is aes-256-cbc
* @param {string=} input_encoding - how decryption input is encoded. Default hex.
* @param {string=} output_encoding - how decryption output is encoded. Default utf-8.
* @returns {string} decrypted value
*/
exports.decrypt = function (crypted, key, iv, algorithm, input_encoding, output_encoding) {
    console.log('crypted: ', crypted);
    if (crypted.lastIndexOf("MS") === -1 || crypted.lastIndexOf("MS") !== crypted.length - 2) {
        console.log('crypted.lastIndexOf("MS") === -1 || crypted.lastIndexOf("MS") !== crypted.length - 2: ', crypted.lastIndexOf("MS") === -1 || crypted.lastIndexOf("MS") !== crypted.length - 2);
        return crypted;
    }
    else {

        crypted = crypted.substring(0, crypted.length - 2);
    }
    var decipher, decrypted;
    if (typeof key === "undefined") {
        key = config.encryption.key || "dpYheF85";
    }
    if (typeof iv === "undefined") {
        iv = config.encryption.iv;
    }
    if (typeof algorithm === "undefined") {
        //The algorithm is dependent on OpenSSL, examples are 'aes192', etc. 
        //On recent OpenSSL releases, openssl list-cipher-algorithms will display the available cipher algorithms.
        algorithm = config.encryption.algorithm || "aes-256-cbc";
    }
    if (typeof input_encoding === "undefined") {
        input_encoding = config.encryption.output_encoding || "hex";
    }
    if (typeof output_encoding === "undefined") {
        output_encoding = config.encryption.input_encoding || "utf-8";
    }
    if (iv)
        decipher = crypto.createDecipheriv(algorithm, key, iv);
    else
        decipher = crypto.createDecipher(algorithm, key);
    decrypted = decipher.update(crypted, input_encoding, output_encoding);
    decrypted += decipher.final(output_encoding);
    return decrypted;
};

/**
 * @param {string} str
 * @param {string} addSalt
 * 
 */
exports.sha512Hash = function (str, addSalt) {
    var salt = (addSalt) ? new Date().getTime() : "";
    return crypto.createHmac('sha512', salt + "").update(str + "").digest('hex');
};

/**
 * @param {string} str
 * @param {string} addSalt
 * 
 */
exports.sha1Hash = function (str, addSalt) {
    var salt = (addSalt) ? new Date().getTime() : "";
    return crypto.createHmac('sha1', salt + "").update(str + "").digest('hex');
};

exports.generatePassword = function (length, no_special) {
    var text = [];
    var chars = "abcdefghijklmnopqrstuvwxyz";
    var upchars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var numbers = "0123456789";
    var specials = '!@#$%^&*()_+{}:"<>?\|[];\',./`~';
    var all = chars + upchars + numbers;
    if (!no_special)
        all += specials;

    //1 char
    text.push(upchars.charAt(Math.floor(Math.random() * upchars.length)));
    //1 number
    text.push(numbers.charAt(Math.floor(Math.random() * numbers.length)));
    //1 special char
    if (!no_special) {
        text.push(specials.charAt(Math.floor(Math.random() * specials.length)));
        length--;
    }

    //5 any chars
    for (var i = 0; i < Math.max(length - 2, 5); i++)
        text.push(all.charAt(Math.floor(Math.random() * all.length)));

    //randomize order
    var j, x, k;
    for (k = text.length; k; k--) {
        j = Math.floor(Math.random() * k);
        x = text[k - 1];
        text[k - 1] = text[j];
        text[j] = x;
    }
    return text.join("");
}

exports.cryptPassword = async function (password, cb) {
    var saltRounds = 10;
    bcrypt.hash(password, saltRounds, function (err, hash) {

        if (err) {
            console.log("err", err);
        }
        else {
            cb(hash);
            console.log("hash", hash);
        }
    })

}

exports.maskString = function (obj, value) {
    let str = 'X';
    value = value.toString()
    let repeatLength = obj.mask_length > value.length ? value.length : obj.mask_length

    if (obj.mask_type == 'post') {

        var maskedData = value.substring(0, value.length - obj.mask_length) + str.repeat(repeatLength);
    }
    if (obj.mask_type == 'pre') {

        var maskedData = str.repeat(repeatLength) + value.substring(obj.mask_length, value.length);
    }


    return maskedData

}

exports.formatDateTime = function (type, obj) {
    // var dateObj = { start: obj.start, end: obj.end }
    // console.log(moment().format('DD-MM-YY'));
    switch (type) {
        case "datetime":
            let timeZone = /\((.*)\)/.exec(new Date().toString())[1]
            if (timeZone == "Coordinated Universal Time") {
                return moment().utcOffset("+05:30").format('MMMM Do YYYY, h:mm a');
            }
            return moment().format('MMMM Do YYYY, h:mm a');
        case "date-now":
            console.log("moment().format('DD-MM-YYYY') date-now  ", moment().endOf('day').format('DD-MM-YYYY'))
            return moment().endOf('day').format('DD-MM-YYYY-HH-mm-ss');
        case "start-of-day":
            console.log("moment().time().second(0).format('DD-MM-YYYY') ==>  ", moment().startOf('day').format('DD-MM-YYYY'));
            return moment().startOf('day').format('DD-MM-YYYY-HH-mm-ss');
        default:
    }
}

exports.collectionNameGenerator = function (header, value) {
    let name = '';
    if (header.hasOwnProperty('t_id') && header.t_id && config.tenant == 'multi' && value) {
        name = value + "_" + header.t_id
    }
    else {
        name = value
    }

    return name

}

exports.generateTimeSeriesBoundaries = function (range) {

    var diff = exports.diffInMilliseconds(range.start, range.end);
    var interval = exports.getTimeSeriesInterval(diff);

    var boundaries = [];

    boundaries.push(new Date(range.start))

    while (boundaries[boundaries.length - 1] < new Date(range.end)) {
        let date = boundaries[boundaries.length - 1]
        let newDate = new Date(date.getTime() + interval)
        boundaries.push(newDate)
    }
    return boundaries;
}


exports.diffInMilliseconds = function (date1, date2) {

    // Convert both dates to milliseconds
    var date1_ms = new Date(date1).getTime();
    var date2_ms = new Date(date2).getTime();

    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;

    return difference_ms;
}

exports.getTimeSeriesInterval = function (milliseconds) {
    var interval = 1000 * 30;

    switch (true) {

        case milliseconds <= 1800000:
            interval = (1000 * 30); // 30 min interval 30 sec
            break;
        case milliseconds <= 3600000:
            interval = (1000 * 60); // 1 hr interval 60 sec
            break;
        case milliseconds <= 43200000:
            interval = (1000 * 60 * 10); // 12 hr interval 10 mins
            break;
        case milliseconds <= 86400000:
            interval = (1000 * 60 * 30); // 1day/24hr interval 30 mins
            break;
        case milliseconds <= 604800000:
            interval = (1000 * 60 * 60 * 3); // 7 days interval 3 hrs
            break;
        case milliseconds <= 2592000000:
            interval = (1000 * 60 * 60 * 12); // 30 days interval 12 hrs
            break;

        default:
            break;
    }

    return interval;
}

exports.getAppDataCollectionName = function (application, dateTimeUTC) {

    return config.appdata_initials + '_appdata_' + application + '_' + exports.getMonthAndYear(dateTimeUTC);
}

exports.getMonthAndYear = function (dateTimeUTC) {

    return moment(dateTimeUTC).utc().format("MMYYYY");
}


module.exports = async function (req, res) {
    // console.log('crf-----', req.csrfToken());
    res.cookie('XSRF-TOKEN', req.csrfToken());
    res.status(200);
    res.end();
}
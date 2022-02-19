
module.exports.responseData = function (response, status, statuscode, message, data,color) {
    var obj = {}
    obj.status = status || false
    obj.statuscode = statuscode || 500
    obj.message = message || 'internal server error'
    obj.data = data 
    obj.color = status ? 'bg-green' : 'bg-red'
    response.status(statuscode).send(obj);
}
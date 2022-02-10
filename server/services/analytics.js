const { responseData } = require('../utils/responseHandler');
const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectId;
var moment = require('moment');
const momentTimeZone = require('moment-timezone')
const cfg = require('../config.json')
const common = require('../utils/common')

let applicationDetailsForGraph;
let applicationDetailsForLineGraph;
let finalSeriesAreaGraph = [];
let finalSeriesBoundaries = [];
let tableData = [];
let apiWiseBarGraphData;

module.exports.getAppCount = async function (req, res) {
    try {
        let collectionName = req.body.collection || 'logJun2020'
        let keyword = "$" + (req.body.keyword || "apicode.appid")
        const db = getDb();
        db.collection(collectionName)
            .aggregate(
                [
                    { $unwind: keyword },
                    {
                        $group: {
                            _id: keyword,
                            count: { $sum: 1 }
                        }
                    },
                    { $limit: 100 },
                    { $sort: { count: 1 } }
                ]
            )
            .toArray()
            .then(appcount => {
                if (appcount.length > 0) {
                    return responseData(res, true, 200, "success", appcount);
                } else {
                    return responseData(res, false, 204, "failure");
                }
            })
    } catch (error) {
        return responseData(res, false, 500);
    }
}


function averageReport(collectionNames, body) {
    return new Promise(async (resolve, reject) => {
        const promises1 = []
        let today = moment().format('YYYYMMDD')
        let thisWeek;
        let start = moment().subtract(6, 'days').format('YYYYMMDD')
        let end = moment().format('YYYYMMDD')
        if (!moment(start).isSame(end)) {
            thisWeek = moment().subtract(6, 'days').format('YYYYMMDD') + '-' + moment().format('YYYYMMDD')
        } else {
            thisWeek = moment().startOf('month').format('YYYYMMDD') + '-' + moment().format('YYYYMMDD')
        }
        let thisMonth = moment().startOf('month').format('YYYYMMDD') + '-' + moment().format('YYYYMMDD')
        let todayArray = []
        let weekArray = []
        let monthArray = []
        let todayCount = 0
        let weekCount = 0
        let monthCount = 0
        console.log("today thisWeek thisMonth :::: ", today, thisWeek, thisMonth);
        let todayDates = await dateConverter({ type: 'Day', range: today })
        let weekDates = await dateConverter({ type: 'Days', range: thisWeek })
        let monthDates = await dateConverter({ type: 'Days', range: thisMonth })

        collectionNames.map((cname) => {
            promises1.push(successRateAdder({ type: 'Day', client_id: body.client_id != '' ? body.client_id : '', range: today }, cname, todayDates[0], todayArray))
        })
        collectionNames.map((cname) => {
            promises1.push(successRateAdderForRange({ type: 'Days', client_id: body.client_id != '' ? body.client_id : '', range: thisWeek }, cname, weekDates[0], weekDates[1], weekArray))
        })
        collectionNames.map((cname) => {
            promises1.push(successRateAdderForRange({ type: 'Days', client_id: body.client_id != '' ? body.client_id : '', range: thisMonth }, cname, monthDates[0], monthDates[1], monthArray))
        })
        Promise.all(promises1).then(async response => {
            if (response) {
                todayArray.forEach(e => {
                    todayCount = todayCount + e.count[0]
                })
                weekArray.forEach(e => {
                    weekCount = weekCount + e.count[0]
                })
                monthArray.forEach(e => {
                    monthCount = monthCount + e.count[0]
                })
                resolve({ todayCount: todayCount, weekCount: weekCount, monthCount: monthCount })
            }
        })
    })
}

module.exports.getRadarGraphStatsforApp = async function (req, res) {
    try {
        let { body } = req
        const promises = []
        const applicationExists = []
        let boundaries = await boundariesGenarator(body)
        let tempCollectionNames = await getApplication(body, boundaries, req.headers)
        let dates = await dateConverter(body)
        let collectionNames = await collectionNamesGenerator(tempCollectionNames, dates)
        let istBoundaries = JSON.parse(JSON.stringify(boundaries))
        let boundariesForData = []
        istBoundaries.forEach(bound => {
            bound = new Date(bound)
            bound = new Date(bound.setHours(bound.getHours() - 5))
            bound = new Date(bound.setMinutes(bound.getMinutes() - 30))
            boundariesForData.push(bound)
        })
        for (let index = 0; index < boundariesForData.length - 1; index++) {
            promises.push(boundariesDateCollector(body, collectionNames[0], boundariesForData[index], boundariesForData[index + 1], applicationExists, boundariesForData))
        }
        Promise.all(promises).then(async response => {
            if (response) {
                let finalResponse = await areaGraphDataConverter(applicationExists, boundaries, 'radar')
                if (body.type.toLowerCase() == 'last 5 mins') {
                    finalResponse.boundaries.forEach(bound => {
                        bound.setHours(bound.getHours() - 5)
                        bound.setMinutes(bound.getMinutes() - 30)
                    })
                }
                if (body.type.toLowerCase() != 'day' && body.type.toLowerCase() != 'last 5 mins' && finalResponse.boundaries && finalResponse.boundaries.length > 0) {
                    finalResponse.boundaries.pop()
                }
                return responseData(res, true, 200, "success", finalResponse)
            }
            return responseData(res, false, 500, "failure")
        })
    } catch (error) {
        return responseData(res, false, 500);
    }
}

function getISTBoundaries(istBoundaries) {
    let boundariesForData = [];
    istBoundaries.forEach(item => {
        item = new Date(item)
        item = new Date(item.setHours(item.getHours() - 5))
        item = new Date(item.setMinutes(item.getMinutes() - 30))
        boundariesForData.push(item)
    })
    return boundariesForData;
}

module.exports.getLineGraphDataForApiName = async (req, res) => {
    try {
        let { body } = req
        const promises = []
        let boundaries = await boundariesGenarator(JSON.parse(body.range))
        let tempCollectionNames = await getApplicationForLine({ app: body.app, type: JSON.parse(body.range).send }, boundaries, req.headers)
        let dates = await dateConverterForLinePie(JSON.parse(body.range))
        let collectionNames = await collectionNamesGenerator(tempCollectionNames, dates)
        let istBoundaries = JSON.parse(JSON.stringify(boundaries))
        let boundariesForData = getISTBoundaries(istBoundaries)

        for (let index = 1; index < boundariesForData.length - 1; index++) {
            promises.push(boundariesDateCollector(body, collectionNames[0], boundariesForData[index], boundariesForData[index + 1], boundariesForData))
        }
        Promise.all(promises).then(async response => {
            if (response) {
                let finalResponse = await areaGraphDataConverterForLine(boundaries)
                return responseData(res, true, 200, "success", finalResponse)
            }
            return responseData(res, false, 200, "failure")
        })
    } catch (error) {
        return responseData(res, false, 500);
    }
}


module.exports.getPieGraphDataForApiName = async (req, res) => {
    try {
        let { body } = req
        // console.log("body api ....... ", body);
        let boundaries = await boundariesGenarator(JSON.parse(body.range))
        let tempCollectionNames = await getApplicationForLine({ app: body.app, type: JSON.parse(body.range).send }, boundaries, req.headers)
        let dates = await dateConverterForLinePie(JSON.parse(body.range))
        let collectionNames = await collectionNamesGenerator(tempCollectionNames, dates)
        let boundry1 = boundaries[0]
        let boundry2 = boundaries[boundaries.length - 1]
        boundry1 = new Date(boundry1.setHours(boundry1.getHours() - 5))
        boundry1 = new Date(boundry1.setMinutes(boundry1.getMinutes() - 30))
        boundry2 = new Date(boundry2.setHours(boundry2.getHours() - 5))
        boundry2 = new Date(boundry2.setMinutes(boundry2.getMinutes() - 30))

        let db = getDb()
        let matchBody = {}
        let clientId = body.client_id ? body.client_id : ""
        if (clientId == '') {
            matchBody = {
                api: body.api,
                $and: [
                    { created_on: { $gt: boundry1 }, },
                    { created_on: { $lt: boundry2 }, }
                ],
                method: body.method
            }
        } else {
            matchBody = {
                api: body.api,
                $and: [
                    { created_on: { $gt: boundry1 }, },
                    { created_on: { $lt: boundry2 }, },
                    { client_id: body.client_id }
                ],
                method: body.method
            }
        }
        // console.log("match Body ---->>> ",matchBody);
        db.collection(collectionNames[0])
            .aggregate([{
                $match: matchBody
            },
            {
                $group: {
                    _id: "$status_code",
                    count: { $sum: 1 }
                }
            },
            ])
            .toArray()
            .then(async result => {
                // console.log("result >>>>>>>>> ", result);
                let finalResponse = {
                    labels: [],
                    series: []
                }
                if (result && result.length > 0) {
                    result.forEach(resp => {
                        finalResponse.labels.push(resp._id)
                        finalResponse.series.push(resp.count)
                    })
                }
                return responseData(res, true, 200, "success", finalResponse)
            })
    } catch (error) {
        return responseData(res, false, 500);
    }
}

module.exports.getRangeBarGraphData = async function (req, res) {
    try {
        let { body } = req
        const promises = []
        let rangeBarData = [];
        let apiHitsCount = [];
        let apiUrl = [];
        let tempCollectionNames = await getApplicationForTable(body.app, req.headers)
        let dates = await dateConverter(body)
        let collectionNames = await collectionNamesGenerator(tempCollectionNames, dates)
        console.log("dates :::::::: ", dates);
        if (dates.length > 1) {
            collectionNames.map((cname) => {
                promises.push(successRateAdderForRange(body, cname, dates[0], dates[1], rangeBarData))
            })
        } else {
            collectionNames.map((cname) => {
                promises.push(successRateAdder(body, cname, dates[0], rangeBarData))
            })
        }
        Promise.all(promises).then(async response => {
            if (response.length > 0) {
                console.log("tabbblleee dataat ", rangeBarData);
                rangeBarData.sort(function (a, b) { return b.count[0] - a.count[0] })
                rangeBarData.forEach(item => {
                    apiUrl.push(item._id['api_path'] + ' (' + item._id['method'] + ')')
                    apiHitsCount.push(item.count[0])
                })
                if (apiHitsCount.length > 10) {
                    apiHitsCount = apiHitsCount.slice(0, 10);
                    apiUrl = apiUrl.slice(0, 10)
                }
                return responseData(res, true, 200, "success", { seriesCount: apiHitsCount, seriesXaxis: apiUrl })
            }
        })
    } catch (error) {
        return responseData(res, false, 500, error)
    }
}

module.exports.getErrorCodesGraphData = async function (req, res) {
    try {
        let { body } = req
        const promises = []
        const applicationExists = []
        let boundaries = await boundariesGenarator(body)
        let tempCollectionNames = await getApplication(body, boundaries, req.headers)
        let dates = await dateConverter(body)
        let collectionNames = await collectionNamesGenerator(tempCollectionNames, dates)
        let istBoundaries = JSON.parse(JSON.stringify(boundaries))
        let boundariesForData = getISTBoundaries(istBoundaries)
        for (let index = 0; index < boundariesForData.length - 1; index++) {
            promises.push(boundariesDateCollector(body, collectionNames[0], boundariesForData[index], boundariesForData[index + 1], applicationExists, boundariesForData))
        }
        Promise.all(promises).then(async response => {
            if (response) {
                let finalResponse = await areaGraphDataConverter(applicationExists, boundaries, 'error-codes')
                return responseData(res, true, 200, "success", finalResponse)
            }
            return responseData(res, false, 200, "failure")
        })
    } catch (error) {
        return responseData(res, false, 500);
    }
}


module.exports.getAreaGraphData = async function (req, res) {
    try {
        let { body } = req
        const promises = []
        const applicationExists = []
        let boundaries = await boundariesGenarator(body)

        let tempCollectionNames = await getApplication(body, boundaries, req.headers)
        console.log("tempCollectionNames : ", tempCollectionNames);
        let dates = await dateConverter(body)
        let collectionNames = await collectionNamesGenerator(tempCollectionNames, dates)
        let istBoundaries = JSON.parse(JSON.stringify(boundaries))
        let boundariesForData = getISTBoundaries(istBoundaries)
        // console.log("boundariesForData ............ ",boundariesForData.length);
        for (let index = 0; index < boundariesForData.length - 1; index++) {
            console.log("trueeee ", boundariesForData[index], boundariesForData[index + 1]);
            promises.push(boundariesDateCollector(body, collectionNames[0], boundariesForData[index], boundariesForData[index + 1], applicationExists, boundariesForData))
        }
        Promise.all(promises).then(async response => {
            if (response) {
                let finalResponse = await areaGraphDataConverter(applicationExists, boundaries, 'area-graph')
                console.log("finalResponse ;;;;;;;;;; ", JSON.stringify(finalResponse, null, 4));

                return responseData(res, true, 200, "success", finalResponse)
            }
            return responseData(res, false, 200, "failure")
        })
    } catch (error) {
        console.log('error', error)
        return responseData(res, false, 500);
    }
}


function datesMonthsYearGiver(body) {
    return new Promise((resolve, reject) => {
        let dates = []
        let hour = []
        let minute = []
        let date = []
        let month
        let year
        if (body.range.includes("-")) {
            dates = body.range.split('-')
        } else {
            dates.push(body.range)
        }
        if (body.type.toLowerCase() == 'day') {
            month = Number(dates[0].substr(4, 2))
            year = Number(dates[0].substr(0, 4))
            date = Number(dates[0].substr(6, 2))
            hour = [0, 23]
            minute = [0, 60]
        } else if (body.type.toLowerCase() == 'days') {
            dates.forEach((d) => {
                date.push(Number(d.substr(6, 2)))
            })
            let firstDate = date[0]
            let lastDate = date[1]
            for (let i = 0; i < lastDate; i++) {
                if (i > firstDate && i < lastDate && !dates.includes(i)) {
                    date.push(i)
                }
            }
            date.sort()
            month = Number(dates[0].substr(4, 2))
            year = Number(dates[0].substr(0, 4))
            hour = [0, 23]
            minute = [0, 60]
        } else if (body.type.toLowerCase() == 'last 5 mins' || body.type.toLowerCase() == 'last 1 hour') {
            month = new Date(dates[0]).getMonth() + 1
            year = new Date(dates[0]).getFullYear()
            dates.forEach((d) => {
                hour.push(new Date(d).getHours())
                minute.push(new Date(d).getMinutes())
                date.push(new Date(d).getDate())
            })
        }
        let dateobj = {
            dates: dates,
            date: date,
            month: month,
            year: year,
            hour: hour,
            minute: minute,
            type: body.type
        }
        resolve(dateobj)
    })
}


module.exports.getTableData = async function (req, res) {
    try {
        let { body } = req
        console.log("body   ... ", body);
        const promises = []
        let tableDataForApi = []
        let tempCollectionNames = await getApplicationForTable(body.app, req.headers)
        let dates = await dateConverter(body)
        let collectionNames = await collectionNamesGenerator(tempCollectionNames, dates)
        if (dates.length > 1) {
            collectionNames.map((cname) => { promises.push(successRateAdderForRange(body, cname, dates[0], dates[1], tableDataForApi)) })
        } else {
            collectionNames.map((cname) => { promises.push(successRateAdder(body, cname, dates[0], tableDataForApi)) })
        }
        Promise.all(promises).then(async response => {
            if (response) {
                console.log("tab ::::::::: ", tableDataForApi);
                tableDataForApi.forEach(element1 => {
                    if (element1.success_count.length > 0) {
                        element1.success_count = element1.success_count.reduce((acc, avg) => acc + avg, 0)
                        element1.success_rate = element1.success_count != 0 ? Math.floor(((element1.success_count / element1.count) * 100).toFixed(2)) : 0

                    }
                })
                tableData = tableDataForApi
                tableDataForApi.sort(function (a, b) { return b.count - a.count })
                return responseData(res, true, 200, "success", { tableDataForApi })
            }
        })
    } catch (error) {
        return responseData(res, false, 500);
    }
}


// module.exports.getApiCounts = async function (req, res) {
//     try {
//         let totalTraffic = 0
//         let successTotal = 0
//         let successPercent = 0
//         console.log("tableData >> ", tableData);
//         tableData.forEach(item => {
//             successTotal = successTotal + item.success_count
//             totalTraffic = totalTraffic + item.count[0]
//         })

//         successPercent = successTotal != 0 ? ((successTotal / totalTraffic) * 100).toFixed(2) : 0
//         successPercent = Math.floor(successPercent)
//         console.log("totalTraffic :::: ", totalTraffic, successTotal, successPercent);
//         return responseData(res, true, 200, "success", { totalTraffic: totalTraffic, successPercent: successPercent })

//     } catch (error) { return responseData(res, false, 500, error) }
// }

function successRateAdderForRange(body, cname, date1, date2, tableDataForApi) {
    console.log("body, cname, date1, date2, tableDataForApi :: ", body, cname, date1, date2, tableDataForApi);
    return new Promise((resolve, reject) => {
        let newDate1;
        let newDate2;
        if (body.type.toLowerCase() == 'last 5 mins' || body.type.toLowerCase() == 'last 1 hour') {
            newDate1 = `${date1.substr(0, 4)}-${date1.substr(4, 2)}-${date1.substr(6, 2)}`
            newDate2 = `${date2.substr(0, 4)}-${date2.substr(4, 2)}-${date2.substr(6, 2)}`
            newDate1 = new Date(newDate1)
            newDate1 = new Date(newDate1.setHours(date1.substr(8, 2)))
            newDate1 = new Date(newDate1.setMinutes(date1.substr(10, 2)))
            newDate2 = new Date(newDate2)
            newDate2 = new Date(newDate2.setHours(date2.substr(8, 2)))
            newDate2 = new Date(newDate2.setMinutes(date2.substr(10, 2)))
        } else {
            newDate1 = `${date1.substr(0, 4)}-${date1.substr(4, 2)}-${date1.substr(6, 2)}`
            newDate2 = `${date2.substr(0, 4)}-${date2.substr(4, 2)}-${date2.substr(6, 2)}`
            newDate1 = new Date(newDate1)
            newDate2 = new Date(newDate2)
            // newDate2 = new Date(newDate2.setHours(newDate2.getHours() + 23))
            // newDate2 = new Date(newDate2.setMinutes(newDate2.getMinutes() + 59))
            // newDate2 = new Date(newDate2.setSeconds(newDate2.getSeconds() + 59))
        }
        newDate2 = new Date(newDate2.setDate(newDate2.getDate() + 1))
        let matchBody = {}
        let clientId = body.client_id ? body.client_id : ""
        if (clientId == '') {
            matchBody = {
                $and: [
                    { created_on: { $gt: newDate1 }, },
                    { created_on: { $lt: newDate2 }, }
                ]
            }
        } else {
            matchBody = {
                $and: [
                    { created_on: { $gt: newDate1 }, },
                    { created_on: { $lt: newDate2 }, },
                    {
                        client_id: body.client_id
                    }
                ]
            }
        }
        console.log("match Body CONT : ", newDate1, newDate2);
        let db = getDb()
        db.collection(cname)
            .aggregate([{
                $match: matchBody
            },
            {
                $project: {
                    api: 1,
                    method: 1,
                    response_time: 1,
                    success_hits: {
                        $cond: [{ $eq: ["$status_code", 200] }, 1, 0]
                    }
                }
            },
            {
                $group: {
                    _id: { api_path: "$api", method: "$method" },
                    minResponse: { $min: "$response_time" },
                    maxResponse: { $max: "$response_time" },
                    avgResponse: { $avg: "$response_time" },
                    count: { $sum: 1 },
                    success_count: { $sum: "$success_hits" }
                }
            },
            {
                $sort: { count: -1 }
            }
            ])
            .toArray()
            .then(async result => {
                if (result.length > 0) {
                    // console.log("match Body AFTER : ", Date.now());
                    console.log("result ,........ ", result);

                    resolve(await finalDateGenerator(result, tableDataForApi))
                } else {
                    resolve(true)
                }
            })
    })
}


function successRateAdder(body, cname, date1, tableDataForApi) {
    console.log("body, cname, date1 ", body, cname, date1);
    return new Promise((resolve, reject) => {
        let newDate = `${date1.substr(0, 4)}-${date1.substr(4, 2)}-${date1.substr(6, 2)}`
        let date = new Date(newDate)
        let newDate1 = new Date(date.setSeconds(date.getSeconds() - 1))
        let date2 = new Date(newDate)
        let newDate2 = new Date(date2.setDate(date2.getDate() + 1))
        let matchBody = {}
        let clientId = body.client_id ? body.client_id : ""
        if (clientId == '') {
            matchBody = {
                $and: [
                    { created_on: { $gt: newDate1 }, },
                    { created_on: { $lt: newDate2 }, }
                ]
            }
        } else {
            matchBody = {
                $and: [
                    { created_on: { $gt: newDate1 }, },
                    { created_on: { $lt: newDate2 }, },
                    {
                        client_id: body.client_id
                    }
                ]
            }
        }
        // console.log("match Body : ", matchBody);
        let db = getDb()
        db.collection(cname)
            .aggregate([{
                $match: matchBody
            },
            {
                $project: {
                    api: 1,
                    method: 1,
                    response_time: 1,
                    success_hits: {
                        $cond: [{ $eq: ["$status_code", 200] }, 1, 0]
                    }
                }
            },
            {
                $group: {
                    _id: { api_path: "$api", method: "$method" },
                    minResponse: { $min: "$response_time" },
                    maxResponse: { $max: "$response_time" },
                    avgResponse: { $avg: "$response_time" },
                    count: { $sum: 1 },
                    success_count: { $sum: "$success_hits" }
                }
            },
            ])
            .toArray()
            .then(async result => {
                if (result.length > 0) {
                    // console.log("result ,......in success rate adder.. ", result);
                    resolve(await finalDateGenerator(result, tableDataForApi))
                } else {
                    resolve(true)
                }
            })
    })
}

function areaGraphDataConverterForLine(boundaries) {
    return new Promise((resolve, reject) => {
        let finalSeries = []
        let series = Object.keys(applicationDetailsForLineGraph[0])
        series.splice(0, 3)
        series.forEach(bound => {
            if (applicationDetailsForLineGraph[0][bound].averageResponse.length > 0) {
                let avg = applicationDetailsForLineGraph[0][bound].averageResponse.reduce((acc, avg1) => acc + avg1, 0)
                finalSeries.push((avg / applicationDetailsForLineGraph[0][bound].averageResponse.length).toFixed(3))
            } else {
                finalSeries.push(0)
            }
        })
        resolve({ finalSeries, boundaries })
    })
}




function areaGraphDataConverter(applicationExists, boundaries, typeGraph) {
    return new Promise((resolve, reject) => {
        let series = []
        let finalSeries = []
        finalSeriesAreaGraph = [];
        finalSeriesBoundaries = [];
        let successArray = []
        let failArray = []
        let errorCodeArray = []
        // console.log("boundaries >>>>>> length", boundaries.length);
        for (let value of boundaries) {
            failArray.push(0)
            successArray.push(0)
        }
        console.log("applicationDetailsForGraph ... ", applicationDetailsForGraph);
        applicationDetailsForGraph.forEach(element => {
            let data = []
            if (!series.some(e1 => e1.name == element.name)) {
                let keys = Object.keys(element)
                keys.splice(0, 3)
                keys.forEach(key => { data.push(element[key]) })
                series.push({ name: element.name, data: data })
            }
        });

        applicationExists.forEach(app => {
            let data = []
            series[0].data.forEach((ser, i) => {
                let serApp = ser[app] ? ser[app] : 0
                data.push(serApp)
                if (ser[app] != undefined && app != 200 && app != 800) {
                    failArray[i] = (failArray[i] != 0) ? ser[app] + failArray[i] : ser[app]
                } else if (ser[app] && (app == 200 || app == 800)) {
                    successArray[i] = (successArray[i] != 0) ? ser[app] + successArray[i] : ser[app]
                }
            })
            data.push(0)
            finalSeries.push({
                name: app,
                data: data
            })
        })

        finalSeriesBoundaries = boundaries
        if (typeGraph == 'error-codes') {
            let errData = errorCodesDataCreator(finalSeries)
            errorCodeArray = errData
            resolve({ finalSeriesBoundaries, errorCodeArray })
        } else if (typeGraph == 'area-graph') {
            finalSeriesAreaGraph[0] = {
                name: "Success",
                data: successArray
            }
            finalSeriesAreaGraph[1] = {
                name: "Failure",
                data: failArray
            }
            resolve({ finalSeriesAreaGraph, finalSeriesBoundaries })
        }

        // console.log(" finalSeriesAreaGraph, finalSeriesBoundaries, errorCodeArray  ", finalSeriesAreaGraph, finalSeriesBoundaries, errorCodeArray );

    })
}

function errorCodesDataCreator(errorCodeArray) {
    let formattedArray = [];
    let tempArray = [];
    for (const i of errorCodeArray) {
        switch (i.name.split('')[0]) {
            case '3':
                tempArray.push({
                    name: "3xx",
                    data: i.data,
                    color: "#E30B5C"
                })
                break;

            case '4':
                tempArray.push({
                    name: "4xx",
                    data: i.data,
                    color: "#FA8072"
                })
                break;
            case '5':
                tempArray.push({
                    name: "5xx",
                    data: i.data,
                    color: "#FF0000"
                })
                break;
            case '6':
                tempArray.push({
                    name: "6xx",
                    data: i.data
                })
                break;

        }
    }
    let tempReducer = {}
    tempReducer = tempArray.reduce(function (r, a) {
        r[a.name] = r[a.name] || [];
        r[a.name].push(a);
        return r;
    }, Object.create(null));

    // console.log("temp Reducer ",tempReducer);
    Object.keys(tempReducer).forEach(item => {
        if (tempReducer[item] && tempReducer[item].length > 1) {
            let sampleArray = []
            tempReducer[item].forEach((ser, i) => {
                sampleArray.push(ser.data)

            })
            let arr = []
            for (let i = 0; i < sampleArray.length; i++) {
                if (sampleArray[i + 1]) {
                    arr = Arrays_sum(sampleArray[i], sampleArray[i + 1])
                }
            }
            formattedArray.push({
                name: item,
                data: arr,
                color: tempReducer[item][0].color

            })
        } else {
            formattedArray.push({
                name: item,
                data: tempReducer[item][0].data,
                color: tempReducer[item][0].color
            })
        }
    })
    return formattedArray;
}

function boundariesGenarator(body) {
    return new Promise((resolve, reject) => {
        let dateRange = []
        let boundaries = []
        let range = body.range || body.value
        let type = body.type || body.send
        // console.log("boundariesGenarator > ", body);
        switch (type.toLowerCase()) {
            case "last 5 mins":
                range = range.split("-")
                range.forEach(element => {
                    element = new Date(element)
                    dateRange.push(element)
                })
                boundaries.push(new Date(dateRange[0]))
                while (boundaries[boundaries.length - 1] < dateRange[1]) {
                    let date = boundaries[boundaries.length - 1]
                    let newDate = new Date(date.getTime() + 60000)
                    boundaries.push(newDate)
                }
                boundaries.forEach(bound => {
                    bound.setHours(bound.getHours() + 5)
                    bound.setMinutes(bound.getMinutes() + 30)
                })
                break;
            case "last 1 hour":
                range = range.split("-")
                range.forEach(element => {
                    element = new Date(element)
                    dateRange.push(element)
                })
                boundaries.push(new Date(dateRange[0]))
                while (boundaries[boundaries.length - 1] <= dateRange[1]) {
                    let date = boundaries[boundaries.length - 1]
                    let newDate = new Date(date.getTime() + (60000 * 5))
                    boundaries.push(newDate)
                }
                boundaries.forEach(bound => {
                    bound.setHours(bound.getHours() + 5)
                    bound.setMinutes(bound.getMinutes() + 30)
                })
                break;

            case "day":
                range = new Date(`${range.substr(0, 4)}-${range.substr(4, 2)}-${range.substr(6, 2)}`)
                boundaries.push(new Date(range))
                for (let i = 0; i <= 23; i++) {
                    let newDate = new Date(range.setHours(range.getHours() + 1))
                    if (newDate.getMonth() > boundaries[0].getMonth() || newDate.getDate() >= boundaries[0].getDate()) { boundaries.push(newDate) }
                }
                break;
            case "days":
            case "month":
                range = range.split("-")
                range.forEach(element => {
                    dateRange.push(new Date(`${element.substr(0, 4)}-${element.substr(4, 2)}-${element.substr(6, 2)}`))
                })
                boundaries.push(new Date(dateRange[0].setDate(dateRange[0].getDate() - 1)))
                while (boundaries[boundaries.length - 1] <= dateRange[1]) {
                    let date = boundaries[boundaries.length - 1]
                    let newDate = new Date(date.setDate(date.getDate() + 1))
                    boundaries.push(newDate)
                }
                // console.log("days >>>>>>>>>>>>> ",boundaries);
                let lastBoundary = boundaries[boundaries.length - 1]
                let lastDate = new Date(lastBoundary)
                boundaries.pop()
                lastDate.setHours(lastDate.getHours() + 23)
                lastDate.setMinutes(lastDate.getMinutes() + 59)
                lastDate.setSeconds(lastDate.getSeconds() + 59)
                // console.log("lastdate >>>>>>>>>>>>> ", lastDate);
                break;
        }

        resolve(boundaries);
    })
}


function collectionNamesGenerator(tempCollectionNames, dates) {
    return new Promise((resolve, reject) => {
        let collectionNames = []
        dates.forEach((element, i) => {
            let month = element.substr(4, 2)
            let year = element.substr(0, 4)
            tempCollectionNames.forEach(telement => {
                telement = telement.replace('<MONTH>', month)
                telement = telement.replace('<YEAR>', year)
                if (collectionNames.indexOf(telement) === -1) {
                    collectionNames.push(telement)
                }
            })
        })
        if (dates.length == 2 &&
            dates[0].substr(0, 4) == dates[1].substr(0, 4) &&
            dates[0].substr(4, 2) == '01' &&
            dates[1].substr(4, 2) == '12') {
            let year = dates[0].substr(0, 4)
            let shortMonths = ["02", "03", "04", "05", "06", "07", "08", "09", "10", "11"]
            shortMonths.forEach((mon) => {
                tempCollectionNames.forEach(telement => {
                    telement = telement.replace('<MONTH>', mon)
                    telement = telement.replace('<YEAR>', year)
                    if (collectionNames.indexOf(telement) === -1) {
                        collectionNames.push(telement)
                    }
                })
            })
        }
        console.log("collectionNames : ", collectionNames);
        resolve(collectionNames)
    })
}

function getApplication(body, boundaries, headers) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        // db.collection('applications')
        let collecName = common.collectionNameGenerator(headers, 'applications')
        db.collection(collecName)
            .find({ _id: ObjectId(body.app) })
            .project({ _id: 1, code: 1, name: 1 })
            .toArray()
            .then(applications => {
                if (applications.length > 0) {
                    let collectionNames = []
                    if (body.type.toLowerCase() == 'day') {
                        applications.forEach(element => {
                            boundaries.forEach(bound => {
                                bound.setHours(bound.getHours() - 5)
                                bound.setMinutes(bound.getMinutes() - 30)
                                element[bound] = {}
                                bound.setHours(bound.getHours() + 5)
                                bound.setMinutes(bound.getMinutes() + 30)
                            })
                        })
                    } else {
                        applications.forEach(element => {
                            boundaries.forEach(bound => {
                                element[bound] = {}
                            })
                        })
                    }
                    applicationDetailsForGraph = applications
                    applications.forEach(element => { collectionNames.push(`${appdata_initials}_appdata_${element._id}_<MONTH><YEAR>`) });
                    resolve(collectionNames);
                } else {
                    resolve(false);
                }
                resolve(true)
            })
    })
}

function getApplicationForLine(body, boundaries, headers) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        // db.collection('applications')
        let collecName = common.collectionNameGenerator(headers, 'applications')
        db.collection(collecName)
            .find({ _id: ObjectId(body.app) })
            .project({ _id: 1, code: 1, name: 1 })
            .toArray()
            .then(applications => {
                if (applications.length > 0) {
                    let collectionNames = []
                    if (body.type.toLowerCase() == 'day') {
                        applications.forEach(element => {
                            boundaries.forEach(bound => {
                                bound.setHours(bound.getHours() - 5)
                                bound.setMinutes(bound.getMinutes() - 30)
                                element[bound] = { averageResponse: [] }
                                bound.setHours(bound.getHours() + 5)
                                bound.setMinutes(bound.getMinutes() + 30)
                            })
                        })
                    } else {
                        applications.forEach(element => {
                            boundaries.forEach(bound => {
                                element[bound] = { averageResponse: [] }
                            })
                        })
                    }
                    applicationDetailsForLineGraph = applications
                    applications.forEach(element => { collectionNames.push(`${appdata_initials}_appdata_${element._id}_<MONTH><YEAR>`) });
                    resolve(collectionNames);
                } else {
                    resolve(false);
                }
                resolve(true)
            })
    })
}

function getApplicationForTable(app, headers) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        // db.collection('applications')
        let collecName = common.collectionNameGenerator(headers, 'applications')
        db.collection(collecName)
            .find({ _id: ObjectId(app) })
            .project({ _id: 1, code: 1, name: 1 })
            .toArray()
            .then(applications => {
                if (applications.length > 0) {
                    let collectionNames = []
                    applications.forEach(element => {
                        element.minResponse = []
                        element.maxResponse = []
                        element.avgResponse = []
                        element.totalCount = []
                        element.successCount = [];
                    })
                    applications.forEach(element => { collectionNames.push(`${appdata_initials}_appdata_${element._id}_<MONTH><YEAR>`) });
                    resolve(collectionNames);
                } else {
                    resolve(false);
                }
            })
    })
}

function Arrays_sum(array1, array2) {
    // console.log("array 1 , array 2 ", array1, array2);
    var result = [];
    var ctr = 0;
    var x = 0;

    if (array1.length === 0)
        return "array1 is empty";
    if (array2.length === 0)
        return "array2 is empty";

    while (ctr < array1.length && ctr < array2.length) {
        result.push(array1[ctr] + array2[ctr]);
        ctr++;
    }

    if (ctr === array1.length) {
        for (x = ctr; x < array2.length; x++) {
            result.push(array2[x]);
        }
    } else {
        for (x = ctr; x < array1.length; x++) {
            result.push(array1[x]);
        }
    }
    return result;
}

function dateConverter(body) {
    return new Promise((resolve, reject) => {
        let dates = []
        if (body.type.toLowerCase() == 'last 5 mins' || body.type.toLowerCase() == 'last 1 hour') {
            let tempdates = body.range.split('-')
            tempdates.forEach(d => {
                let min = new Date(d).getMinutes()
                let hour = ("0" + new Date(d).getHours()).slice(-2)
                let date = ("0" + new Date(d).getDate()).slice(-2)
                let month = ("0" + (Number(new Date(d).getMonth()) + 1)).slice(-2)
                let year = new Date(d).getFullYear()
                dates.push(year + month + date + hour + min)
            })
        } else {
            if (body.range.includes("-")) {
                dates = body.range.split('-')
            } else {
                dates.push(body.range)
            }
        }
        resolve(dates)
    })
}

function dateConverterForLinePie(body) {
    return new Promise((resolve, reject) => {
        let dates = []
        if (body.send.toLowerCase() == 'last 5 mins' || body.send.toLowerCase() == 'last 1 hour') {
            let tempdates = body.value.split('-')
            tempdates.forEach(d => {
                let min = new Date(d).getMinutes()
                let hour = ("0" + new Date(d).getHours()).slice(-2)
                let date = ("0" + new Date(d).getDate()).slice(-2)
                let month = ("0" + (Number(new Date(d).getMonth()) + 1)).slice(-2)
                let year = new Date(d).getFullYear()
                dates.push(year + month + date + hour + min)
                console.log(min, hour, date, month, year);
            })
        } else {
            if (body.value.includes("-")) {
                dates = body.value.split('-')
            } else {
                dates.push(body.value)
            }
        }
        resolve(dates)
    })
}

function boundariesDateCollectorForLine(body, cname, boundary1, boundary2, boundaries) {
    return new Promise((resolve, reject) => {
        let db = getDb()
        // console.log(" ??? bouundaries collector ???? ", body, cname, boundary1, boundary2, boundaries);
        let matchBody = {}
        let clientId = body.client_id ? body.client_id : ""
        if (clientId == '') {
            matchBody = {
                api: body.api,
                $and: [
                    { created_on: { $gt: boundary1 }, },
                    { created_on: { $lt: boundary2 }, }
                ],
                method: body.method
            }
        } else {
            matchBody = {
                api: body.api,
                $and: [
                    { created_on: { $gt: boundary1 }, },
                    { created_on: { $lt: boundary2 }, },
                    {
                        client_id: body.client_id
                    }
                ],
                method: body.method
            }
        }
        db.collection(cname)
            .aggregate([{
                $match: matchBody
            },
            {
                $group: {
                    _id: "$response_time",
                    count: { $sum: 1 },
                    avgResponse: { $avg: "$response_time" },
                }
            }
            ])
            .toArray()
            .then(async result => {
                result = result.filter(res => res._id != 'Others')
                if (result.length > 0) {
                    let boundariesKey = Object.keys(applicationDetailsForLineGraph[0])
                    boundariesKey.splice(0, 3)
                    result.forEach((element) => {
                        for (let i = 0; i < boundaries.length; i++) {
                            if (boundary1 == boundaries[i]) {
                                applicationDetailsForLineGraph[0][boundariesKey[i]].averageResponse.push(element.avgResponse)
                            }
                        }
                    })
                    resolve(true)
                } else {
                    resolve(true)
                }
            })
    })
}

function boundariesDateCollector(body, cname, boundary1, boundary2, applicationExists, boundaries) {
    console.log("............datecollector .......  ", body, cname, boundary1, boundary2, applicationExists);
    return new Promise(async (resolve, reject) => {

        let matchBody = {}
        let clientId = body.client_id ? body.client_id : ""
        if (clientId == '') {
            matchBody = {
                $and: [
                    { created_on: { $gt: boundary1 }, },
                    { created_on: { $lt: boundary2 }, }
                ]
            }
        } else {
            matchBody = {
                $and: [
                    { created_on: { $gt: boundary1 }, },
                    { created_on: { $lt: boundary2 }, },
                    {
                        client_id: body.client_id
                    }
                ]
            }
        }
        console.log("match body :: ", matchBody);
        let db = getDb()
        let result = await db.collection(cname)
            .aggregate([{
                $match: matchBody
            },
            {
                $group: {
                    _id: "$status_code",
                    count: { $sum: 1 },
                }
            }
            ])
            .toArray()
        // .then(async result => {
        console.log("result////// ", result);
        if (result.length > 0) {
            let statusObj = {}
            console.log("resulttttt ", result);
            result.forEach(element => {
                if (statusObj[element._id]) {
                    statusObj[element._id] = statusObj[element._id] + element['count']
                } else {
                    statusObj[element._id] = element['count']
                }
            })
            let foundStatusCodes = Object.keys(statusObj)
            foundStatusCodes.forEach(code => { if (!applicationExists.includes(code)) { applicationExists.push(code) } })
            let index = boundaries.indexOf(boundary1)
            let boundariesKey = Object.keys(applicationDetailsForGraph[0])
            boundariesKey.splice(0, 3)
            if (applicationDetailsForGraph[0][boundariesKey[index]]) {
                applicationDetailsForGraph[0][boundariesKey[index]] = statusObj
            }
            resolve(true)
        } else {
            resolve(true)
        }
        // })
    })
}

function finalDateGenerator(result, tableDataForApi) {
    return new Promise((resolve, reject) => {
        // console.log("tableDataForApi ......in ...finalDateGenerator ", result);
        result.forEach(name => {
            if (!tableDataForApi.some(el => el._id == name._id)) {
                let element = {
                    _id: name._id,
                    minResponse: [],
                    maxResponse: [],
                    avgResponse: [],
                    count: [],
                    success_count: []
                }
                element.minResponse.push(name.minResponse)
                element.maxResponse.push(name.maxResponse)
                element.avgResponse.push(name.avgResponse)
                element.count.push(name.count)
                element.success_count.push(name.success_count)
                tableDataForApi.push(element)
            } else {
                tableDataForApi.forEach(data => {
                    if (data._id == name._id) {
                        data.minResponse.push(name.minResponse)
                        data.maxResponse.push(name.maxResponse)
                        data.avgResponse.push(name.avgResponse)
                        data.count.push(name.count)
                        data.success_count.push(name.success_count)
                    }
                })

            }
        })
        resolve(true)
    })
}


module.exports.getAppCount = async function (req, res) {
    try {
        console.log("get App Count body : ",req.body);
        let application = req.body.app;
        let start = req.body.range.timestamp.start;
        let end = req.body.range.timestamp.end;

        const db = getDb();

        var boundaries = common.generateTimeSeriesBoundaries(start, end);

        var pipeline = createPipeline(start, end, boundaries);

        var collection = cfg.appdata_initials + '_appdata_' + application + '_022021';

        var resultAggregation = await executeAggregation(db, collection, pipeline);

        var response = generateGraphResult(resultAggregation, boundaries);

        return responseData(res, true, 200, "success", response);
    } catch (error) {
        console.log("---error---", error);
        return responseData(res, false, 500);
    }
}


function timezoneWiseBoundaries(timezone, boundaries) {

    var convertedBoundaries = [];

    boundaries.forEach(b => {
        convertedBoundaries.push(momentTimeZone(new Date(b)).tz(timezone).format());
    });

    return convertedBoundaries;
}


function generateGraphResult(data, boundaries) {
    var result = {};
    result.series = [];
    result.boundaries = timezoneWiseBoundaries("Asia/Kolkata", boundaries);

    var obj = {};
    obj.name = "API Count"
    obj.data = [];

    if (data.length > 0) {

        boundaries.forEach(b => {
            var f = false;
            data.forEach(e => {
                if (b.getTime() == e._id.getTime()) {
                    obj.data.push(e.count)
                    f = true;
                }
            })

            if (!f)
                obj.data.push(0)
        });
    }

    result.series.push(obj);

    return result;
}




function createPipeline(start, end, boundaries, output) {
    var o = {};
    o.count = { $sum: 1 };

    if (output) {
        o.success_hits = {
            $push: { "status_code": "$status_code" }
        }
    }

    var pipeline = [];

    pipeline.push({
        $match: { created_on: { $gte: new Date(start), $lte: new Date(end) } }
    })

    pipeline.push({
        $bucket: {
            groupBy: "$created_on",
            boundaries: boundaries,
            default: "others",
            output: o
        }
    })

    return pipeline;
}


function executeAggregation(db, collection, pipeline) {
    return new Promise(async (resolve, reject) => {

        var result = await db.collection(collection).aggregate(pipeline, { allowDiskUse: true }).toArray();
        resolve(result);

    })
}
const { responseData } = require('../utils/responseHandler');
const { appdata_initials } = require('../config.json');
const { ObjectID } = require('mongodb').ObjectId;
const common = require('../utils/common')

let applicationDetailsForGraph = [];
let applicationDetails = [];



module.exports.getTableData = async function (req, res) {
    try {
        let { body } = req
        const promises = []
        var db = req.app.db;
        // console.log("getTableData :", body);
        let tempCollectionNames = await getApplications(db, req.headers)
        if (!tempCollectionNames)
            tempCollectionNames = []

        let dates = await dateConverter(body)
        let collectionNames = await collectionNamesGenerator(tempCollectionNames, dates)
        // console.log("getTableData dashboard :", dates);
        if (dates.length > 1) {
            collectionNames.map((cname) => { promises.push(successRateAdderForRange(db, body, cname, dates[0], dates[1])) })
        }
        else {
            collectionNames.map((cname) => { promises.push(successRateAdder(db, cname, dates[0])) })
        }
        Promise.all(promises).then(async response => {
            if (response) {
                applicationDetails.forEach(element => {
                    let totalCount;
                    let successCount;
                    if (element.minResponse.length > 0) {
                        element.minResponse = Math.min(...element.minResponse)
                    }
                    if (element.maxResponse.length > 0) {
                        element.maxResponse = Math.max(...element.maxResponse)
                    }
                    if (element.avgResponse.length > 0) {
                        let totalAvg = element.avgResponse.reduce((acc, avg) => acc + avg, 0)
                        element.avgResponse = (totalAvg / element.avgResponse.length).toFixed(2)
                    }
                    if (element.totalCount.length > 0) {
                        totalCount = element.totalCount.reduce((acc, avg) => acc + avg, 0)
                        element.totalCount = totalCount
                    }
                    if (element.successCount.length > 0) {
                        successCount = element.successCount.reduce((acc, avg) => acc + avg, 0)
                    }
                    if (totalCount >= 0 && successCount >= 0) {
                        element.successRate = ((successCount / totalCount) * 100).toFixed(2)
                    }
                })
                let finalResponse = await finalResponseCreator(applicationDetails)
                // console.log("finalResponsein DASHBOARD : ", finalResponse);
                return responseData(res, true, 200, "success", finalResponse)
            }
            return responseData(res, false, 200, "failure")
        })
    }
    catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

module.exports.getGraphData = async function (req, res) {
    let db = req.app.db;
    let timeZone = /\((.*)\)/.exec(new Date().toString())[1]
    let { body } = req
    const promises = []
    const applicationExists = []
    applicationDetailsForGraph = []
    console.log("getGraphData");
    let boundaries = await boundariesGenarator(body)
    // console.log("getGraphData :", boundaries);
    let dateobj = await datesMonthsYearGiver(body)
    let tempCollectionNames = await getApplicationsForGraph(db, boundaries, req.header)
    // console.log("--------: ", applicationDetailsForGraph);
    let collectionDetails = await collectionNamesGeneratorForGraph(tempCollectionNames, dateobj)
    collectionDetails.map((cname) => { promises.push(dataCollector(db, cname, dateobj, applicationExists)) })
    Promise.all(promises).then(async response => {
        if (response) {
            let finalResponse = await areaGraphDataConverter(applicationExists, boundaries, dateobj)
            // if (body.type.toLowerCase() == 'day') {
            // console.log("boundaries :", finalResponse.boundaries);

            if (timeZone != "Coordinated Universal Time") {
                if (body.type.toLowerCase() == 'day' || body.type.toLowerCase() == 'last 1 hour' || body.type.toLowerCase() == 'last 5 mins') {
                    finalResponse.boundaries.forEach(element => {
                        element.setHours(element.getHours() + 5);
                        element.setMinutes(element.getMinutes() + 30);
                    })
                }
            }
            // finalResponse.boundaries.forEach(element => {
            //     element.setHours(element.getHours() - 5);
            //     element.setMinutes(element.getMinutes() - 30);
            // })
            // }
            if (body.type.toLowerCase() != 'day' && body.type.toLowerCase() != 'last 5 mins' && finalResponse && finalResponse.boundaries && finalResponse.boundaries.length > 0) {
                finalResponse.boundaries.pop()
            }
            // console.log("getGraphData : ", finalResponse);
            return responseData(res, true, 200, "success", finalResponse)
        }
        return responseData(res, false, 200, "failure")
    })
}

function areaGraphDataConverter(applicationExists, boundaries, dateobj) {
    return new Promise((resolve, reject) => {
        let series = []
        // console.log("applicationExists, boundaries, dateobj ......>>> ",applicationExists, boundaries, dateobj);
        applicationDetailsForGraph = applicationDetailsForGraph.filter(element => applicationExists.includes(String(element._id)))
        // console.log("applicationDetailsForGraph areaGraphDataConverter >>>>>>>>>>>>>>>>>> ",applicationDetailsForGraph);
        let tempApplicationDetailsForGraph = []
        applicationDetailsForGraph.forEach(app => {
            tempApplicationDetailsForGraph.push(app)
        })
        applicationDetailsForGraph = []
        tempApplicationDetailsForGraph.forEach(app => {
            boundaries.forEach(element => {
                if (app[element]) {
                    app[element] = app[element].reduce((acc, avg) => acc + avg, 0)
                }
            })
        })
        tempApplicationDetailsForGraph.forEach(element => {
            // console.log("tempApplicationDetailsForGraph --->> ",tempApplicationDetailsForGraph);
            if (!series.some(e1 => e1.name == element.name)) {
                let data = []
                boundaries.forEach(bound => { data.push(element[bound]) })
                series.push({ _id: element._id, name: element.name, data: data })
            }
        });
        // boundaries.forEach(element => {
        //     element.setHours(element.getHours() + 5);
        //     element.setMinutes(element.getMinutes() + 30);
        // })
        // console.log("series in dashboard BEFORE :", series);

        series = series.filter(app => { if (!app.data.every(a => a == 0)) { return app } })
        // console.log("series in dashboard :", series);
        resolve({ series, boundaries })
    })
}

function boundariesGenarator(body) {
    return new Promise((resolve, reject) => {
        let dateRange = []
        let boundaries = []
        let range = body.range
        let type = body.type
        let timeZone = /\((.*)\)/.exec(new Date().toString())[1]
        console.log(timeZone);
        console.log("type : ", type, body);
        if (type.toLowerCase() == "last 5 mins") {
            range = range.split("-")
            range.forEach(element => {
                element = new Date(element)
                element.setHours(element.getHours() + 5);
                element.setMinutes(element.getMinutes() + 30);
                dateRange.push(element)
            })
            boundaries.push(new Date(dateRange[0]))
            while (boundaries[boundaries.length - 1] < dateRange[1]) {
                let date = boundaries[boundaries.length - 1]
                let newDate = new Date(date.getTime() + 60000)
                boundaries.push(newDate)
            }
            if (timeZone != "Coordinated Universal Time") {
                boundaries.forEach(bound => {
                    bound.setHours(bound.getHours() - 5)
                    bound.setMinutes(bound.getMinutes() - 30)
                })
            }
        }
        else if (type.toLowerCase() == "last 1 hour") {
            range = range.split("-")
            range.forEach(element => {
                element = new Date(element)
                element.setHours(element.getHours() + 5);
                element.setMinutes(element.getMinutes() + 30);
                dateRange.push(element)
            })
            boundaries.push(new Date(dateRange[0]))
            while (boundaries[boundaries.length - 1] <= dateRange[1]) {
                let date = boundaries[boundaries.length - 1]
                let newDate = new Date(date.getTime() + (60000 * 5))
                boundaries.push(newDate)
            }
            if (timeZone != "Coordinated Universal Time") {
                boundaries.forEach(bound => {
                    bound.setHours(bound.getHours() - 5)
                    bound.setMinutes(bound.getMinutes() - 30)
                })
            }
        }
        else if (type.toLowerCase() == 'month' || type.toLowerCase() == 'days') {
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
            let lastDate = boundaries[boundaries.length - 1]
            new Date(lastDate.setHours(lastDate.getHours() + 23))
            new Date(lastDate.setMinutes(lastDate.getMinutes() + 59))
            new Date(lastDate.setSeconds(lastDate.getSeconds() + 59))
            console.log("boundaries dashboard before: ", boundaries);
            boundaries.pop()
            // boundaries.forEach(bound => {
            //     bound.setHours(bound.getHours() + 5)
            //     bound.setMinutes(bound.getMinutes() + 30)
            // })
        }
        else if (type.toLowerCase() == 'day') {
            range = new Date(`${range.substr(0, 4)}-${range.substr(4, 2)}-${range.substr(6, 2)}`)
            boundaries.push(new Date(range))
            for (let i = 0; i < 23; i++) {
                boundaries.push(new Date(range.setHours(range.getHours() + 1)))
            }
            if (timeZone != "Coordinated Universal Time") {
                boundaries.forEach(bound => {
                    bound.setHours(bound.getHours() - 5)
                    bound.setMinutes(bound.getMinutes() - 30)
                })
            }
        }
        console.log("boundaries dashboard after: ", boundaries);
        resolve(boundaries)
    })
}

/* async function boundariesDateCollector(db, cname, boundaries, applicationExists) {
    return new Promise((resolve, reject) => {
        
        db.collection(cname)
            .aggregate([
                {
                    $bucket: {
                        groupBy: "$created_on",
                        boundaries: boundaries,
                        default: "Others",
                        output: {
                            "count": { $sum: 1 }
                        }
                    }
                },
            ])
            .toArray()
            .then(async result => {
                result = result.filter(res => res._id != 'Others')
                if (result.length > 0) {
                    // console.log("result : ", result);
                    if (!applicationExists.includes(cname.split('_')[2])) {
                        applicationExists.push(cname.split('_')[2])
                    }
                    resolve(await finalCountGenerator(cname, result))
                }
                else {
                    resolve(true)
                }
            })
    })
} */

async function dataCollector(db, cname, dateobj, applicationExists) {
    return new Promise((resolve, reject) => {

        db.collection(cname.collection)
            .find({ _id: cname.document_id })
            .toArray()
            .then(async result => {
                if (result.length > 0) {
                    if (!applicationExists.includes(result[0].a)) {
                        applicationExists.push(result[0].a)
                    }
                    resolve(await finalCountGenerator(dateobj, result, applicationExists))
                }
                else {
                    resolve(true)
                }
            })
    })
}

function finalCountGenerator(dateobj, result, applicationExists) {
    return new Promise((resolve, reject) => {
        // console.log("applicationDetailsForGraph", applicationDetailsForGraph);
        applicationDetailsForGraph.forEach(element => {
            if (element._id == result[0].a) {
                let dates = Object.keys(element)
                dates.splice(0, 3)
                let dataSet = result[0].d
                // console.log("dataSet :", dataSet);
                // console.log("dataSet :", JSON.stringify(dataSet));
                if (dateobj.type.toLowerCase() == 'last 5 mins') {
                    dates.forEach((d) => {
                        let date = String(new Date(d).getDate())
                        let hour = String(new Date(d).getHours())
                        let min = ("0" + (Number(new Date(d).getMinutes()))).slice(-2)
                        // ("0" + (Number(new Date(d).getMonth()) + 1)).slice(-2)
                        console.log(date, hour, min);
                        if (dataSet[date] && dataSet[date][hour] && dataSet[date][hour][min]) {
                            element[d].push(dataSet[date][hour][min]['c'])
                        }
                    })
                }
                else if (dateobj.type.toLowerCase() == 'last 1 hour') {
                    for (let index = 0; index < dates.length - 1; index++) {
                        let cdate = String(new Date(dates[index]).getDate())
                        let chour = String(new Date(dates[index]).getHours())
                        let cmin = ("0" + (Number(new Date(dates[index]).getMinutes()))).slice(-2)
                        let ndate = String(new Date(dates[index + 1]).getDate())
                        let nhour = String(new Date(dates[index + 1]).getHours())
                        let nmin = ("0" + (Number(new Date(dates[index + 1]).getMinutes()))).slice(-2)
                        cdate = Number(cdate)
                        chour = Number(chour)
                        cmin = Number(cmin)
                        ndate = Number(ndate)
                        nhour = Number(nhour)
                        nmin = Number(nmin)
                        // console.log("dataSet[cdate] :", dataSet[cdate], cdate, chour);
                        if (dataSet[cdate]) {
                            let desiredMin = dataSet[cdate][chour]
                            console.log("desiredMin :", desiredMin, chour, nhour);
                            console.log(chour == nhour);
                            console.log(chour < nhour);
                            if (chour == nhour) {
                                if (desiredMin != undefined || desiredMin != null) {
                                    let foundMins = Object.keys(desiredMin)
                                    // console.log("foundMins :", foundMins, cmin, chour);
                                    foundMins.forEach((min) => {
                                        // console.log("min :", min, cmin, nmin);
                                        if (!(isNaN(min)) && Number(min) >= cmin && Number(min) < nmin) {
                                            console.log("found", desiredMin[min]['c']);
                                            element[dates[index]].push(desiredMin[min]['c'])
                                        }
                                    })
                                }
                            }
                            else if (chour < nhour) {
                                let desiredMin1 = dataSet[cdate][nhour]
                                // console.log("else desiredmin1", desiredMin1);
                                if (desiredMin1 != undefined || desiredMin1 != null) {
                                    let foundMins = Object.keys(desiredMin1)
                                    console.log("foundMins else:", foundMins, cmin, nmin, chour, nhour);
                                    foundMins.forEach((min) => {
                                        if (!(isNaN(min)) && (Number(min) < nmin || Number(min) >= cmin) && desiredMin1[min]['c'] != undefined) {
                                            console.log("min else:", min, desiredMin1[min]['c']);
                                            element[dates[index]].push(desiredMin1[min]['c'])
                                        }
                                    })
                                }
                            }
                        }
                    }
                }
                else if (dateobj.type.toLowerCase() == 'day') {
                    dates.forEach(date => {
                        let cdate = String(new Date(date).getDate())
                        let chour = String(new Date(date).getHours())
                        if (dataSet[cdate]) {
                            console.log("day :", cdate, chour);
                            let desiredHour = dataSet[cdate][chour]
                            if (desiredHour != undefined) {
                                element[date].push(desiredHour['c'])
                            }
                        }
                    })
                }
                else if (dateobj.type.toLowerCase() == 'days') {
                    dates.forEach(date => {
                        let cdate = String(new Date(date).getDate())
                        if (dataSet[cdate]) {
                            element[date].push(dataSet[cdate]['c'])
                        }
                    })
                }
            }
        })
        // console.log("applicationDetailsForGraph : ", applicationDetailsForGraph);
        resolve(true)
    })
}

function finalResponseCreator(applicationDetail) {
    return new Promise((resolve, reject) => {
        // console.log("applicationDetail before- >  ",applicationDetail);
        applicationDetail = applicationDetail.filter((app) => Number(app.successRate) >= 0)
        // console.log("applicationDetail after- > ",applicationDetail);
        let finalOutput = { applicationWiseData: "", totalData: {} }
        finalOutput.applicationWiseData = applicationDetail
        let summary = {
            minResponse: [], maxResponse: [], avgResponse: [],
            totalCount: [], successCount: [], successRate: []
        }
        applicationDetail.forEach(element => {
            summary.minResponse.push(element.minResponse)
            summary.maxResponse.push(element.maxResponse)
            summary.avgResponse.push(element.avgResponse)
            summary.totalCount.push(element.totalCount)
            summary.successCount = summary.successCount.concat(element.successCount)
            summary.successRate.push(element.successRate ? element.successRate : 0)
        })
        summary.minResponse.length == 0 ? summary.minResponse = 0 : summary.minResponse = Math.min(...summary.minResponse)
        summary.maxResponse.length == 0 ? summary.maxResponse = 0 : summary.maxResponse = Math.max(...summary.maxResponse)
        // console.log("avgggg", summary.avgResponse)
        let summary_length = summary.avgResponse.length
        summary.avgResponse.length == 0 ? summary.avgResponse = 0 : summary.avgResponse = (summary.avgResponse.reduce((a, b) => parseFloat(a) + parseFloat(b), 0)) / summary_length
        // console.log("gggggg", typeof summary.avgResponse, summary.avgResponse)
        summary.totalCount = summary.totalCount.reduce((acc, avg) => acc + avg, 0)
        summary.successCount = summary.successCount.reduce((acc, avg) => acc + avg, 0)
        if (summary.successCount != 0 && summary.totalCount != 0) {
            summary.successRate = ((summary.successCount / summary.totalCount) * 100).toFixed(2)
        }
        else { summary.successRate = 0 }
        finalOutput.totalData = summary
        // console.log("finalOutput :", finalOutput);
        resolve(finalOutput)
    })
}

function dateConverter(body) {
    return new Promise((resolve, reject) => {
        let dates = []
        // console.log("body dashboard:", body);
        // for last 5 min, last 1 hour we get full date
        // for others we get data like 20210325
        // if (body.type.toLowerCase() == 'last 5 mins' || body.type.toLowerCase() == 'last 1 hour') {
        //     let tempdates = body.range.split('-')
        //     tempdates.forEach(d => {
        //         // console.log(d);
        //         let min = ("0" + new Date(d).getMinutes()).slice(-2)
        //         let hour = ("0" + new Date(d).getHours()).slice(-2)
        //         let date = ("0" + new Date(d).getDate()).slice(-2)
        //         let month = ("0" + (Number(new Date(d).getMonth()) + 1)).slice(-2)
        //         let year = new Date(d).getFullYear()
        //         console.log(year, month, date, hour, min);
        //         dates.push(year + month + date + hour + min)
        //     })
        // }
        // else {
        //     if (body.range.includes("-")) {
        //         dates = body.range.split('-')
        //     }
        //     else {
        //         dates.push(body.range)
        //     }
        // }
        console.log("dates dateConverter: ", dates);
        resolve(dates)
    })
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
        }
        else {
            dates.push(body.range)
        }
        if (body.type.toLowerCase() == 'day') {
            month = Number(dates[0].substr(4, 2))
            year = Number(dates[0].substr(0, 4))
            date = Number(dates[0].substr(6, 2))
            hour = [00, 23]
            minute = [00, 60]
        }
        else if (body.type.toLowerCase() == 'days') {
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
            hour = [00, 23]
            minute = [00, 60]
        }
        else if (body.type.toLowerCase() == 'last 5 mins' || body.type.toLowerCase() == 'last 1 hour') {
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
        console.log("dateobj :", dateobj);
        resolve(dateobj)
    })
}

async function collectionNamesGenerator(tempCollectionNames, dates) {
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
        // console.log("collectionNames : ", collectionNames);
        resolve(collectionNames)
    })
}

async function collectionNamesGeneratorForGraph(tempCollectionNames, dateObj) {
    return new Promise((resolve, reject) => {
        let collectionDetails = [];
        if (!tempCollectionNames)
            tempCollectionNames = []
        tempCollectionNames.forEach(collection => {
            let appName = collection.replace("app_stats_", '')
            collectionDetails.push({
                collection: collection,
                document_id: appName + "_" + dateObj.year + ":" + dateObj.month
            })
        })
        // console.log("collectionDetails : ", collectionDetails);
        resolve(collectionDetails)
    })
}

async function successRateAdder(db, cname, date1) {
    return new Promise((resolve, reject) => {
        let newDate = `${date1.substr(0, 4)}-${date1.substr(4, 2)}-${date1.substr(6, 2)}`
        let date = new Date(newDate)
        let newDate1 = new Date(date.setSeconds(date.getSeconds() - 1))
        let date2 = new Date(newDate)
        let newDate2 = new Date(date2.setDate(date2.getDate() + 1))
        newDate1 = new Date(newDate1.setHours(newDate1.getHours() - 5))
        newDate1 = new Date(newDate1.setMinutes(newDate1.getMinutes() - 30))
        newDate2 = new Date(newDate2.setHours(newDate2.getHours() - 5))
        newDate2 = new Date(newDate2.setMinutes(newDate2.getMinutes() - 30))
        // console.log("successRateAdder dashboard: ", newDate1, newDate2);

        db.collection(cname)
            .aggregate([
                {
                    $match: {
                        $and: [
                            { created_on: { $gt: newDate1 }, },
                            { created_on: { $lt: newDate2 }, }
                        ]
                    }
                },
                {
                    $group: {
                        _id: "$status_code",
                        minResponse: { $min: "$response_time" },
                        maxResponse: { $max: "$response_time" },
                        avgResponse: { $avg: "$response_time" },
                        count: { $sum: 1 },
                    }
                }
            ])
            .toArray()
            .then(async result => {
                // console.log(true, result)
                if (result.length > 0) {
                    resolve(await finalDateGenerator(result, cname))
                }
                else {
                    resolve(true)
                }
            })
    })
}

function finalDateGenerator(result, cname) {
    return new Promise((resolve, reject) => {
        let totalCount = 0
        let minResponse = 0;
        let maxResponse = 0;
        let avgResponse = 0;
        let successCount = 0;
        result.forEach((element) => {
            if (element._id == 200) {
                successCount = element.count
                minResponse = element.minResponse
                maxResponse = element.maxResponse
                avgResponse = element.avgResponse
            }
            totalCount += element.count
        })
        applicationDetails.forEach(element => {
            if (element._id == cname.split('_')[2]) {
                element.successCount.push(successCount)
                element.minResponse.push(minResponse)
                element.maxResponse.push(maxResponse)
                element.avgResponse.push(avgResponse)
                element.totalCount.push(totalCount)
                // console.log("finalDateGenerator : ", element);
                resolve(element)
            }
        })
    })
}

async function successRateAdderForRange(db, body, cname, date1, date2) {
    return new Promise((resolve, reject) => {
        let newDate1;
        let newDate2;
        // console.log(date1, date2);
        if (body.type.toLowerCase() == 'last 5 mins' || body.type.toLowerCase() == 'last 1 hour') {
            newDate1 = `${date1.substr(0, 4)}-${date1.substr(4, 2)}-${date1.substr(6, 2)}`
            newDate2 = `${date2.substr(0, 4)}-${date2.substr(4, 2)}-${date2.substr(6, 2)}`
            newDate1 = new Date(newDate1)
            newDate1 = new Date(newDate1.setHours(date1.substr(8, 2)))
            newDate1 = new Date(newDate1.setMinutes(date1.substr(10, 2)))
            // newDate1 = new Date(newDate1.setHours(newDate1.getHours() + 5))
            // newDate1 = new Date(newDate1.setMinutes(newDate1.getMinutes() + 30))
            newDate2 = new Date(newDate2)
            newDate2 = new Date(newDate2.setHours(date2.substr(8, 2)))
            newDate2 = new Date(newDate2.setMinutes(date2.substr(10, 2)))
            // newDate2 = new Date(newDate2.setHours(newDate2.getHours() + 5))
            // newDate2 = new Date(newDate2.setMinutes(newDate2.getMinutes() + 30))
        }
        else {
            // console.log("else");
            newDate1 = `${date1.substr(0, 4)}-${date1.substr(4, 2)}-${date1.substr(6, 2)}`
            newDate2 = `${date2.substr(0, 4)}-${date2.substr(4, 2)}-${date2.substr(6, 2)}`
            newDate1 = new Date(newDate1)
            newDate2 = new Date(newDate2)
            newDate2 = new Date(newDate2.setHours(newDate2.getHours() + 23))
            newDate2 = new Date(newDate2.setMinutes(newDate2.getMinutes() + 59))
            newDate2 = new Date(newDate2.setSeconds(newDate2.getSeconds() + 59))
            // newDate1 = new Date(newDate1.setHours(newDate1.getHours() - 5))
            // newDate1 = new Date(newDate1.setMinutes(newDate1.getMinutes() - 30))
            // newDate2 = new Date(newDate2.setHours(newDate2.getHours() - 5))
            newDate2.setHours(newDate2.getHours() - 23)
            newDate2.setMinutes(newDate2.getMinutes() - 59)
            newDate2.setSeconds(newDate2.getSeconds() - 59)
        }
        newDate2 = new Date(newDate2.setDate(newDate2.getDate() + 1))

        // console.log("successRateAdderForRange dashboard :", newDate1, newDate2);
        db.collection(cname)
            .aggregate([
                {
                    $match: {
                        $and: [
                            { created_on: { $gte: newDate1 }, },
                            { created_on: { $lte: newDate2 }, },
                        ]
                    }
                },
                {
                    $group: {
                        _id: "$status_code",
                        minResponse: { $min: "$response_time" },
                        maxResponse: { $max: "$response_time" },
                        avgResponse: { $avg: "$response_time" },
                        count: { $sum: 1 }
                    }
                }
            ])
            .toArray()
            .then(async result => {
                // console.log(true, result)
                if (result.length > 0) {
                    resolve(await finalDateGenerator(result, cname))
                }
                else {
                    resolve(true)
                }
            })
    })
}

async function getApplications(db, header) {
    return new Promise((resolve, reject) => {

        let collecName = common.collectionNameGenerator(header, 'applications')
        db.collection(collecName)
            .find()
            .project({ _id: 1, code: 1, name: 1 })
            .toArray()
            .then(applications => {
                if (applications.length > 0) {
                    let collectionNames = []
                    applications.forEach(element => {
                        element.minResponse = [];
                        element.maxResponse = [];
                        element.avgResponse = [];
                        element.totalCount = [];
                        element.successCount = [];
                    })
                    applicationDetails = applications
                    applications.forEach(element => { collectionNames.push(`${appdata_initials}_appdata_${element._id}_<MONTH><YEAR>`) });
                    resolve(collectionNames);
                }
                else {
                    resolve(false);
                }
            })
    })
}

async function getApplicationsForGraph(db, boundaries, header) {
    return new Promise((resolve, reject) => {

        let collecName = common.collectionNameGenerator(header, 'applications')
        db.collection(collecName)
            .find()
            .project({ _id: 1, code: 1, name: 1 })
            .toArray()
            .then(applications => {
                if (applications.length > 0) {
                    let collectionNames = []
                    applications.forEach(element => { boundaries.forEach(bound => { element[bound] = [] }) })
                    applications.forEach(app => { applicationDetailsForGraph.push(app) })
                    applications.forEach(element => { collectionNames.push(`app_stats_${element._id}`) });
                    // console.log("collectionNames :  ", collectionNames);
                    resolve(collectionNames);
                }
                else {
                    resolve(false);
                }
            })
    })
}

module.exports.getLineGraphDataForApiName = async (req, res) => {
    try {
        let { body } = req
        // console.log("getLineGraphDataForApiName :", body);
        const promises = []
        let boundaries = await boundariesGenarator(JSON.parse(body.range))
        let tempCollectionNames = await getApplicationForLine({ app: body.app, type: JSON.parse(body.range).send }, boundaries)
        let dates = await dateConverterForLinePie(JSON.parse(body.range))
        let collectionNames = await collectionNamesGenerator(tempCollectionNames, dates)
        // // console.log("boundaries :", boundaries);
        // console.log("collectionNames :", collectionNames);
        let istBoundaries = JSON.parse(JSON.stringify(boundaries))
        let boundariesForData = []
        istBoundaries.forEach(bound => {
            bound = new Date(bound)
            bound = new Date(bound.setHours(bound.getHours() - 5))
            bound = new Date(bound.setMinutes(bound.getMinutes() - 30))
            boundariesForData.push(bound)
        })
        for (let index = 1; index < boundariesForData.length - 1; index++) {
            promises.push(boundariesDateCollectorForLine(body.api, collectionNames[0], boundariesForData[index], boundariesForData[index + 1], boundariesForData))
        }
        Promise.all(promises).then(async response => {
            if (response) {
                let finalResponse = await areaGraphDataConverterForLine(boundaries)
                // if (range.send.toLowerCase() == 'last 5 mins') {
                //     finalResponse.boundaries.forEach(bound => {
                //         bound.setHours(bound.getHours() - 5)
                //         bound.setMinutes(bound.getMinutes() - 30)
                //     })
                // }
                // console.log("finalrespo.boundaries line:", finalResponse.boundaries);
                return responseData(res, true, 200, "success", finalResponse)
            }
            return responseData(res, false, 200, "failure")
        })
    }
    catch (error) {
        // console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

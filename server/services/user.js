const { responseData } = require('../utils/responseHandler')
const getDb = require('../utils/database').getDb
const ObjectId = require('mongodb').ObjectId
const jwt = require('jsonwebtoken')
const common = require('../utils/common')
const Email = require('../utils/sendMail')
const systemLog = require('../services/systemLog')
const ipAddress = require('../utils/common')
const { smtp_config } = require('../config.json')
const roleJSON = require('../utils/role.json')
const config = require('../config.json')

module.exports.saveAnonymousUserSession = async function (req, res) {
  const db = getDb()
  console.log('Inside anonlymos', req.body)
  if (req.body.userCookie) {
    let user = await db
      .collection('anonymousUser')
      .find({ userId: req.body.userCookie })
      .toArray()

    if (user && user.length > 0) {
      return responseData(res, true, 200, 'already exist')
    }
    await db
      .collection('anonymousUser')
      .insertOne({ userId: req.body.userCookie })
    let user2 = await db
      .collection('anonymousUser')
      .find({ userId: req.body.userCookie })
      .toArray()
    console.log('User Generated ', user2, user)
    return responseData(res, true, 200, 'updated')
  }
  return responseData(res, false, 500, 'internal server error')
}

module.exports.addAddress = async function (req, res) {
  const db = getDb()
  console.log('REquest body addAddress', req.body)
  if (req.body.userCookie) {
    let user = await db
      .collection('anonymousUser')
      .find({ userId: req.body.userCookie })
      .toArray()

    console.log('user values ', user)

    if (user.length == 0) {
      return responseData(res, true, 200, 'User Does not exist')
    }

    const billingAddress = req.body.item
    if (user[0].billingAddress) {
      await db
        .collection('anonymousUser')
        .updateOne(
          { userId: req.body.userCookie },
          { $set: { billingAddress: [billingAddress] } }
        )
    } else {
      await db
        .collection('anonymousUser')
        .updateOne(
          { userId: req.body.userCookie },
          { $push: { billingAddress: billingAddress } }
        )
    }
    console.log('Billing Address', billingAddress)
    return responseData(res, true, 200, 'User Does not exist', billingAddress)
  }
}

module.exports.getAddress = async function (req, res) {
  const db = getDb()
  console.log('REquest body addAddress', req.body)
  if (req.body.userCookie) {
    let user = await db
      .collection('anonymousUser')
      .find({ userId: req.body.userCookie })
      .toArray()

    if (user.length == 0) {
      return responseData(res, true, 200, 'User Does not exist')
    }

    console.log('Billing Address', user)
    return responseData(
      res,
      true,
      200,
      'User Does not exist',
      user[0]?.billingAddress
    )
  }
}

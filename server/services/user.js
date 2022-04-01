const { responseData } = require('../utils/responseHandler')
const getDb = require('../utils/database').getDb
const ObjectId = require('mongodb').ObjectId
const moment = require('moment')

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

    return responseData(res, true, 200, 'updated')
  }
  return responseData(res, false, 500, 'internal server error')
}

module.exports.addAddress = async function (req, res) {
  const db = getDb()

  console.log('Req body cookie user', req.body.userCookie)
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

module.exports.addCoupons = async function (req, res) {
  try {
    console.log('Get string in add Coupon', req.body)
    const db = getDb()
    if (!req.body.item.couponString) {
      return responseData(res, false, 200, 'coupon invalid', {
        error: 'Enter some Value to apply',
      })
    }

    let isCouponValid = await checkCouponCode(
      req.body.item.couponString.toUpperCase()
    )
    if (!(isCouponValid && isCouponValid.length > 0)) {
      return responseData(res, false, 200, 'Coupon invalid', {
        error: 'This Coupon Does not exist',
      })
    }

    let isCodeEnds = await checkCouponTime(
      req.body.item.couponString.toUpperCase(),
      moment().format('YYYY-MM-DD')
    )

    if (!isCodeEnds) {
      return responseData(res, false, 200, 'Coupon invalid', {
        error: 'Coupon Expired',
      })
    }

    if (isCouponValid[0].isApplyOnes) {
      let isFirstTimeValid = await checkFirstTime(
        req.body.item.userCookie,
        isCouponValid[0]._id
      )
      if (!isFirstTimeValid) {
        return responseData(res, false, 200, 'Coupon invalid', {
          error: 'Only allowed once',
        })
      }
    }

    if (req.body.cartCookie) {
      let discountPrice
      let userCart = await db
        .collection('cart')
        .find({ id: req.body.cartCookie })
        .toArray()

      if (isCouponValid[0]?.Discount?.type == 'Price') {
        discountPrice =
          userCart[0].subtotalPrice - isCouponValid[0]?.Discount.totalDiscount
      } else {
        discountPrice =
          userCart[0].subtotalPrice -
          ((userCart[0].subtotalPrice *
            isCouponValid[0]?.Discount.totalDiscount) %
            100)
      }

      await db.collection('cart').updateOne(
        {
          id: req.body.cartCookie,
        },
        {
          $set: {
            subtotalPrice: discountPrice,
            totalPrice: discountPrice,
          },
        }
      )
    }

    console.log('Coupon valid ', req.body.item.couponString)

    return responseData(res, true, 200, 'Coupon added successfully', {
      coupon: req.body.item.couponString,
    })
  } catch (err) {
    console.log(err)
    return responseData(res, false, 200, 'Error while applying coupon', {
      error: 'Unknown error',
    })
  }
}

module.exports.getCoupons = async function (req, res) {
  console.log('Get string in getcoupon', req.body)

  return responseData(res, true, 200, 'Coupon Added', 'Sting')
}

async function checkCouponCode(code) {
  try {
    const db = getDb()
    return await db
      .collection('coupons')
      .find({ code: code, isActive: true })
      .toArray()
  } catch (err) {
    console.log('error value is here', err)
    return []
  }
}

async function checkCouponTime(code, date) {
  try {
    console.log('code and date value is here', code, date)

    const db = getDb()
    let coupon = await db
      .collection('coupons')
      .find({ code: code, isActive: true }, { end: 1 })
      .toArray()
    if (coupon && coupon.length > 0) {
      if (date < coupon[0].end) {
        return true
      }
      return false
    }
    return false
  } catch (err) {
    console.log('error value is here', err)
    return false
  }
}

async function checkFirstTime(userCookie, coupanId) {
  try {
    const db = getDb()
    let isUserExist = await db
      .collection('anonymousUser')
      .find({ userId: userCookie })
      .toArray()

    if (isUserExist && isUserExist.length > 0) {
      let isCouponAlreadyExist = await db
        .collection('anonymousUser')
        .find({ userId: userCookie }, { coupon: 1 })
        .toArray()

      if (isCouponAlreadyExist && isCouponAlreadyExist > 0) {
        let coupon = await db
          .collection('coupons')
          .find({ _id: ObjectId(coupanId) })
          .toArray()

        if (!(coupon && coupon.length > 0)) {
          return false
        }

        isCouponAlreadyExist[0].coupon.forEach((element) => {
          if (element == coupon[0]._id) {
            return false
          }
        })
        await db.collection('anonymousUser').updateOne(
          { userId: userCookie },
          {
            $push: {
              coupon: coupanId,
            },
          }
        )
        return true
      }
      await db.collection('anonymousUser').updateOne(
        { userId: userCookie },
        {
          $push: {
            coupon: coupanId,
          },
        }
      )
      return true
    }
    return true
  } catch (err) {
    console.log('error value is here', err)
    return false
  }
}

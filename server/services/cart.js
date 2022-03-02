const { responseData } = require('../utils/responseHandler')
const getDb = require('../utils/database').getDb
const getRandomString = require('../utils/common')
const Razorpay = require('razorpay')
const RAZORPAY_SECRET = 'FFOWaou3b53tJEAo0dePFJzP'
const RAZORPAY_KEY_ID = 'rzp_test_t5UpDd0l8YtnLg'

let obj = {
  id: 'Z2lkOi8vc2hvcGlmeS9Qcm9ksdWN0LzU0NDczMjUwMjQ0MjA=',
  createdAt: '2022-02-14T16:05:07+00:00',
  currency: { code: 'USD' },
  taxesIncluded: 'false',
  lineItems: [
    {
      countItems: 1,
      discounts: [],
      id: 'Z2lkOi8vc2hvcGlmeS9Qcm9ksdWN0LzU0NDczMjUwMjQ0MjA=',
      name: 'jacket',
      path: 'lightweight-jacket',
      productId: 'Z2lkOi8vc2hvcGlmeS9Qcm9ksdWN0LzU0NDczMjUwMjQ0MjA=',
      quantity: 1,
      variant: [
        {
          id: 381,
          image: [
            {
              url: 'https://cdn11.bigcommerce.com/s-qfzerv205w/products/117/images/534/Men-TShirt-Black-Front__70046.1603748348.220.290.png?c=1',
            },
          ],
          listPrice: 160.12,
          name: 'jacket',
          price: 160,
          requiresShipping: true,
          sku: '5F6D80F2EB67C_11047-BL-XS',
        },
      ],
      variantId: 381,
    },
  ],
  lineItemsSubtotalPrice: 100,
  subtotalPrice: 100,
  totalPrice: 100,
}

module.exports.getcart = async function (req, res) {
  try {
    const db = getDb()
    let cartCookie

    let productsData = await db
      .collection('products')
      .find({ id: req.body.item.productId })
      .toArray()
    let data

    if (!req.body.cartCookie) {
      cartCookie = getRandomString.uuidv4()

      let obj = {
        id: cartCookie,
        createdAt: Date.now(),
        currency: { code: 'USD' },
        taxesIncluded: 'false',
        lineItems: [],
        lineItemsSubtotalPrice: productsData[0].price.value,
        subtotalPrice: productsData[0].price.value,
        totalPrice: productsData[0].price.value,
      }

      let updatedCart = await updateCartObj(false, productsData[0])
      obj.lineItems.push(updatedCart)
      data = obj
      let unsued = await db.collection('cart').insertOne(obj)
    } else {
      cartCookie = req.body.cartCookie
      let cart = await db
        .collection('cart')
        .find({ id: req.body.cartCookie })
        .toArray()
      let updatedCart = await updateCartObj(
        true,
        productsData[0],
        cart[0],
        cartCookie
      )
      if (updatedCart?.isDuplicate == true) {
        data = updatedCart.data
        console.log('fine and working what is wrong with that ', data)
        return responseData(res, true, 200, 'get cart details we are in', {
          data,
          cartCookie,
        })
      }
      data = updatedCart
      await db
        .collection('cart')
        .updateOne({ id: req.body.cartCookie }, { $set: updatedCart })
    }
    return responseData(res, true, 200, 'get cart details we are in', {
      data,
      cartCookie,
    })
  } catch (err) {
    console.log('error ==>>>', err)
    return responseData(res, false, 500, 'Internal Server Error')
  }
}

module.exports.getcartDetails = async function (req, res) {
  try {
    const db = getDb()
    let cart
    if (req.body.cartCookie) {
      cart = await db
        .collection('cart')
        .find({ id: req.body.cartCookie })
        .toArray()
    }
    let data = cart[0]?.lineItems.length > 0 ? cart[0] : null
    // let data = obj.lineItems.length> 0 ? obj : null
    return responseData(res, true, 200, 'cartDetails', data)
    //   return obj;
  } catch (err) {
    console.log('error ==>>>', err)
    return responseData(res, false, 500, 'Internal Server Error')
  }
}

module.exports.deleteCart = async function (req, res) {
  try {
    const db = getDb()
    let updated = await db.collection('cart').update(
      { id: req.body.cartCookie },

      {
        $pull: {
          lineItems: { id: req.body.itemId },
        },
        $set: {
          lineItemsSubtotalPrice: 0,
          subtotalPrice: 0,
          totalPrice: 0,
        },
      },
      { multi: true }
    )
    let data = await db
      .collection('cart')
      .find({ id: req.body.cartCookie })
      .toArray()

    return responseData(res, true, 200, 'Data finished', data[0])
  } catch (err) {
    console.log('error ==>>>', err)
    return responseData(res, false, 500, 'Internal Server Error')
  }
}

module.exports.checkout = async function (req, res) {
  try {
    const db = getDb()

    let data = {
      id: '79dbef51-322d-4964-8fbe-a318041f19ba',
      cart: {
        id: '79dbef51-322d-4964-8fbe-a318041f19ba',
        customerId: 0,
        email: '',
        currency: {
          name: 'US Dollars',
          code: 'USD',
          symbol: '$',
          decimalPlaces: 2,
        },
        isTaxIncluded: false,
        baseAmount: 499.98,
        discountAmount: 0,
        cartAmount: 499.98,
        coupons: [],
        discounts: [
          {
            id: 'c7a796fa-a2a9-4b8d-b53a-be253115b19f',
            discountedAmount: 0,
          },
        ],
        lineItems: {
          physicalItems: [
            {
              id: 'c7a796fa-a2a9-4b8d-b53a-be253115b19f',
              parentId: null,
              variantId: 395,
              productId: 116,
              sku: '5F6D80A544056_9908-BL-SM',
              name: 'Lightweight Jacket',
              url: 'https://acmedemo.mybigcommerce.com/lightweight-jacket',
              quantity: 2,
              brand: 'ACME',
              isTaxable: true,
              imageUrl:
                'https://cdn11.bigcommerce.com/s-qfzerv205w/products/116/images/512/Men-Jacket-Front-Black__15466.1603283963.220.290.png?c=1',
              discounts: [],
              discountAmount: 0,
              couponAmount: 0,
              listPrice: 249.99,
              salePrice: 249.99,
              extendedListPrice: 499.98,
              extendedSalePrice: 499.98,
              comparisonPrice: 249.99,
              extendedComparisonPrice: 499.98,
              isShippingRequired: true,
              giftWrapping: null,
              addedByPromotion: false,
              isMutable: true,
              options: [
                {
                  name: 'Color',
                  nameId: 150,
                  value: 'Black',
                  valueId: 270,
                },
                {
                  name: 'Size',
                  nameId: 151,
                  value: 'S',
                  valueId: 272,
                },
              ],
              categoryNames: ['Shop All', 'Apparel'],
            },
          ],
          digitalItems: [],
          giftCertificates: [],
          customItems: [],
        },
        createdTime: '2022-02-14T16:05:07+00:00',
        updatedTime: '2022-02-14T17:42:15+00:00',
        locale: 'en',
      },
      billingAddress: {},
      consignments: [],
      orderId: null,
      shippingCostTotal: 0,
      shippingCostBeforeDiscount: 0,
      handlingCostTotal: 0,
      taxTotal: 0,
      giftWrappingCostTotal: 0,
      coupons: [],
      taxes: [
        {
          name: 'Tax',
          amount: 0,
        },
      ],
      subtotal: 499.98,
      grandTotal: 499.98,
      outstandingBalance: 499.98,
      isStoreCreditApplied: true,
      shouldExecuteSpamCheck: false,
      giftCertificates: [],
      createdTime: '2022-02-14T16:05:07+00:00',
      updatedTime: '2022-02-14T17:42:15+00:00',
      customerMessage: '',
      customer: {
        id: 0,
        isGuest: true,
        email: '',
        firstName: '',
        lastName: '',
        fullName: '',
        addresses: [],
        storeCredit: 0,
        shouldEncourageSignIn: false,
      },
      promotions: [],
      payments: [{}],
    }
    return responseData(res, true, 200, 'get cart details we are in', data)
  } catch (err) {
    console.log('error ==>>>', err)
    return responseData(res, false, 500, 'Internal Server Error')
  }
}

module.exports.updateCart = async function (req, res) {
  const db = getDb()

  let cart = await db
    .collection('cart')
    .find({ id: req.body.cartCookie })
    .toArray()
  cart = cart[0]
  let price, qunatity
  for (let i = 0; i < cart.lineItems.length > 0; i++) {
    console.log(cart.lineItems[i].productId, req.body.itemId)
    if (cart.lineItems[i].productId == req.body.itemId) {
      price = cart.lineItems[i].price
      qunatity = cart.lineItems[i].quantity
    }
  }

  let lineItemsSubtotalPrice =
    cart.lineItemsSubtotalPrice -
    price * qunatity +
    req.body.item.quantity * price
  let subtotalPrice =
    cart.subtotalPrice - price * qunatity + req.body.item.quantity * price
  let totalPrice =
    cart.totalPrice - price * qunatity + req.body.item.quantity * price

  await db.collection('cart').updateOne(
    { id: req.body.cartCookie, 'lineItems.id': req.body.itemId },
    {
      $set: {
        'lineItems.$.quantity': req.body.item.quantity,
        lineItemsSubtotalPrice: lineItemsSubtotalPrice,
        subtotalPrice: subtotalPrice,
        totalPrice: totalPrice,
      },
    }
  )
  let data = await db
    .collection('cart')
    .find({ id: req.body.cartCookie })
    .toArray()
  // return responseData(res, true, 200, 'update qunatity with this value',obj);
  return responseData(
    res,
    true,
    200,
    'update qunatity with this value',
    data[0]
  )
}
async function updateCartObj(iscartUpdated, productData, cartData, cartCookie) {
  const db = getDb()

  let linesObject = {
    countItems: 1,
    discounts: [],
    id: productData.id,
    name: productData.name,
    path: productData.slug,
    productId: productData.id,
    quantity: 1,
    price: productData.price.value,
    variant: [
      {
        id: 381,
        image: [
          {
            url: 'https://cdn11.bigcommerce.com/s-qfzerv205w/products/117/images/534/Men-TShirt-Black-Front__70046.1603748348.220.290.png?c=1',
          },
        ],
        listPrice: 160.12,
        name: 'jacket',
        price: 160,
        requiresShipping: true,
        sku: '5F6D80F2EB67C_11047-BL-XS',
      },
    ],
    variantId: 381,
  }

  if (!iscartUpdated) {
    return linesObject
  }

  let data = await db
    .collection('cart')
    .find({ id: cartCookie, 'lineItems.id': productData.id })
    .toArray()

  if (data.length > 0) {
    data = data[0]
    let price
    let quantity

    for (let i = 0; i < data.lineItems.length > 0; i++) {
      console.log('andedeee', data.lineItems[i])
      if (data.lineItems[i].productId == productData.id) {
        price = data.lineItems[i].price
        quantity = data.lineItems[i].quantity
      }
    }

    let lineItemsSubtotalPrice =
      data.lineItemsSubtotalPrice - price * quantity + (quantity + 1) * price
    let subtotalPrice =
      data.subtotalPrice - price * quantity + (quantity + 1) * price
    let totalPrice = data.totalPrice - price * quantity + (quantity + 1) * price
    await db.collection('cart').updateOne(
      { id: cartCookie, 'lineItems.id': productData.id },
      {
        $set: {
          'lineItems.$.quantity': quantity + 1,
          lineItemsSubtotalPrice: lineItemsSubtotalPrice,
          subtotalPrice: subtotalPrice,
          totalPrice: totalPrice,
        },
      }
    )
    linesObject.quantity = quantity + 1
    linesObject.lineItems = []
    data.lineItems[0].quantity = quantity + 1
    linesObject.lineItemsSubtotalPrice =
      data.lineItemsSubtotalPrice - price * quantity + (quantity + 1) * price
    linesObject.subtotalPrice =
      data.subtotalPrice - price * quantity + (quantity + 1) * price
    linesObject.totalPrice =
      data.totalPrice - price * quantity + (quantity + 1) * price
    ;(linesObject.currency = { code: 'USD' }),
      linesObject.lineItems.push(data.lineItems[0])

    return { data: linesObject, isDuplicate: true }
  }

  cartData.lineItems.push(linesObject)
  cartData.lineItemsSubtotalPrice =
    cartData.lineItemsSubtotalPrice + productData.price.value
  cartData.subtotalPrice = cartData.subtotalPrice + productData.price.value
  cartData.totalPrice = cartData.totalPrice + productData.price.value

  return cartData
}

async function UpdatedCart(cart) {
  let price, qunatity

  for (let i = 0; i < cart.lineItems.length > 0; i++) {
    if (cart.lineItems[i].productId == req.body.itemId) {
      price = cart.lineItems[i].price
      qunatity = cart.lineItems[i].quantity
    }
  }

  let lineItemsSubtotalPrice =
    cart.lineItemsSubtotalPrice -
    price * qunatity +
    req.body.item.quantity * price
  let subtotalPrice =
    cart.subtotalPrice - price * qunatity + req.body.item.quantity * price
  let totalPrice =
    cart.totalPrice - price * qunatity + req.body.item.quantity * price

  await db.collection('cart').updateOne(
    { id: req.body.cartCookie, 'lineItems.id': req.body.itemId },
    {
      $set: {
        'lineItems.$.quantity': req.body.item.quantity,
        lineItemsSubtotalPrice: lineItemsSubtotalPrice,
        subtotalPrice: subtotalPrice,
        totalPrice: totalPrice,
      },
    }
  )
  let data = await db
    .collection('cart')
    .find({ id: req.body.cartCookie })
    .toArray()
  return data
}

module.exports.saveOrder = async function (req, res) {
  console.log('Request body for save order ', req.body)
}

module.exports.razorOrder = async function (req, res) {
  console.log('Request body for razor order ', req.body)
  const db = getDb()
  try {
    if (!req.body.cartCookie) {
      return responseData(res, true, 400, 'No cart cookie')
    }
    console.log('After validation ')
    let data = await db.collection('cart').findOne({ id: req.body.cartCookie })

    const amount = parseInt(data.totalPrice)

    console.log('Data in cart', data, amount)

    if (amount < 1) {
      return responseData(res, true, 400, 'No Product in cart')
    }

    const instance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_SECRET,
    })

    const randomNumber = parseInt(Math.random() * 1000)

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_order_${randomNumber}`,
    }

    const order = await instance.orders.create(options)

    if (!order) return res.status(500).send('Some error occured')

    console.log('Order razory pay', order)

    return responseData(res, true, 200, 'Razor pay order created', order)
  } catch (error) {
    console.log('ERror ', error)
    res.status(500).send(error)
  }
}

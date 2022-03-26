import { fetcher } from './fetcher'
import { handler as useCart } from './cart/use-cart'
import { handler as useAddItem } from './cart/use-add-item'
import { handler as useUpdateItem } from './cart/use-update-item'
import { handler as useRemoveItem } from './cart/use-remove-item'
import { handler as useCustomer } from './customer/use-customer'
import { handler as useSearch } from './product/use-search'
import { handler as useLogin } from './auth/use-login'
import { handler as useLogout } from './auth/use-logout'
import { handler as useAddAddressItem } from './customer/address/use-add-item'
import { handler as useAddCouponsItem } from './customer/coupon/use-add-item'
import { handler as useAddresses } from './customer/address/use-addresses'
import { handler as useCoupons } from './customer/coupon/use-coupons'
import { handler as useSignup } from './auth/use-signup'
import { handler as useCheckout } from './checkout/use-checkout'
import { handler as useSubmitCheckout } from './checkout/use-submit-checkout'

export const localProvider = {
  locale: 'en-us',
  cartCookie: 'session',
  fetcher: fetcher,
  cart: { useCart, useAddItem, useUpdateItem, useRemoveItem },
  customer: { useCustomer,
     address: {
      useAddresses,
    useAddItem: useAddAddressItem,
  },
coupon: {
  useCoupons,
    useAddItem: useAddCouponsItem,
} },
  products: { useSearch },
  auth: { useLogin, useLogout, useSignup },
  checkout :{  useCheckout , useSubmitCheckout}
}

export type LocalProvider = typeof localProvider

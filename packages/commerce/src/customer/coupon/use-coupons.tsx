import type { SWRHook, HookFetcherFn } from '../../utils/types'
import type { GetCouponHook } from '../../types/customer/coupon'

import Cookies from 'js-cookie'

import { useHook, useSWRHook } from '../../utils/use-hook'
import { Provider, useCommerce } from '../..'

export type UseCoupons<
  H extends SWRHook<GetCouponHook<any>> = SWRHook<GetCouponHook>
> = ReturnType<H['useHook']>

export const fetcher: HookFetcherFn<GetCouponHook> = async ({
  options,
  input: { cartId },
  fetch,
}) => {
  return cartId ? await fetch(options) : null
}

const fn = (provider: Provider) => provider.customer?.coupon?.useCoupons!

const useCoupons: UseCoupons = (input) => {
  const hook = useHook(fn)
  const { cartCookie } = useCommerce()
  const fetcherFn = hook.fetcher ?? fetcher
  const wrapper: typeof fetcher = (context) => {
    context.input.cartId = Cookies.get(cartCookie)
    return fetcherFn(context)
  }
  return useSWRHook({ ...hook, fetcher: wrapper })(input)
}

export default useCoupons

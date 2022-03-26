import type { GetCouponHook } from '@vercel/commerce/types/customer/coupon'

import { useMemo } from 'react'
import { SWRHook } from '@vercel/commerce/utils/types'
import useCoupons, {
  UseCoupons,
} from '@vercel/commerce/customer/coupon/use-coupons'
import Cookies from 'js-cookie';
const HOST_NAME = "http://localhost:5120"

export default useCoupons as UseCoupons<typeof handler>

export const handler: SWRHook<GetCouponHook> = {
  fetchOptions: {
    url: `${HOST_NAME}/api/backend/customer/getCoupon`,
    method: 'POST',
  },
  async fetcher({ options, fetch }) {
    let userCookie = Cookies.get("anoynmusUserCookie");
    return  await fetch({
       ...options ,
       body: { userCookie}
    })
    
  },
  useHook: ({ useData }) =>
    function useHook(input) {
      const response = useData({
        swrOptions: { revalidateOnFocus: false, ...input?.swrOptions },
      })

      return useMemo(
        () =>
          Object.create(response, {
            isEmpty: {
              get() {
                return (response.data?.length ?? 0) <= 0
              },
              enumerable: true,
            },
          }),
        [response]
      )
    },
}

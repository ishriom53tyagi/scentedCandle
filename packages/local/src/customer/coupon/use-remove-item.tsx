import useRemoveItem, {
    UseRemoveItem,
  } from '@vercel/commerce/customer/coupon/use-remove-item'
  import type { RemoveItemHook } from '@vercel/commerce/types/customer/coupon'
  
  import { MutationHook } from '@vercel/commerce/utils/types'
  import { useCallback } from 'react'
  import Cookies from 'js-cookie';
  import useCoupons from './use-coupons'
  const HOST_NAME = "http://localhost:5120"
  
  export default useRemoveItem as UseRemoveItem<typeof handler>
  
  export const handler: MutationHook<RemoveItemHook> = {
    fetchOptions: {
      url: `${HOST_NAME}/api/backend/customer/deleteCoupon`,
      method: 'POST',
    },
    async fetcher({ options, fetch }) {
      let userCookie = Cookies.get("anoynmusUserCookie");
      let cartCookie = Cookies.get("cartCookie");
      const data = await fetch({
        ...options,
        body: { userCookie, cartCookie },
      })
  
      return data
    },
    useHook: ({ fetch }) =>
      function useHook() {
        const { mutate } = useCoupons()
        return useCallback(
          async function addItem() {
            console.log("Inputs for delete form ");
            const data = await fetch()
            if(data) {
              await mutate([data], false)
            }
  
            return data
          },
          [fetch]
        )
      },
  }
  
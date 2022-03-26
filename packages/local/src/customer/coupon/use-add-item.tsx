import useAddItem, {
  UseAddItem,
} from '@vercel/commerce/customer/coupon/use-add-item'
import type { AddItemHook } from '@vercel/commerce/types/customer/coupon'

import { MutationHook } from '@vercel/commerce/utils/types'
import { useCallback } from 'react'
import Cookies from 'js-cookie';
import useCoupons from './use-coupons'
const HOST_NAME = "http://localhost:5120"

export default useAddItem as UseAddItem<typeof handler>

export const handler: MutationHook<AddItemHook> = {
  fetchOptions: {
    url: `${HOST_NAME}/api/backend/customer/addcoupons`,
    method: 'POST',
  },
  async fetcher({ input: item, options, fetch }) {
    let userCookie = Cookies.get("anoynmusUserCookie");
    const data = await fetch({
      ...options,
      body: { item, userCookie },
    })

    return data
  },
  useHook: ({ fetch }) =>
    function useHook() {
      const { mutate } = useCoupons()
      return useCallback(
        async function addItem(input) {
          console.log("Inputs for form ",input);
          const data = await fetch({ input })
          if(data) {
            await mutate([data], false)
          }

          return data
        },
        [fetch]
      )
    },
}

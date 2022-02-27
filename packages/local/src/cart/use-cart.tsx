import { useMemo } from 'react'
import { SWRHook } from '@vercel/commerce/utils/types'
import useCart, { UseCart } from '@vercel/commerce/cart/use-cart'
import Cookies from "js-cookie"

export default useCart as UseCart<typeof handler>

export const handler: SWRHook<any> = {
  fetchOptions: {
    method: 'POST',
    url:  'http://localhost:5120/api/backend/cartDetails',
  },
  async fetcher({ options, fetch }) {
    let cartCookie = Cookies.get("cartCookie");
    return  await fetch({
       ...options ,
       body: { cartCookie}
    })
    // return {
    //   id: 'Z2lkOi8vc2hvcGlmeS9Qcm9ksdWN0LzU0NDczMjUwMjQ0MjA=',
    //   createdAt: '',
    //   currency: { code: '' },
    //   taxesIncluded: '',
    //   lineItems: [], 
    //   lineItemsSubtotalPrice: '',
    //   subtotalPrice: 0,
    //   totalPrice: 0,
    // }
    
  },
  useHook:
    ({ useData }) =>
    (input) => {
      const response = useData({
        swrOptions: { revalidateOnFocus: false, ...input?.swrOptions },
      })
      return useMemo(
        () =>
          Object.create(response, {
            isEmpty: {
              get() {
                 return (response.data?.lineItems.length ?? 0) <= 0
              },
              enumerable: true,
            },
          }),
        [response]
      )
    },
}

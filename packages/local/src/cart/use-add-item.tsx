import useAddItem, { UseAddItem } from '@vercel/commerce/cart/use-add-item'
import { MutationHook } from '@vercel/commerce/utils/types'
import { useCallback } from 'react';
import useCart from './use-cart';
import Cookies from "js-cookie"
// const HOST_NAME = "http://localhost:5120";
import  host from '../serverConfiguration.json'

export default useAddItem as UseAddItem<typeof handler>
export const handler: MutationHook<any> = {
  fetchOptions: {
    url: `${host.HOST_NAME}/api/backend/cart`,
    method: 'POST',
  },
  async fetcher({ input: item, options, fetch }) {
    let cartCookie = Cookies.get("cartCookie");
    
    const data = await fetch({
      ...options,
      body: { item , cartCookie},
    })
   return data;
  },
  useHook:
    ({ fetch }) =>
    () => {
      const { mutate } = useCart();
      return useCallback(
        async function addItem(input) {
          const data = await fetch({ input })
     
          await mutate(data, false)
          return data
        },
        [fetch, mutate]
      )
    },
}

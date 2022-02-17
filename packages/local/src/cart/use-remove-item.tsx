import { MutationHook } from '@vercel/commerce/utils/types'
import { useCallback } from 'react';
import useRemoveItem, {
  UseRemoveItem,
} from '@vercel/commerce/cart/use-remove-item'
import useCart from './use-cart';

export default useRemoveItem as UseRemoveItem<typeof handler>

export const handler: MutationHook<any> = {
  fetchOptions: {
    url: 'http://localhost:5120/api/backend/deleteCart',
    method: 'POST',
  },
  async fetcher({ input: item, options, fetch }) {
    const data = await fetch({
      ...options,
      body: { item },
    })
  },
  useHook:
    ({ fetch }) =>
    () => {
      const { mutate } = useCart();
      return useCallback(
        async function addItem(input) {
          const data = await fetch({ input })
          console.log("DATa",data, input);
          await mutate(data, false)
          return data
        },
        [fetch, mutate]
      )
    },
}

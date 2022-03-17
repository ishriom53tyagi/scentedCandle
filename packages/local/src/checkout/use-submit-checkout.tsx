import type { SubmitCheckoutHook } from '@vercel/commerce/types/checkout'
import type { MutationHook } from '@vercel/commerce/utils/types'

import { useCallback } from 'react'
import useSubmitCheckout, {
  UseSubmitCheckout,
} from '@vercel/commerce/checkout/use-submit-checkout'
import Cookie from 'js-cookie';
const HOST_NAME = "http://localhost:5120";

export default useSubmitCheckout as UseSubmitCheckout<typeof handler>

export const handler: MutationHook<any> = {
  fetchOptions: {
    url: `${HOST_NAME}/api/backend/submit/checkout`,
    method: 'POST',
  },
  async fetcher({ input: item, options, fetch }) {
    const cartCookie = Cookie.get('cartCookie');
    const userCookie = Cookie.get('anoynmusUserCookie');
    console.log("Cart cookies ",cartCookie, userCookie, item);
    const data = await fetch({
      ...options,
      body: { item, cartCookie, userCookie },
    })
    console.log("After submit data",data);
    return data
  },
  useHook: ({ fetch }) =>
    function useHook() {
      return useCallback(
        async function onSubmitCheckout(input) {
          console.log("Before submit checkout callback");
          const data = await fetch({ input })
          console.log("After submit checkout callback",data);
          return data
        },
        [fetch]
      )
    },
}

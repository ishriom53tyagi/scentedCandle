import type { GetCheckoutHook } from '@vercel/commerce/types/checkout'

import { useMemo } from 'react'
import { SWRHook } from '@vercel/commerce/utils/types'
import useCheckout, { UseCheckout } from '@vercel/commerce/checkout/use-checkout'
import useSubmitCheckout from './use-submit-checkout'
const HOST_NAME = "http://localhost:5120"

export default useCheckout as UseCheckout<typeof handler>

export const handler: SWRHook<GetCheckoutHook> = {
  fetchOptions: {
    url: `${HOST_NAME}/api/backend/checkout`,
    method: 'GET',
  },
  useHook: ({ useData }) =>
    function useHook(input) {
      const submit = useSubmitCheckout()
      const response = useData({
        swrOptions: { revalidateOnFocus: false, ...input?.swrOptions },
      })
      return useMemo(
        () =>
          Object.create(response, {
            isEmpty: {
              get() {
                return (response.data?.lineItems?.length ?? 0) <= 0
              },
              enumerable: true,
            },
            submit: {
              get() {
                return submit
                
              },
              enumerable: true,
            },
          }),
         
        [response, submit]
      )
    },
}
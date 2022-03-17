import type { GetAddressesHook } from '@vercel/commerce/types/customer/address'

import { useMemo } from 'react'
import { SWRHook } from '@vercel/commerce/utils/types'
import useAddresses, {
  UseAddresses,
} from '@vercel/commerce/customer/address/use-addresses'
import Cookies from 'js-cookie';
const HOST_NAME = "http://localhost:5120"

export default useAddresses as UseAddresses<typeof handler>

export const handler: SWRHook<GetAddressesHook> = {
  fetchOptions: {
    url: `${HOST_NAME}/api/backend/customer/getAddress`,
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

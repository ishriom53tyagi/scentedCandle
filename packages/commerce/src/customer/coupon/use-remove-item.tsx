import type { HookFetcherFn, MutationHook } from '../../utils/types'
import type { RemoveItemHook } from '../../types/customer/coupon'
import type { Provider } from '../..'

import { useHook, useMutationHook } from '../../utils/use-hook'
import { mutationFetcher } from '../../utils/default-fetcher'

export type UseRemoveItem<
  H extends MutationHook<RemoveItemHook<any>> = MutationHook<RemoveItemHook>
> = ReturnType<H['useHook']>

export const fetcher: HookFetcherFn<RemoveItemHook> = mutationFetcher

const fn = (provider: Provider) => provider.customer?.coupon?.useRemoveItem!

const useRemoveItem: UseRemoveItem = () => {
  const hook = useHook(fn)
  return useMutationHook({ fetcher, ...hook })()
}

export default useRemoveItem

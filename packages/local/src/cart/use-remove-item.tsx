import { useCallback } from 'react'
import type {
  MutationHookContext,
  HookFetcherContext,
} from '@vercel/commerce/utils/types'
import { ValidationError } from '@vercel/commerce/utils/errors'
import useRemoveItem, { UseRemoveItem } from '@vercel/commerce/cart/use-remove-item'
import type { Cart, LineItem, RemoveItemHook } from '@vercel/commerce/types/cart'
import useCart from './use-cart'
import Cookies from "js-cookie"

export type RemoveItemFn<T = any> = T extends LineItem
  ? (input?: RemoveItemActionInput<T>) => Promise<Cart | null | undefined>
  : (input: RemoveItemActionInput<T>) => Promise<Cart | null>

export type RemoveItemActionInput<T = any> = T extends LineItem
  ? Partial<RemoveItemHook['actionInput']>
  : RemoveItemHook['actionInput']

export default useRemoveItem as UseRemoveItem<typeof handler>

export const handler = {
  fetchOptions: {
    url: 'http://localhost:5120/api/backend/deleteCart',
    method: 'POST',
  },
  async fetcher({
    input: { itemId },
    options,
    fetch,
  }: HookFetcherContext<RemoveItemHook>) {
    let cartCookie = Cookies.get("cartCookie");
    return await fetch({ ...options, body: { itemId ,cartCookie } })
  },
  useHook: ({ fetch }: MutationHookContext<RemoveItemHook>) => <
    T extends LineItem | undefined = undefined
  >(
    ctx: { item?: T } = {}
  ) => {
    const { item } = ctx
    const { mutate } = useCart()
    const removeItem: RemoveItemFn<LineItem> = async (input) => {
      const itemId = input?.id ?? item?.id

      if (!itemId) {
        throw new ValidationError({
          message: 'Invalid input used for this operation',
        })
      }

      const data = await fetch({ input: { itemId } })
     
      const tempData = data && Object.keys(data).length == 0 ?null:data;
      await mutate(tempData, false)
      return tempData
    }

    return useCallback(removeItem as RemoveItemFn<T>, [fetch, mutate])
  },
}

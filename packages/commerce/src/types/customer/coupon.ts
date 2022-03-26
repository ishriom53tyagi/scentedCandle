export interface Coupon {
  id: string
  mask: string
  provider: string
}

export interface CouponFields {
  couponString: string
}

export type CustomerCouponTypes = {
  coupon?: Coupon
  fields: CouponFields
}

export type GetCouponHook<T extends CustomerCouponTypes = CustomerCouponTypes> = {
  data: T['coupon'][] | null
  input: {}
  fetcherInput: { cartId?: string }
  swrState: { isEmpty: boolean }
}

export type AddItemHook<T extends CustomerCouponTypes = CustomerCouponTypes> = {
  data: T['coupon']
  input?: T['fields']
  fetcherInput: T['fields']
  body: { item: T['fields'] }
  actionInput: T['fields']
}

export type UpdateItemHook<T extends CustomerCouponTypes = CustomerCouponTypes> = {
  data: T['coupon'] | null
  input: { item?: T['fields']; wait?: number }
  fetcherInput: { itemId: string; item: T['fields'] }
  body: { itemId: string; item: T['fields'] }
  actionInput: T['fields'] & { id: string }
}

export type RemoveItemHook<T extends CustomerCouponTypes = CustomerCouponTypes> = {
  data: T['coupon'] | null
  input: { item?: T['coupon'] }
  fetcherInput: { itemId: string }
  body: { itemId: string }
  actionInput: { id: string }
}

export type CustomerCouponHooks<T extends CustomerCouponTypes = CustomerCouponTypes> =
  {
    getCoupons: GetCouponHook<T>
    addItem: AddItemHook<T>
    updateItem: UpdateItemHook<T>
    removeItem: RemoveItemHook<T>
  }

export type CouponsHandler<T extends CustomerCouponTypes = CustomerCouponTypes> =
  GetCouponHook<T> & {
    body: { cartId?: string }
  }

export type AddItemHandler<T extends CustomerCouponTypes = CustomerCouponTypes> =
  AddItemHook<T> & {
    body: { cartId: string }
  }

export type UpdateItemHandler<T extends CustomerCouponTypes = CustomerCouponTypes> =
  UpdateItemHook<T> & {
    data: T['coupon']
    body: { cartId: string }
  }

export type RemoveItemHandler<T extends CustomerCouponTypes = CustomerCouponTypes> =
  RemoveItemHook<T> & {
    body: { cartId: string }
  }

export type CustomerCouponHandlers<
  T extends CustomerCouponTypes = CustomerCouponTypes
> = {
  getCoupons: GetCouponHook<T>
  addItem: AddItemHandler<T>
  updateItem: UpdateItemHandler<T>
  removeItem: RemoveItemHandler<T>
}

export type CustomerCouponSchema<
  T extends CustomerCouponTypes = CustomerCouponTypes
> = {
  endpoint: {
    options: {}
    handlers: CustomerCouponHandlers<T>
  }
}

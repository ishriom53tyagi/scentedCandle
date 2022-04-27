import React, {
  FC,
  useCallback,
  useMemo,
  useReducer,
  useContext,
  createContext,
} from 'react'
import type { CouponFields } from '@commerce/types/customer/coupon'
import type { AddressFields } from '@commerce/types/customer/address'

export type State = {
  couponFields: CouponFields
  addressFields: AddressFields
}

type CheckoutContextType = State & {
  setCouponFields: (couponFields: CouponFields) => void
  setAddressFields: (addressFields: AddressFields) => void
  clearCheckoutFields: () => void
}

type Action =
  | {
      type: 'SET_COUPON_FIELDS'
      coupon: CouponFields
    }
  | {
      type: 'SET_ADDRESS_FIELDS'
      address: AddressFields
    }
  | {
      type: 'CLEAR_CHECKOUT_FIELDS'
    }

const initialState: State = {
  couponFields: {} as CouponFields,
  addressFields: {} as AddressFields,
}

export const CheckoutContext = createContext<State | any>(initialState)

CheckoutContext.displayName = 'CheckoutContext'

const checkoutReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_COUPON_FIELDS':
      return {
        ...state,
        couponFields: action.coupon,
      }
    case 'SET_ADDRESS_FIELDS':
      return {
        ...state,
        addressFields: action.address,
      }
    case 'CLEAR_CHECKOUT_FIELDS':
      return {
        ...state,
        couponFields: initialState.couponFields,
        addressFields: initialState.addressFields,
      }
    default:
      return state
  }
}

export const CheckoutProvider: FC = (props) => {
  const [state, dispatch] = useReducer(checkoutReducer, initialState)

  const setCouponFields = useCallback(
    (coupon: CouponFields) => dispatch({ type: 'SET_COUPON_FIELDS', coupon }),
    [dispatch]
  )

  const setAddressFields = useCallback(
    (address: AddressFields) =>
      dispatch({ type: 'SET_ADDRESS_FIELDS', address }),
    [dispatch]
  )

  const clearCheckoutFields = useCallback(
    () => dispatch({ type: 'CLEAR_CHECKOUT_FIELDS' }),
    [dispatch]
  )

  const couponFields = useMemo(() => state.couponFields, [state.couponFields])

  const addressFields = useMemo(() => state.addressFields, [state.addressFields])

  const value = useMemo(
    () => ({
      couponFields,
      addressFields,
      setCouponFields,
      setAddressFields,
      clearCheckoutFields,
    }),
    [couponFields, addressFields, setCouponFields, setAddressFields, clearCheckoutFields]
  )

  return <CheckoutContext.Provider value={value} {...props} />
}

export const useCheckoutContext = () => {
  const context = useContext<CheckoutContextType>(CheckoutContext)
  if (context === undefined) {
    throw new Error(`useCheckoutContext must be used within a CheckoutProvider`)
  }
  return context
}

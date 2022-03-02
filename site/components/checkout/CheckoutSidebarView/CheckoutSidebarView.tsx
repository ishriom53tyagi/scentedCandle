import Link from 'next/link'
import { FC, useState } from 'react'
import CartItem from '@components/cart/CartItem'
import { Button, Text } from '@components/ui'
import { useUI } from '@components/ui/context'
import SidebarLayout from '@components/common/SidebarLayout'
import useCart from '@framework/cart/use-cart'
import usePrice from '@framework/product/use-price'
import useCheckout from '@framework/checkout/use-checkout'
import useAddresses from '@framework/customer/address/use-addresses'

import ShippingWidget from '../ShippingWidget'
import PaymentWidget from '../PaymentWidget'
import s from './CheckoutSidebarView.module.css'
import { useCheckoutContext } from '../context'

const CheckoutSidebarView: FC = () => {
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const { setSidebarView, closeSidebar } = useUI()
  const [checked, setChecked] = useState("");
  const { data: cartData, mutate: refreshCart } = useCart()
  const { data: checkoutData, submit: onCheckout } = useCheckout()
  const { data: addressData, isLoading, error } = useAddresses();

  const { clearCheckoutFields } = useCheckoutContext()

  async function handleSubmit(event: React.ChangeEvent<HTMLFormElement>) {
    try {
      setLoadingSubmit(true)
      event.preventDefault()

      await onCheckout({ type: checked })
      clearCheckoutFields()
      setLoadingSubmit(false)
      refreshCart()
      closeSidebar()
    } catch {
      // TODO - handle error UI here.
      setLoadingSubmit(false)
    }
  }

  const handleCheckChange = (e: any) => {
    console.log("Values return",e);
    setChecked(e.target.value);
  }
  const { price: subTotal } = usePrice(
    cartData && {
      amount: Number(cartData.subtotalPrice),
      currencyCode: cartData.currency.code,
    }
  )
  const { price: total } = usePrice(
    cartData && {
      amount: Number(cartData.totalPrice),
      currencyCode: cartData.currency.code,
    }
  )

  return (
    <SidebarLayout
      className={s.root}
      handleBack={() => setSidebarView('CART_VIEW')}
    >
      <div className="px-4 sm:px-6 flex-1">
        <Link href="/cart">
          <a>
            <Text variant="sectionHeading">Checkout</Text>
          </a>
        </Link>

        {/* <PaymentWidget
          // isValid={checkoutData?.hasPayment}
          isValid={true}
          onClick={() => setSidebarView('PAYMENT_VIEW')}
        /> */}
        <ShippingWidget
          isValid={addressData && addressData.length > 0? true: false}
          onClick={() => setSidebarView('SHIPPING_VIEW')}
          data={addressData && addressData.length > 0? addressData[0]: null}
        />

        <ul className={s.lineItemsList}>
          {cartData!.lineItems.map((item: any) => (
            <CartItem
              key={item.id}
              item={item}
              currencyCode={cartData!.currency.code}
              variant="display"
            />
          ))}
        </ul>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 px-6 py-6 sm:px-6 sticky z-20 bottom-0 w-full right-0 left-0 bg-accent-0 border-t text-sm"
      >
        <ul className="pb-2">
          <li className="flex justify-between py-1">
            <span>Subtotal</span>
            <span>{subTotal}</span>
          </li>
          <li className="flex justify-between py-1">
            <span>Taxes</span>
            <span>Calculated at checkout</span>
          </li>
          <li className="flex justify-between py-1">
            <span>Shipping</span>
            <span className="font-bold tracking-wide">FREE</span>
          </li>
        </ul>
        <div className="flex justify-between border-t border-accent-2 py-3 font-bold mb-2">
          <span>Total</span>
          <span>{total}</span>
        </div>
        <div className="radio m-2 mx-0">
          <label>
            <input
              type="radio"
              value="COD"
              className='mr-2'
              checked={checked === "COD"}
              onChange={handleCheckChange}
            />
            Cash On Delivery
          </label>
        </div>
        <div className="radio m-2 mx-0">
          <label>
            <input
              type="radio"
              value="RazorPay"
              className='mr-2'
              checked={checked === "RazorPay"}
              onChange={handleCheckChange}
            />
            Online Payment with credit/debit card, UPI and net banking
          </label>
        </div>
        <div>
          {/* Once data is correctly filled */}
          <Button
            type="submit"
            width="100%"
            disabled={!addressData || !checked}
            loading={loadingSubmit}
          >
            Confirm Purchase
          </Button>
        </div>
      </form>
    </SidebarLayout>
  )
}

export default CheckoutSidebarView

import { FC } from 'react'
import cn from 'classnames'

import Button from '@components/ui/Button'
import { useUI } from '@components/ui/context'
import SidebarLayout from '@components/common/SidebarLayout'
import useAddAddress from '@framework/customer/address/use-add-item'
import useAddresses from '@framework/customer/address/use-addresses'

import s from './ShippingView.module.css'

interface Form extends HTMLFormElement {
  cardHolder: HTMLInputElement
  cardNumber: HTMLInputElement
  cardExpireDate: HTMLInputElement
  cardCvc: HTMLInputElement
  firstName: HTMLInputElement
  lastName: HTMLInputElement
  company: HTMLInputElement
  streetNumber: HTMLInputElement
  zipCode: HTMLInputElement
  city: HTMLInputElement
  country: HTMLSelectElement
}

const ShippingView: FC = () => {
  const { setSidebarView } = useUI()
  const addAddress = useAddAddress()
  const { data: addressData, isLoading, error } = useAddresses();

  async function handleSubmit(event: React.ChangeEvent<Form>) {
    event.preventDefault()

      await addAddress({
        type: event.target.type.value,
        firstName: event.target.firstName.value,
        lastName: event.target.lastName.value,
        phone: event.target.phone.value,
        email: event.target.email.value,
        streetNumber: event.target.streetNumber.value,
        apartments: event.target.apartments.value,
        zipCode: event.target.zipCode.value,
        city: event.target.city.value,
        country: event.target.country.value,
      })

    setSidebarView('CHECKOUT_VIEW')
  }

  return (
    <form className="h-full" onSubmit={handleSubmit}>
      <SidebarLayout handleBack={() => setSidebarView('CHECKOUT_VIEW')}>
        <div className="px-4 sm:px-6 flex-1">
          <h2 className="pt-1 pb-8 text-2xl font-semibold tracking-wide cursor-pointer inline-block">
            Shipping
          </h2>
          <div>
            <div className="flex flex-row my-3 items-center">
              <input name="type" className={s.radio} type="radio" />
              <span className="ml-3 text-sm">Same as billing address</span>
            </div>
            <div className="flex flex-row my-3 items-center">
              <input name="type" className={s.radio} type="radio" />
              <span className="ml-3 text-sm">
                Use a different shipping address
              </span>
            </div>
            <hr className="border-accent-2 my-6" />
            <div className="grid gap-3 grid-flow-row grid-cols-12">
              <div className={cn(s.fieldset, 'col-span-6')}>
                <label className={s.label}>First Name</label>
                <input name="firstName" className={s.input} defaultValue={addressData && addressData.length > 0 ? addressData[0].firstName:""} required/>
              </div>
              <div className={cn(s.fieldset, 'col-span-6')}>
                <label className={s.label}>Last Name</label>
                <input name="lastName" className={s.input} defaultValue={addressData && addressData.length > 0 ? addressData[0].lastName:""} required/>
              </div>
            </div>
            <div className={s.fieldset}>
              <label className={s.label}>Phone Number</label>
              <input name="phone" className={s.input} defaultValue={addressData && addressData.length > 0 ? addressData[0].phone:""} />
            </div>
            <div className={s.fieldset}>
              <label className={s.label}>Email</label>
              <input name="email" className={s.input} defaultValue={addressData && addressData.length > 0 ? addressData[0].email:""} />
            </div>
            <div className={s.fieldset}>
              <label className={s.label}>Street and House Number</label>
              <input name="streetNumber" className={s.input} defaultValue={addressData && addressData.length > 0 ? addressData[0].streetNumber:""} required/>
            </div>
            <div className={s.fieldset}>
              <label className={s.label}>
                Apartment, Suite, Etc. (Optional)
              </label>
              <input name="apartments" className={s.input} defaultValue={addressData && addressData.length > 0 ? addressData[0].apartments:""} />
            </div>
            <div className="grid gap-3 grid-flow-row grid-cols-12">
              <div className={cn(s.fieldset, 'col-span-6')}>
                <label className={s.label}>Postal Code</label>
                <input name="zipCode" className={s.input} defaultValue={addressData && addressData.length > 0 ? addressData[0].zipCode:""} required/>
              </div>
              <div className={cn(s.fieldset, 'col-span-6')}>
                <label className={s.label}>City</label>
                <input name="city" className={s.input} defaultValue={addressData && addressData.length > 0 ? addressData[0].city:""} required/>
              </div>
            </div>
            <div className={s.fieldset}>
              <label className={s.label}>Country/Region</label>
              <select name="country" className={s.select} defaultValue={addressData && addressData.length > 0 ? addressData[0].country:""} required>
                <option>India</option>
              </select>
            </div>
          </div>
        </div>
        <div className="sticky z-20 bottom-0 w-full right-0 left-0 py-12 bg-accent-0 border-t border-accent-2 px-6">
          <Button type="submit" width="100%" variant="ghost">
            Continue
          </Button>
        </div>
      </SidebarLayout>
    </form>
  )
}

export default ShippingView

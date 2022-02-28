import { FC } from 'react'
import s from './ShippingWidget.module.css'
import { ChevronRight, MapPin, Check } from '@components/icons'
import cn from 'classnames'

interface ComponentProps {
  onClick?: () => any
  isValid?: boolean,
  data?: any
}

const ShippingWidget: FC<ComponentProps> = ({ onClick, isValid, data }) => {
  /* Shipping Address
  Only available with checkout set to true -
  This means that the provider does offer checkout functionality. */
  return (
    <div onClick={onClick} className={s.root}>
      <div className="flex flex-1 items-center">
        <MapPin className="w-5 flex" /> 
        {data? <span className='text-left ml-3'>
          <strong>{`${data.firstName} ${data.lastName}`}</strong> {`, ${data.company? `(${data.company})`: ""}`} <br></br>
          {`${data.streetNumber} ${data.apartments},`} <br />
          {`${data.city}, ${data.zipCode}`} <br />
          {`${data.country}`}
        </span>: 
        <span className="ml-5 text-sm text-center font-medium">
          Add Shipping Address
        </span>}
        
        
      </div>
      <div>{isValid ? <Check /> : <ChevronRight />}</div>
    </div>
  )
}

export default ShippingWidget

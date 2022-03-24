import { FC, useState } from 'react'
import s from './Coupon.module.css'
import cn from 'classnames'
import CouponView from './CouponView'

interface ComponentProps {
  onClick?: () => any
  isValid?: boolean,
  data?: any
}

const Coupon: FC<ComponentProps> = ({ onClick, isValid, data }) => {
  /* Shipping Address className={s.root}
  Only available with checkout set to true -
  This means that the provider does offer checkout functionality. */

  const [toggle, setToggle] = useState(false)

  const toggleHandle = () => {
    setToggle(!toggle)
  }

  return (
    <>
      <button onClick={toggleHandle} style={{ marginBottom: '12px', textDecoration: 'underline', textUnderlinePosition: 'under' }}>Apply Coupon</button>
      {
        toggle &&
        <div className="flex flex-1 items-center">
          <CouponView />
        </div>
      }
    </>
  )
}

export default Coupon

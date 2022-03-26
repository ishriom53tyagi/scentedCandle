import s from './Coupon.module.css'
import cn from 'classnames'
import useAddCoupons from '@framework/customer/coupon/use-add-item'

interface Form extends HTMLFormElement {
    couponString: HTMLInputElement
  }

const CouponView = () => {

    const addCoupon = useAddCoupons();
    async function handleSubmit(event: React.ChangeEvent<Form>) {
        event.preventDefault()
          await addCoupon({
            couponString: event.target.couponString.value,
          })
    
      }
    return (
        <form className="h-full w-full" onSubmit={handleSubmit}>
            <div className={cn(s.fieldset, 'col-span-6')} style={{display:'flex', alignItems: 'center', justifyContent: 'center'}}>
                <input name='couponString' placeholder='Enter Coupon' style={{width: '90%', padding: '10px', borderBottom: '1px solid #000', outline:'none' }} />
                <button type='submit' style={{ width: "15%", border:'none', margin: '10px 25px', textAlign: 'center', textDecoration:'none', display: 'inline-block', fontSize: '15px'}}>Apply</button>
            </div>
        </form>
    )
}

export default CouponView
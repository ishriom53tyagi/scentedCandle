import s from './Coupon.module.css'
import cn from 'classnames'
import { Check, Trash } from '@components/icons';
import useAddCoupons from '@framework/customer/coupon/use-add-item'
import useRemoveItem from '@framework/customer/coupon/use-remove-item'
import getCoupons from '@framework/customer/coupon/use-coupons';
import React, { FC } from 'react';

interface Form extends HTMLFormElement {
    couponString: HTMLInputElement
  }

const CouponView: FC = () => {


    const addCoupon = useAddCoupons();
    const removeCoupon = useRemoveItem();
    const {data } = getCoupons();
    async function handleSubmit(event: React.ChangeEvent<Form>) {
        event.preventDefault()
          await addCoupon({
            couponString: event.target.couponString.value,
          })
    
      }
      const onDelete = async () => {
        await removeCoupon();
      }
    console.log("Data Coupon",data);
    return (
      <>
      { data && data[0] && data[0].coupon ? <div className={"h-full w-full"}>
      <div className="flex flex-1 items-center">
        <Check className="w-5 flex" /> 
      <span className='ml-3'>{data[0].coupon}</span>

      <button className='ml-auto'  onClick={onDelete}>
        <Trash  />
      </button>
    </div>
    </div>:  <form className="h-full w-full" onSubmit={handleSubmit}>
            <div className={cn(s.fieldset, 'col-span-6')} style={{display:'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <input name='couponString' placeholder='Enter Coupon' style={{width: '70%', padding: '10px', borderBottom: '1px solid #000', outline:'none' }} />
                <button type='submit' style={{ width: "25%", border:'1px solid #000', color: "#fff",backgroundColor: "#000", padding: '6px 8px', textAlign: 'center', textDecoration:'none', display: 'inline-block', fontSize: '15px'}}>Apply</button>
            </div>
            { data && data[0] && data[0].error ? <h4 className='mt-2' style={{ textAlign: "left", color: "red"}}>{data[0].error}</h4>:""}
        </form>
        }
       
      </>
    )
}

export default CouponView
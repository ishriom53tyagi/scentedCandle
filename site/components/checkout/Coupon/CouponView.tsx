import s from './Coupon.module.css'
import cn from 'classnames'

const CouponView = () => {
    return (
        <>
            <div className={cn(s.fieldset, 'col-span-6')} style={{display:'flex', alignItems: 'center', justifyContent: 'center'}}>
                <input placeholder='Enter Coupon' style={{width: '80%', padding: '10px', border: '1px solid #000', outline:'none' }} />
                <button style={{backgroundColor: '#fff', color: '#000', border:'none', padding: '10px 25px', textAlign: 'center', textDecoration:'none', display: 'inline-block', fontSize: '15px'}}>Apply</button>
            </div>
        </>
    )
}

export default CouponView
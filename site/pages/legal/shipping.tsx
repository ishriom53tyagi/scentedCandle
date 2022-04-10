import { Text } from '@components/ui'
import { Footer } from '@components/common'

export default function NotFound() {
    return (
        <div>
         <div className="max-w-2xl mx-8 sm:mx-auto py-20 flex flex-col items-center justify-center fit">
        <Text variant="heading">Shipping Policy</Text>
        <Text className="">
        <p>findmygift is a marketplace for users to buy and sell sneakers. findmygift verifies every pair of sneakers to make sure they’re authentic and live up to their product description.</p>
        <p>The shipping experience for findmygift is unique — their verification process requires sellers to ship packages to findmygift warehouses before they get sent to buyers. Given that, they clearly describe the entire process in their FAQs to explain the slower delivery times.</p>
        <p><strong>When will I receive my order ?</strong></p>
        <p>since all gift come to us , it typically takes 7-9 business days for order to get to our domestic customers.As soon as your order is authneticated we will ship then out to you and send you a link to track your pacakage.</p>
        <p><strong>How much does shipping cost ?</strong></p>
        <p>Shipping cost will be calculated at the time of checkout.</p>
        </Text>
      </div>
     <Footer/>  
    </div>
    )
  }
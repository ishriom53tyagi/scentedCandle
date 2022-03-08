import { Text } from '@components/ui'
import Check from '@components/common/Check'
import { Footer } from '@components/common'
import { Button } from '@components/ui'
import Link from 'next/link'
export default function OrderSuccess() {
    return (
      <div>
        <div className="max-w-2xl mx-8 sm:mx-auto py-20 flex flex-col items-center justify-center fit">
        <Check />
        <Text className='text-success' variant="heading">Order Success</Text>
        <Text className="">
          You will receive an email shortly with all the details.
        </Text>
        <Button className='mt-4'><Link href={"/"}>Back to Shopping</Link></Button>
      </div>
        <Footer />
      </div>
    )
  }
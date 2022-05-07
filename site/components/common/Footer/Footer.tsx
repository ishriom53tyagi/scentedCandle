import { FC } from 'react'
import cn from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { Page } from '@commerce/types/page'
import getSlug from '@lib/get-slug'
import { Instagram,  Facebook, Visa, Paytm, Rupay , Pinterest } from '@components/icons'
import { Logo, Container } from '@components/ui'
import s from './Footer.module.css'

interface Props {
  className?: string
  children?: any
  pages?: Page[]
}

const links = [
  {
    name: 'Home',
    url: '/',
  },
  {
    name: 'About Us',
    url: '/legal/about',
  } ,
  {
    name: 'Contact Us',
    url: '/legal/contact',
  } ,
  {
    name: 'Terms of Service',
    url: '/legal/terms',
  },
  {
    name: 'Privacy Policy',
    url: '/legal/privacy',
  },
  {
    name: 'Shipping & Payment',
    url: '/legal/shipping',
  }
]

const Footer: FC<Props> = ({ className, pages }) => {
  const { sitePages } = usePages(pages)
  const rootClassName = cn(s.root, className)

  return (
    <footer className={rootClassName}>
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-accent-2 py-12 text-primary bg-primary transition-colors duration-150">
          <div className="col-span-1 lg:col-span-3">
            <Link href="/">
              <a className="flex flex-initial items-center font-bold md:mr-24">
                <span className="mr-2">
                  <Logo />
                </span>
                <span>Find My Gift</span>
              </a>
            </Link>
          </div>
          <div className="col-span-1 lg:col-span-4">
            <div className="grid md:grid-rows-4 md:grid-cols-3 md:grid-flow-col">
              {[...links, ...sitePages].map((page) => (
                <span key={page.url} className="py-3 md:py-0 md:pb-4">
                  <Link href={page.url!}>
                    <a className="text-accent-9 hover:text-accent-6 transition ease-in-out duration-150">
                      {page.name}
                    </a>
                  </Link>
                </span>
              ))}
            </div>
          </div>
          <div className="col-span-1 lg:col-span-5">
            <h2 className='mb-4'>SHIPPING ALL OVER INDIA</h2>
            <div className="">
              NEW DELHI | BANGLORE | MUMBAI | HYDERABAD | CHENNAI | PUNE | KOLKATA | NOIDA | GURUGRA | AHMEDABAD | CHANDIGARH | JAIPUR | LUCKNOW | INDORE | GAZIABAD | AND MORE....
            </div>
            <div className='mt-4 flex'>
                <a href="https://www.instagram.com/findmygiftindia/?hl=en" target="_blank"  rel="noreferrer" ><Instagram /></a>
                <a href="https://www.pinterest.com/findmygifting/" className='ml-2' target="_blank"  rel="noreferrer" ><Pinterest /></a>
                <a href=""target="_blank"  rel="noreferrer"  className='ml-2'><Facebook /></a>
            </div>
          </div>
        </div>
        <div className="pt-6 pb-10 flex flex-col md:flex-row justify-between items-center space-y-4 text-accent-6 text-sm">
          <div>
            <span>&copy; 2022 candles, Inc. All rights reserved.</span>
          </div>
          <div className='flex'>
            <div className='mx-2'>
            <Visa /></div>
            <div className='mx-2'> <Paytm /> </div>
            
            <div className="mx-2"><Rupay /></div>
          </div> 
        </div>
      </Container>
    </footer>
  )
}

function usePages(pages?: Page[]) {
  const { locale } = useRouter()
  const sitePages: Page[] = []

  if (pages) {
    pages.forEach((page) => {
      const slug = page.url && getSlug(page.url)
      if (!slug) return
      if (locale && !slug.startsWith(`${locale}/`)) return
      sitePages.push(page)
    })
  }

  return {
    sitePages: sitePages.sort(bySortOrder),
  }
}

// Sort pages by the sort order assigned in the BC dashboard
function bySortOrder(a: Page, b: Page) {
  return (a.sort_order ?? 0) - (b.sort_order ?? 0)
}

export default Footer

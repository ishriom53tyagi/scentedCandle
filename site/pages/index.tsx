import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import { ProductCard } from '@components/product'
import { Grid, Marquee, Hero } from '@components/ui'
// import HomeAllProductsGrid from '@components/common/HomeAllProductsGrid'
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import { useEffect } from 'react'
import { getAllProducts } from 'service/products'

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales }
  const productsPromise = commerce.getAllProducts({
    variables: { first: 6 },
    config,
    preview,
    // Saleor provider only
    ...({ featured: true } as any),
  })



  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const  productstest  = await productsPromise

  let products  = await getAllProducts();
  products = products.data.data.products;

  const { pages } = await pagesPromise
  const { categories, brands } = await siteInfoPromise

  return {
    props: {
      products,
      categories,
      brands,
      pages,
    },
    revalidate: 60,
  }
}
export function randomDescriptipon(){
    let arr = [" Scented candles create a desirable ambience and atmosphere" , "Candles liven up your decor ", "Scented candles add fragrance to your space"];
    let index =  Math.floor(Math.random() * arr.length);
    return arr[index];
  }
export default function Home({
  products,
}: InferGetStaticPropsType<typeof getStaticProps>) {

  useEffect(() => {
    async function fetchUser() {
      let response = await getAllProducts();
    }
    fetchUser();
  },[]);

  return (
    <>
      <Grid variant="filled">
        {products.slice(0, 3).map((product: any, i: number) => (
          <ProductCard
            key={product._id}
            product={product}
            imgProps={{
              width: i === 0 ? 1080 : 540,
              height: i === 0 ? 1080 : 540,
              priority: true,
            }}
          />
        ))}
      </Grid>
      <Marquee variant="secondary">
        {products.slice(0, 3).map((product: any, i: number) => (
          <ProductCard key={product._id} product={product} variant="slim" />
        ))}
      </Marquee>
      <Hero
        headline= {randomDescriptipon()}
        // description= {randomDescriptipon()}
      />
      <Grid layout="B" variant="filled">
        {products.slice(3, 6).map((product: any, i: number) => (
          <ProductCard
            key={product._id}
            product={product}
            imgProps={{
              width: i === 0 ? 1080 : 540,
              height: i === 0 ? 1080 : 540,
            }}
          />
        ))}
      </Grid>
      <Marquee>
        {products.slice(6).map((product: any, i: number) => (
          <ProductCard key={product._id} product={product} variant="slim" />
        ))}
      </Marquee>
      {/* <HomeAllProductsGrid
        newestProducts={products}
        categories={categories}
        brands={brands}
      /> */}
    </>
  )
}

Home.Layout = Layout

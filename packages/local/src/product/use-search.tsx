import { SWRHook } from '@vercel/commerce/utils/types'
import useSearch, { UseSearch } from '@vercel/commerce/product/use-search'
export default useSearch as UseSearch<typeof handler>
import { HOST_NAME } from '../../environment'

export const handler: SWRHook<any> = {
  fetchOptions: {
    method: 'POST',
    url: `${HOST_NAME}/api/backend/catalog/products`,
  },
  async fetcher({ input: { search, categoryId, brandId, sort }, options, fetch }) {
    // Use a dummy base as we only care about the relative path
    const url = new URL(options.url!, 'http://a')

    if (search) url.searchParams.set('search', search)
    if (Number.isInteger(Number(categoryId)))
      url.searchParams.set('categoryId', String(categoryId))
    if (Number.isInteger(brandId))
      url.searchParams.set('brandId', String(brandId))
    if (sort) url.searchParams.set('sort', sort)
    console.log("ok ok okk mana to hai sick");
    let data =  {
                  search:search,
                  categoryId:categoryId,
                  brandId:brandId,
                  sort:sort
                }

    return await fetch({ ...options, body: { data } })
  
  },
  useHook: ({ useData }) => (input) => {
    return useData({
      input: [
        ['search', input.search],
        ['categoryId', input.categoryId],
        ['brandId', input.brandId],
        ['sort', input.sort],
      ],
      swrOptions: { revalidateOnFocus: false, ...input?.swrOptions },
    })
  },
}

import { SWRHook } from '@vercel/commerce/utils/types'
import useSearch, { UseSearch } from '@vercel/commerce/product/use-search'
export default useSearch as UseSearch<typeof handler>

export const handler: SWRHook<any> = {
  fetchOptions: {
    method: 'GET',
    url: 'http://localhost:5120/api/backend/catalog/products',
  },
  fetcher({ input: { search, categoryId, brandId, sort }, options, fetch }) {
    // Use a dummy base as we only care about the relative path
    const url = new URL(options.url!, 'http://a')

    if (search) url.searchParams.set('search', search)
    if (Number.isInteger(Number(categoryId)))
      url.searchParams.set('categoryId', String(categoryId))
    if (Number.isInteger(brandId))
      url.searchParams.set('brandId', String(brandId))
    if (sort) url.searchParams.set('sort', sort)

    console.log("Url total",url.pathname + url.search,options.method);

    return fetch({
      method: 'GET',
      url: 'http://localhost:5120/api/backend/catalog/products',
    })
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

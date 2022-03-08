import { Fetcher } from '@vercel/commerce/utils/types'
import { FetcherError } from '@vercel/commerce/utils/errors'
import Cookies from 'js-cookie'

async function getText(res: Response) {
  try {
    return (await res.text()) || res.statusText
  } catch (error) {
    return res.statusText
  }
}

async function getError(res: Response) {
  if (res.headers.get('Content-Type')?.includes('application/json')) {
    const data = await res.json()
    return new FetcherError({ errors: data.errors, status: res.status })
  }
  return new FetcherError({ message: await getText(res), status: res.status })
}

export const fetcher: Fetcher = async ({
  url,
  method = 'GET',
  variables,
  body: bodyObj,
}) => {
    const hasBody = Boolean(variables || bodyObj)
    const body = hasBody
      ? JSON.stringify(variables ? { variables } : bodyObj)
      : undefined
    const headers = hasBody ? { 'Content-Type': 'application/json' } : undefined
    const res = await fetch(url!, { method, body, headers , credentials: 'same-origin' })
    if (res.ok) {
      const result = await res.json();
      if(result.data && result?.data.cartCookie && !(Cookies.get("cartCookie")))
      {
        const options = {
          expires:60 * 60 * 24 * 30
        }
        Cookies.set("cartCookie", result.data.cartCookie ,options);
      }

      return result.data?.data ? result.data?.data : result.data ;

    }

    throw await getError(res)
}

/**
 * SWR fetcher for server actions or async functions.
 * Usage: useSWR([action, ...args], fetcher)
 */
export const actionFetcher = async ([action, ...args]: [Function, ...any[]]) => {
    return await action(...args)
}

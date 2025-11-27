import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { Product } from './generated';

// 建立一個獨立的 axios 實例，並且完全不設定任何 interceptor
// 確保這是一個純淨的請求，不會帶上任何 Token
const searchAxios = axios.create();

/**
 * 模糊搜尋 API
 * GET http://localhost:8080/api/blursearch?keyword=...
 */
export const blurSearch = (
    keyword: string,
    options?: AxiosRequestConfig
): Promise<AxiosResponse<Product[]>> => {
    return searchAxios.get(
        `http://localhost:8080/api/blursearch`,
        {
            ...options,
            params: { keyword, ...options?.params }
        }
    );
};

export const getBlurSearchQueryKey = (keyword: string) => {
    return ['/api/blursearch', keyword] as const;
};

export const useBlurSearch = <TData = AxiosResponse<Product[]>, TError = unknown>(
    keyword: string,
    options?: {
        query?: Partial<UseQueryOptions<TData, TError>>,
        axios?: AxiosRequestConfig
    }
): UseQueryResult<TData, TError> => {
    const { query: queryOptions, axios: axiosOptions } = options ?? {};

    const queryKey = queryOptions?.queryKey ?? getBlurSearchQueryKey(keyword);

    const queryFn = async ({ signal }: { signal: AbortSignal }) => {
        const response = await blurSearch(keyword, { signal, ...axiosOptions });
        return response as TData;
    };

    return useQuery({
        queryKey,
        queryFn,
        enabled: !!keyword, // Only run if keyword is not empty
        ...queryOptions
    });
};

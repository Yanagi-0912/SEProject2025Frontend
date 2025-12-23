import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useQuery, useQueries } from '@tanstack/react-query';
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { Product } from './generated';
import { getProductById } from './generated';
import { PRODUCT_API, RAG_API } from '../config/api';

/**
 * 模糊搜尋 API
 * GET {PRODUCT_API}/api/blursearch?keyword=...
 */
export const blurSearch = (
    keyword: string,
    options?: AxiosRequestConfig
): Promise<AxiosResponse<Product[]>> => {
    return axios.get(
        `${PRODUCT_API}/api/blursearch`,
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

/**
 * RAG 搜尋 API
 * POST {RAG_API}/api/search
 */
export const ragSearch = async (
    query: string
): Promise<string[]> => {
    const response = await axios.post<string[]>(
        `${RAG_API}/api/search`,
        { query }
    );
    return response.data;
};

/**
 * 訊息潤飾 API
 * POST {RAG_API}/api/rewrite
 */
export const rewriteMessage = async (
    message: string
): Promise<{ original: string; polished: string }> => {
    const response = await axios.post<{ original: string; polished: string }>(
        `${RAG_API}/api/rewrite`,
        { message }
    );
    return response.data;
};

/**
 * 根據 ID 列表取得商品 Hook
 */
export const useGetProductsByIds = (ids: string[]) => {
    return useQueries({
        queries: ids.map(id => ({
            queryKey: ['/api/products', id],
            queryFn: () => getProductById(id),
            enabled: !!id
        }))
    });
};

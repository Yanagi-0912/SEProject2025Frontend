import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { PRODUCT_API } from '../config/api';

/**
 * 取得所有商品分類 API
 * GET {PRODUCT_API}/api/products/Category
 */
export const getCategories = (
    options?: AxiosRequestConfig
): Promise<AxiosResponse<string[]>> => {
    return axios.get(
        `${PRODUCT_API}/api/products/Category`,
        {
            ...options,
            headers: {
                'accept': 'application/json',
                ...options?.headers
            }
        }
    );
};

export const getCategoriesQueryKey = () => {
    return ['/api/products/Category'] as const;
};

/**
 * 取得所有商品分類 Hook
 */
export const useGetCategories = <TData = string[], TError = unknown>(
    options?: {
        query?: Partial<UseQueryOptions<TData, TError>>,
        axios?: AxiosRequestConfig
    }
): UseQueryResult<TData, TError> => {
    const { query: queryOptions, axios: axiosOptions } = options ?? {};

    const queryKey = queryOptions?.queryKey ?? getCategoriesQueryKey();

    const queryFn = async ({ signal }: { signal: AbortSignal }) => {
        const response = await getCategories({ signal, ...axiosOptions });
        return response.data as TData;
    };

    return useQuery({
        queryKey,
        queryFn,
        ...queryOptions
    });
};


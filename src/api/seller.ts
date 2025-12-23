import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { Product } from './generated';
import { PRODUCT_API } from '../config/api';

/**
 * 取得賣家的所有商品 API
 * GET {PRODUCT_API}/api/products/seller/{sellerId}
 */
export const getSellerProducts = (
    sellerId: string,
    options?: AxiosRequestConfig
): Promise<AxiosResponse<Product[]>> => {
    return axios.get(
        `${PRODUCT_API}/api/products/seller/${sellerId}`,
        {
            ...options,
            headers: {
                'accept': 'application/json',
                ...options?.headers
            }
        }
    );
};

export const getSellerProductsQueryKey = (sellerId: string) => {
    return ['/api/products/seller', sellerId] as const;
};

/**
 * 取得賣家的所有商品 Hook
 */
export const useGetSellerProducts = <TData = Product[], TError = unknown>(
    sellerId: string,
    options?: {
        query?: Partial<UseQueryOptions<TData, TError>>,
        axios?: AxiosRequestConfig
    }
): UseQueryResult<TData, TError> => {
    const { query: queryOptions, axios: axiosOptions } = options ?? {};

    const queryKey = queryOptions?.queryKey ?? getSellerProductsQueryKey(sellerId);

    const queryFn = async ({ signal }: { signal: AbortSignal }) => {
        const response = await getSellerProducts(sellerId, { signal, ...axiosOptions });
        return response.data as TData;
    };

    return useQuery({
        queryKey,
        queryFn,
        enabled: !!sellerId, // Only run if sellerId is not empty
        ...queryOptions
    });
};

/**
 * 取得賣家的上架商品 API
 * GET {PRODUCT_API}/api/products/seller/{sellerId}/active
 */
export const getSellerActiveProducts = (
    sellerId: string,
    options?: AxiosRequestConfig
): Promise<AxiosResponse<Product[]>> => {
    return axios.get(
        `${PRODUCT_API}/api/products/seller/${sellerId}/active`,
        {
            ...options,
            headers: {
                'accept': 'application/json',
                ...options?.headers
            }
        }
    );
};

export const getSellerActiveProductsQueryKey = (sellerId: string) => {
    return ['/api/products/seller', sellerId, 'active'] as const;
};

/**
 * 取得賣家的上架商品 Hook
 */
export const useGetSellerActiveProducts = <TData = Product[], TError = unknown>(
    sellerId: string,
    options?: {
        query?: Partial<UseQueryOptions<TData, TError>>,
        axios?: AxiosRequestConfig
    }
): UseQueryResult<TData, TError> => {
    const { query: queryOptions, axios: axiosOptions } = options ?? {};

    const queryKey = queryOptions?.queryKey ?? getSellerActiveProductsQueryKey(sellerId);

    const queryFn = async ({ signal }: { signal: AbortSignal }) => {
        const response = await getSellerActiveProducts(sellerId, { signal, ...axiosOptions });
        return response.data as TData;
    };

    return useQuery({
        queryKey,
        queryFn,
        enabled: !!sellerId, // Only run if sellerId is not empty
        ...queryOptions
    });
};


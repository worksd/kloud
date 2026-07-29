'use server';

import { api } from "@/app/api.client";

// 키오스크 프로모션(번들) 목록.
//  - 무인 키오스크: onSale=true (판매중만)
//  - admin 키오스크: onSale 생략 (전부)
export const getBundlesAction = async (onSale?: boolean) => {
  return await api.bundle.list({ onSale });
};

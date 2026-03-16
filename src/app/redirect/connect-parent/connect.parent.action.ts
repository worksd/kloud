'use server'
import {api} from "@/app/api.client";

export const connectParentAction = async ({studentUserId, parentPhone, parentName}: {
    studentUserId: number,
    parentPhone: string,
    parentName?: string
}) => {
    return await api.user.connectParent({studentUserId, parentPhone, parentName})
}
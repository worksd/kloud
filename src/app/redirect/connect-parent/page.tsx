import {connectParentAction} from "@/app/redirect/connect-parent/connect.parent.action";

export default async function ConnectParentPage({searchParams}:
                                                {
                                                    searchParams: Promise<{
                                                        studentUserId: number,
                                                        parentPhone: string,
                                                        parentName: string
                                                    }>
                                                }) {
    const {studentUserId, parentPhone, parentName} = await searchParams;
    const res = await connectParentAction({studentUserId, parentPhone, parentName});

    if ('success' in res && res.success) {
        return (
            <div className={'text-black'}>
                연동 완료!
            </div>
        )
    } else if ('code' in res) {
        return (
            <div className={'text-red-500'}>{res.message}</div>
        )
    } else {
        return (
            <div className={'text-black'}>에러가 발생했습니다</div>
        )
    }
}
import Link from "next/link";
import { useMemo } from "react";

export default function LessonDetail({ params }: { params: { id: string } }) {
    const isPaymentButtonVisible = useMemo(() => true, []);

    return (
        <div className="w-screen h-screen bg-white">
            {isPaymentButtonVisible && (
                <Link
                    href={`/lessons/${params.id}/payment`}
                    className="flex justify-center items-center w-[342px] h-14 relative px-4 rounded-lg bg-black">
                    <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-center text-white">30,000원 결제하기</p>
                </Link>
            )}
        </div>
    );
}

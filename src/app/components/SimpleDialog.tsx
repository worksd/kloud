'use client'

import Dim from "@/app/components/Dim";
import { DialogInfo } from "@/utils/dialog.factory";

export const SimpleDialog = ({dialogInfo, onClickConfirmAction, onClickCancelAction}: {
  dialogInfo: DialogInfo,
  onClickConfirmAction: (dialogInfo: DialogInfo) => void,
  onClickCancelAction: () => void
}) => {
  return (
    <Dim>
      <section
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 mx-auto max-w-md bg-white rounded-2xl shadow-xl p-6 z-50">
        {/* 제목 */}
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          {dialogInfo.title}
        </h2>

        {/* 메시지 */}
        <div className="mt-2 mb-6">
          <p className="text-base text-gray-600 whitespace-pre-line">
            {dialogInfo.message}
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-3 justify-end mt-6">
          {/* 취소 버튼 */}
          {dialogInfo.cancelTitle &&
            <button
              onClick={onClickCancelAction}
              className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
            >
              {dialogInfo.cancelTitle}
            </button>
          }

          {/* 확인 버튼 */}
          {dialogInfo.confirmTitle &&
            <button
              onClick={() => onClickConfirmAction(dialogInfo)}
              className="px-5 py-2.5 rounded-lg bg-black text-white hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
            >
              {dialogInfo.confirmTitle}
            </button>
          }
        </div>
      </section>
    </Dim>
  )
}
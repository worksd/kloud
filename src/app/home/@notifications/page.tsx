import { GetNotificationResponse } from "@/app/endpoint/notification.endpoint";

export default async function NewNotifications() {

  const notifications: GetNotificationResponse[] = []

  return (
    <section className="sticky top-0 bg-white z-10">
      <script src="https://cdn.portone.io/v2/browser-sdk.js"></script>

      <div className="p-4">
        <div className="text-[24px] font-normal text-black">New</div>
      </div>
      {notifications && notifications.length > 0 && (
        <div className="flex overflow-x-auto snap-x snap-mandatory last:pr-6 scrollbar-hide">
          {notifications.map((item: GetNotificationResponse) => (
            <div
              key={item.id}
              className="min-w-[calc(100vw-32px)] snap-start pl-4"
            >
              <div className="bg-[#F7F8F9] p-4 rounded-2xl mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[18px]">{item.brand}</span>
                      <span className="font-bold text-black text-[14px]">{item.title}</span>
                    </div>
                    <p className="text-[#667085] mt-2 text-[14px]">
                      {item.description}
                    </p>
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="#000000" strokeWidth="2" strokeLinecap="round"
                          strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {notifications && notifications.length == 0 && (
        <div className="w-screen text-center text-[#BCBFC2] py-[42px]">새로운 공지사항이 없습니다</div>
      )}
    </section>
  )
}
'use server'
import { translate } from "@/utils/translate";
import { cookies } from "next/headers";
import { studioKey } from "@/shared/cookies.key";
import NoStudentPage from "@/app/studios/NoStudentPage";
import { api } from "@/app/api.client";
import MyStudioPage from "@/app/studios/MyStudioPage";

export default async function StudioPage() {

  const res = await api.studio.my({});
  const cookieStudioId = (await cookies()).get(studioKey)?.value
  console.log(cookieStudioId)

  if ('studios' in res) {
    const serverStudioId = res.studios.length > 0 ? `${res.studios[0].id}` : undefined
    console.log(serverStudioId)
    return (
      <div className="fixed inset-0 flex flex-col bg-white">
        <header className="sticky top-0 z-10 p-4 bg-white">
          <h1 className="text-2xl font-medium text-black">{await translate('my_studio')}</h1>
        </header>
        {(cookieStudioId || serverStudioId) ? <MyStudioPage studioId={cookieStudioId ?? serverStudioId}/> : <NoStudentPage/>}
      </div>
    );
  }
}
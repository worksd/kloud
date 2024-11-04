import { cookies } from "next/headers";
import { api } from "@/app/api.client";
import { redirect } from "next/navigation";

export default async function Profile(props: any) {

  await fetchMe()

  return (
    <div style={{
      backgroundColor: 'black',
      color: 'white',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column'
    }}>
      <h1>Hello Profile</h1>
    </div>
  );
}

export async function fetchMe() {
  const userId =  (await api.auth.token({})).id
  const res = await api.user.get({
    id: userId
  })
  return res
}

export async function fetchUser(userId: number) {
  const res = await api.user.get({
    id: userId
  })
  console.log(res)
  return res
}
import { cookies } from "next/headers";
import { api } from "@/app/api.client";
import { redirect } from "next/navigation";

export default async function Profile(props: any) {

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
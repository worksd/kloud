import { headers } from "next/headers";
import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h2 className="text-black">아직 개발중입니다~ {process.env.GUINNESS_API_SERVER}가 서버입니다</h2>
    </div>
  )
}
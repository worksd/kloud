import { connectParentAction } from "@/app/redirect/connect-parent/connect.parent.action";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import {phoneLoginAction} from "@/app/login/phone/phoneLoginAction";
import {redirect} from "next/navigation";

function maskPhone(phone?: string) {
  if (!phone) return "-";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return phone;
  return `${digits.slice(0,3)}-${digits.slice(3, digits.length - 4)}-${digits.slice(-4)}`;
}

function Field({ label, value }: { label: string; value?: string | number }) {
  return (
      <div className="flex items-center justify-between gap-4 py-2">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-sm font-medium text-gray-900">{value ?? "-"}</span>
      </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
      <main className="min-h-[60vh] w-full bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
  );
}

function Card(
    { children, tone = "default" }: React.PropsWithChildren<{ tone?: "success" | "error" | "default" }>
) {
  const ring =
      tone === "success" ? "ring-green-200" :
          tone === "error"   ? "ring-red-200"   :
              "ring-gray-200";
  return (
      <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ${ring} overflow-hidden`}>
        {children}
      </div>
  );
}

function Header({ title, subtitle, icon }: { title: string; subtitle?: string; icon: React.ReactNode }) {
  return (
      <div className="flex items-start gap-3 p-6 border-b border-gray-100">
        <div className="shrink-0">{icon}</div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return <div className="p-6">{children}</div>;
}

export default async function ConnectParentPage({ searchParams }: {
  searchParams: Promise<{
    phone: string,
    countryCode: string,
    parentName: string,
    redirectUrl: string,
  }>
}) {
  const { phone, countryCode, redirectUrl } = await searchParams;
  const phoneRes = await phoneLoginAction({
    phone, countryCode, isAdmin: true
  })
  if ('user' in phoneRes) {
    redirect(redirectUrl)
  } else {
    redirect('/')
  }
  return (
      <div>
        결제 페이지로 이동중입니다.
      </div>
  );
}

import { connectParentAction } from "@/app/redirect/connect-parent/connect.parent.action";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

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
    studentUserId: number,
    parentPhone: string,
    parentName: string
  }>
}) {
  // Optional: small optimistic splash while awaiting searchParams/action
  // (Server components render once; leaving this for clarity)
  const { studentUserId, parentPhone, parentName } = await searchParams;
  const res = await connectParentAction({ studentUserId, parentPhone, parentName });

  const baseDetails = (
      <div className="divide-y divide-gray-100">
        <Field label="학생 사용자 ID" value={studentUserId} />
        <Field label="학부모 이름" value={parentName} />
        <Field label="학부모 연락처" value={maskPhone(parentPhone)} />
      </div>
  );

  if ("success" in res && res.success) {
    return (
        <Shell>
          <Card tone="success">
            <Header
                title="연동이 완료되었어요!"
                subtitle="입력하신 정보와 연결이 성공적으로 처리되었습니다."
                icon={<CheckCircle2 className="h-8 w-8 text-green-600" />}
            />
            <Body>
              {baseDetails}
              <div className="mt-6 flex items-center justify-end gap-3">
                {/* Example actions: navigate back or to dashboard if routes exist */}
                <a href="/" className="inline-flex items-center rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">홈으로</a>
                <a href="/dashboard" className="inline-flex items-center rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">대시보드</a>
              </div>
            </Body>
          </Card>
        </Shell>
    );
  } else if ("code" in res) {
    return (
        <Shell>
          <Card tone="error">
            <Header
                title="연동에 실패했어요"
                subtitle="아래 안내를 확인한 뒤 다시 시도해주세요."
                icon={<AlertTriangle className="h-8 w-8 text-red-600" />}
            />
            <Body>
              <div className="rounded-xl bg-red-50 text-red-700 text-sm p-4">
                {res.message}
              </div>
              <div className="mt-6">
                {baseDetails}
              </div>
            </Body>
          </Card>
        </Shell>
    );
  }

  return (
      <Shell>
        <Card>
          <Header
              title="알 수 없는 오류가 발생했습니다"
              subtitle="잠시 후 다시 시도하거나, 문제가 지속되면 관리자에게 문의해주세요."
              icon={<Loader2 className="h-8 w-8 animate-spin text-gray-500" />}
          />
          <Body>
            {baseDetails}
          </Body>
        </Card>
      </Shell>
  );
}

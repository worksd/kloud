import { CouponRegisterForm } from '@/app/profile/setting/coupon/CouponRegisterForm';
import { getLocale } from '@/utils/translate';

export default async function CouponRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  return (
    <div className="flex flex-col w-screen min-h-screen bg-white">
      <CouponRegisterForm locale={await getLocale()} initialCode={code}/>
    </div>
  );
}

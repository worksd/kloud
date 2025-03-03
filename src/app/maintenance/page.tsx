'use client'

import { useLocale } from "@/hooks/useLocale";

export default function MaintenancePage() {
  const { t } = useLocale()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center p-6 text-center">

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {t('maintenance_title')}
        </h1>

        <p className="text-gray-600 mb-6">
          {t('maintenance_description')}<br/>
          {t('maintenance_try_later')}
        </p>

        <div className="text-sm text-gray-500">
          {t('maintenance_time')}
        </div>
      </div>
    </div>
  )
}
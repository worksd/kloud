import { translate } from "@/utils/translate";

export default async function MaintenancePage() {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center p-6 text-center">

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {await translate('maintenance_title')}
        </h1>

        <p className="text-gray-600 mb-6">
          {await translate('maintenance_description')}<br/>
          {await translate('maintenance_try_later')}
        </p>

        <div className="text-sm text-gray-500">
          {await translate('maintenance_time')}
        </div>
      </div>
    </div>
  )
}
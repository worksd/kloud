import { api } from "@/app/api.client";
import { StudioItem } from "@/app/search/StudioItem";

export default async function HomeStudioSettingSheetPage() {
  const res = await api.studio.my({})
  if ('studios' in res) {
    return (
      <div>
        {res.studios.map((studio) =>
          <StudioItem key={studio.id} item={studio}/>
        )}
      </div>
    );
  }
}

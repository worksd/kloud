import Logo from "../../../public/assets/logo_black.svg";
import { SearchStudioItems } from "@/app/search/simple.studio.item";

export default function Search() {
  return (
    <div className="bg-white w-screen h-screen">
      <div className="w-screen p-4 headline-200">
        검색
      </div>

      <SearchStudioItems studios={[
        {
          name: 'd',
          id: 0,
          logoUrl: 'https://picsum.photos/250/250'
        },
        {
          name: 'd',
          id: 1,
          logoUrl: 'https://picsum.photos/250/250'
        },
        {
          name: 'd',
          id: 2,
          logoUrl: 'https://picsum.photos/250/250'
        },
        {
          name: 'd',
          id: 3,
          logoUrl: 'https://picsum.photos/250/250'
        },
        {
          name: 'd',
          id: 4,
          logoUrl: 'https://picsum.photos/250/250'
        }
      ]}/>
    </div>
  )
}
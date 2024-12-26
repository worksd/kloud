import Image from "next/image";

export const Poster = ({
                         posterUrl, studioLogoUrl, dDay, title, description
                       }:
                         {
                           posterUrl: string,
                           studioLogoUrl: string,
                           dDay: string,
                           title: string,
                           description: string,
                         }
) => {

  return (
    <div className="flex flex-col">
      <div style={{width: '167px', height: '222px', position: 'relative'}}>
        <Image
          src="https://picsum.photos/250/250"
          alt="dd"
          fill
          style={{
            objectFit: 'cover',
            border: '16px solid black', // 원하는 색상과 크기
            borderRadius: '8px',        // 둥근 모서리(선택 사항)
          }}
        />
      </div>

      <div className="body-400 mt-2">
        트릭스 힙합 클래스
      </div>
      <div className="body-200 text-gray-500">
        24.10.14(토) / 17:00
      </div>
    </div>

  )
}
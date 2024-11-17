import Image from 'next/image';
import Dim from "@/app/components/Dim";

// const Loading = () => {
//   return (
//     <Dim>
//       <main className={'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex'}>
//         <p className={'text-white'}>{'로딩중...'}</p>
//       </main>
//     </Dim>
//   );
// };
//
// export default Loading;

export default function Loading() {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <svg
        height="100%"
        viewBox="0 0 32 32"
        width={40}
      >
        <circle
          cx="16"
          cy="16"
          fill="none"
          r="14"
          strokeWidth="4"
          style={{ stroke: "rgb(29, 155, 240)", opacity: 0.2 }}
        ></circle>
        <circle
          cx="16"
          cy="16"
          fill="none"
          r="14"
          strokeWidth="4"
          style={{
            stroke: "rgb(29, 155, 240)",
            strokeDasharray: 80,
            strokeDashoffset: 60,
          }}
        ></circle>
      </svg>
    </div>
  );
}
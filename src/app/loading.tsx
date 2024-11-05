import Image from 'next/image';
import Dim from "@/app/components/Dim";

interface LoadingProps {
  text?: string;
}
const Loading = ({ text }: LoadingProps) => {
  return (
    <Dim>
      <main className={'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex'}>
        <p className={'text-white'}>{text || '로딩중...'}</p>
      </main>
    </Dim>
  );
};

export default Loading;
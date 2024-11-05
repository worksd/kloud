import { ReactNode } from 'react';

interface DimProps {
  children?: ReactNode;
}

const Dim = ({ children }: DimProps) => {
  return <aside className={'w-screen h-screen bg-[#000000A0] absolute left-0 top-0 z-10'}>{children}</aside>;
};

export default Dim;
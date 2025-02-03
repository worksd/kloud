import { ReactNode } from 'react';

interface DimProps {
  children?: ReactNode;
}

const Dim = ({ children }: DimProps) => {
  return <aside className={'fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'}>{children}</aside>;
};

export default Dim;
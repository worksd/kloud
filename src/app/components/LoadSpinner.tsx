import Image from "next/image";
import SpinnerSvg from "../../../public/assets/load-spinner.svg";

interface IProps {
  size?: number;
}

export default function LoadSpinner({ size = 30 }: IProps) {
  return <Image src={SpinnerSvg} alt="loading" width={size} height={size} />;
}

import { StudioDetailForm } from "@/app/studios/[id]/studio.detail";

export type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function StudioDetail({params}: Props) {
  const id = (await params).id;

  return (
    <StudioDetailForm id={id}/>
  )
}

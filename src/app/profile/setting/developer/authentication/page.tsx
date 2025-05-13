import {
  DeveloperAuthenticationForm
} from "@/app/profile/setting/developer/authentication/DeveloperAuthenticationForm";

export default async function DeveloperAuthenticationPage({
                                                            searchParams
                                                          }: {
  searchParams: Promise<{ os: string }>
}) {

  return (
    <DeveloperAuthenticationForm os={(await searchParams).os}/>
  )
}
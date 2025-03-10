import {
  DeveloperAuthenticationForm
} from "@/app/setting/account/developer/authentication/DeveloperAuthenticationForm";

export default async function DeveloperAuthenticationPage({
                                                            searchParams
                                                          }: {
  searchParams: Promise<{ os: string }>
}) {

  return (
    <DeveloperAuthenticationForm os={(await searchParams).os}/>
  )
}
'use server'
export const authenticateDeveloperAction = async ({password} : {password: string}): Promise<boolean> => {
  return process.env.DEVELOPER_PASSWORD == password
}
import { PassStatus } from "@/app/endpoint/pass.endpoint";

export const getMyPassAction = async () => {
  return {
    id: 7,
    price: 250,
    title: "Expert Passalskdjaslkdjalkdㅁ니암너아미넝미ㅏㄴ어ㅣ아멍미ㅏㅓㅁ니아넝미어미암너이ㅏㅓj",
    status: 'Done' as PassStatus,
    tickets: [],
    plan: {id: 2, name: "Pro Plan", studio: {id: 2, name: "Studio B", profileImageUrl: 'asdf'}, isPopular: true}
  }
}
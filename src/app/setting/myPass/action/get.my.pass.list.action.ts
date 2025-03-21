import { GetPassesResponse, PassOrder, PassStatus } from "@/app/endpoint/pass.endpoint";


export const getMyPassListAction = async ({order}: { order: PassOrder }): Promise<GetPassesResponse> => {
  const passes = [
    {
      id: 1,
      price: 100,
      title: "Beginner Pass",
      status: 'Active' as PassStatus,
      plan: {id: 1, name: "Basic Plan", studio: {id: 1, name: "Studio A", profileImageUrl: 'https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1737360016489'}, isPopular: false}
    },
    {
      id: 2,
      price: 200,
      title: "Advanced Pass",
      status: 'Active' as PassStatus,
      plan: {id: 2, name: "Pro Plan", studio: {id: 2, name: "Studio B", profileImageUrl: 'https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1737360016489'}, isPopular: true}
    },
    {
      id: 3,
      price: 150,
      title: "Intermediate Pass",
      status: 'Active' as PassStatus,
      plan: {id: 1, name: "Basic Plan", studio: {id: 1, name: "Studio A", profileImageUrl: 'https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1737360016489'}, isPopular: false}
    },
    {
      id: 4,
      price: 300,
      title: "Elite Pass",
      status: 'Active' as PassStatus,
      plan: {id: 3, name: "Elite Plan", studio: {id: 3, name: "Studio C", profileImageUrl: 'https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1737360016489'}, isPopular: true}
    },
    {id: 5, price: 50, title: "Trial Pass"},
    {
      id: 6,
      price: 120,
      title: "Beginner Plus Pass",
      status: 'Done' as PassStatus,
      plan: {id: 1, name: "Basic Plan", studio: {id: 1, name: "Studio A", profileImageUrl: 'https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1737360016489'}, isPopular: false}
    },
    {
      id: 7,
      price: 250,
      title: "Expert Pass",
      status: 'Done' as PassStatus,
      plan: {id: 2, name: "Pro Plan", studio: {id: 2, name: "Studio B", profileImageUrl: 'https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1737360016489'}, isPopular: true}
    },
    {id: 8, price: 80, title: "Weekend Pass"},
    {
      id: 9,
      price: 180,
      title: "Monthly Pass",
      status: 'Expired' as PassStatus,
      plan: {id: 4, name: "Monthly Plan", studio: {id: 4, name: "Studio D", profileImageUrl: 'https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1737360016489'}, isPopular: false}
    },
    {
      id: 10,
      price: 400,
      title: "VIP Pass",
      status: 'Expired' as PassStatus,
      plan: {id: 5, name: "VIP Plan", studio: {id: 5, name: "Studio E", profileImageUrl: 'https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1737360016489'}, isPopular: true}
    },
    {
      id: 11,
      price: 100,
      title: "Beginner Pass",
      status: 'Active' as PassStatus,
      plan: {id: 1, name: "Basic Plan", studio: {id: 1, name: "Studio A", profileImageUrl: 'https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1737360016489'}, isPopular: false}
    },
    {
      id: 12,
      price: 100,
      title: "Beginner Pass",
      status: 'Active' as PassStatus,
      plan: {id: 1, name: "Basic Plan", studio: {id: 1, name: "Studio A", profileImageUrl: 'https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1737360016489'}, isPopular: false}
    },
    {
      id: 13,
      price: 100,
      title: "Beginner Pass",
      status: 'Active' as PassStatus,
      plan: {id: 1, name: "Basic Plan", studio: {id: 1, name: "Studio A", profileImageUrl: 'https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1737360016489'}, isPopular: false}
    },
    {
      id: 14,
      price: 100,
      title: "Beginner Pass",
      status: 'Active' as PassStatus,
      plan: {id: 1, name: "Basic Plan", studio: {id: 1, name: "Studio A", profileImageUrl: 'https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1737360016489'}, isPopular: false}
    },
    {
      id: 15,
      price: 100,
      title: "Beginner Pass",
      status: 'Active' as PassStatus,
      plan: {id: 1, name: "Basic Plan", studio: {id: 1, name: "Studio A", profileImageUrl: 'https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1737360016489'}, isPopular: false}
    },
  ];
  return {passes};
};
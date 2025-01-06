import { Suspense } from 'react';
import { notFound } from 'next/navigation';

function UserDetails() {
  const user = null; // 사용자 데이터를 불러오려 했으나 실패
  if (!user) {
    notFound(); // 사용자 데이터가 없으므로 404 페이지를 렌더링
  }

  return <div>User: {user}</div>;
}

export default function Page() {
  return (
    <div>
      {/*<h1>Welcome to the User Page</h1>*/}
      <Suspense fallback={<p>Loading user details...</p>}>
        <UserDetails />
      </Suspense>
    </div>
  );
}
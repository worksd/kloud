'use client';
import { useEffect, useState } from "react";

const WebViewInteraction = ({ setData }) => {
  useEffect(() => {
    const handleAndroidData = (event) => {
      const { detail } = event;
      console.log("Data from Android:", detail.data);
      setData(detail.data);
    };

    // 'androidData' 이벤트를 리스닝
    if (typeof window !== "undefined") {
      window.addEventListener('getDataFromAndroid', handleAndroidData);
    }

    const callAndroid = () => {
      if (window.AndroidInterface) {
        window.AndroidInterface.showToast("Hello from Next.js!");
      }
    };

    callAndroid();

    // 컴포넌트가 언마운트될 때 이벤트 리스너 해제
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener('androidData', handleAndroidData);
      }
    };
  }, [setData]);

  return <div>Interacting with Android WebView...</div>;
};

export default function Splash() {
  const [data, setData] = useState('non');

  return (
    <div style={{
      backgroundColor: 'black',
      color: 'white',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column'
    }}>
      <h1>Hello {data}</h1>
      <WebViewInteraction setData={setData} />
    </div>
  );
}
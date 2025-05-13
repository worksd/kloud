'use client';


const Term = ({locale}: {locale: string}) => {
  return (
    <div className="w-full h-[100dvh] bg-white">
      <iframe
        src={"https://hello.rawgraphy.com/" + locale + "/terms"}
        className="w-full h-full border-none"
        title="Terms of Service"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
};

export default Term;
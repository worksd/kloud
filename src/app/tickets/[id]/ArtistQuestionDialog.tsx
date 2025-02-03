'use client'

import { useState } from 'react';
import Dim from "@/app/components/Dim";
import { createQuestionAction } from "@/app/tickets/[id]/create.question.action";

const PaymentQuestionPopup = ({title, lessonId, studioId} : {title: string, lessonId: number, studioId: number}) => {
  const [isClosed, setIsClosed] = useState(false);
  const [question, setQuestion] = useState("");

  const handleClickClose = () => {
    setIsClosed(true);
  };

  const handleSubmit = async () => {
    if (question.trim() === "") return;
    const res = await createQuestionAction({
      lessonId: lessonId,
      studioId: studioId,
      body: question,
      title: title,
    })
    if ('success' in res && res.success) {
      const dialogInfo = {
        id: 'Empty',
        type: 'SIMPLE',
        title: '질문 제출',
        message: '질문이 성공적으로 전달되었습니다. 강사님이 답변해 주실 거예요. 🙌',
      }
      window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
      setIsClosed(true);
    }
  };

  if (isClosed) return null;

  return (
    <Dim>
      <section
        className={`bg-white w-[90%] p-6 flex flex-col justify-between items-center absolute shadow-xl rounded-2xl left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-900 z-index`}
      >
        <header className={'flex justify-center items-center text-lg font-semibold mb-4'}>
          <h1>{'강사님께 질문하기'}</h1>
        </header>
        <main className={'flex flex-col justify-center items-center w-full'}>
          <textarea
            className="w-full p-3 bg-gray-100 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="수업과 관련해 궁금한 점을 자유롭게 질문해 주세요. 😊"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </main>
        <footer className={'flex justify-between w-full mt-4'}>
          <button className={'bg-gray-200 text-gray-700 py-2 px-4 rounded-full text-sm'} onClick={handleClickClose}>
            닫기
          </button>
          <button className={'bg-blue-500 text-white py-2 px-4 rounded-full text-sm font-medium'} onClick={handleSubmit}>
            질문 등록하기
          </button>
        </footer>
      </section>
    </Dim>
  );
};

export default PaymentQuestionPopup;

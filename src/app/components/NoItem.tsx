'use client'

export const NoItems = ({
                          title,
                          description,

                        }: {
  title?: string;
  description?: string;
}) => {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center bg-white p-4">
      {/* 메시지 */}
      <h2 className="text-[20px] font-bold text-black mb-2">
        {title}
      </h2>

      <p className="text-[16px] text-[#86898C] text-center mb-8">
        {description}
      </p>
    </div>
  );
}
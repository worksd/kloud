import React from "react";

export const OnboardingForeignCertificationForm = ({
                                                     email,
                                                     name,
                                                     country,
                                                     birthDate,
                                                     gender,
                                                     setName,
                                                     setCountry,
                                                     setBirthDate,
                                                     setGender,

                                                   }: {
  email: string,
  name: string,
  country: string,
  birthDate: string,
  gender: string,
  setName: (value: string) => void,
  setCountry: (value: string) => void,
  setBirthDate: (value: string) => void,
  setGender: (value: string) => void,
}) => {
  return (
    <div className="flex flex-col space-y-4 my-2 px-6">
      <div>
        <div className="flex items-center gap-1 mb-2">
          <label className="text-[14px] font-medium text-gray-800 leading-none">
            <div>Email</div>
          </label>
          <div
            className="text-[10px] text-[#E55B5B] leading-none">required
          </div>
        </div>
        <div className="text-[14px] text-gray-900 px-4 py-2 bg-gray-100 rounded-md border border-gray-300">
          {email}
        </div>
      </div>

      <form onReset={() => {
        setName('');
      }}>
        <div className="flex items-center gap-1 mb-2">
          <label htmlFor="name" className="text-[14px] font-medium text-gray-800 leading-none">
            <div>Name</div>
          </label>
          <div
            className="text-[10px] text-[#E55B5B] leading-none">required
          </div>
        </div>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 focus:border-black focus:outline-none rounded-md px-4 py-2 text-[14px] text-black"
        />
      </form>

      <form onReset={() => {
        setCountry('');
      }}>
        <div className="flex items-center gap-1 mb-2">
          <label htmlFor="birthDate" className="text-[14px] font-medium text-gray-800 leading-none">
            <div>Country</div>
          </label>
          <div
            className="text-[10px] text-[#E55B5B] leading-none">required
          </div>
        </div>
        <input
          id="country"
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full border border-gray-300 focus:border-black focus:outline-none rounded-md px-4 py-2 text-[14px] text-black"
        />
      </form>
      {/* 생년월일 */}
      <form onReset={() => {
        setBirthDate('');
      }}>
        <div className="flex items-center gap-1 mb-2">
          <label htmlFor="birthDate" className="text-[14px] font-medium text-gray-800 leading-none">
            <div>Birthday</div>
          </label>
          <div
            className="text-[10px] text-[#E55B5B] leading-none">required
          </div>
        </div>
        <input
          id="birthDate"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full border border-gray-300 focus:border-black focus:outline-none rounded-md px-4 py-2 text-[14px] text-black"
        />
      </form>

      {/* 성별 */}
      <div>
        <div className="flex items-center gap-1 mb-2">
          <label htmlFor="birthDate" className="text-[14px] font-medium text-gray-800 leading-none">
            <div>Gender</div>
          </label>
          <div className="text-[10px] text-[#E55B5B] leading-none">required</div>

        </div>
        <div className="flex gap-6 text-black">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              value="M"
              checked={gender === 'M'}
              onChange={() => setGender('M')}
              className="accent-black"
            />
            <div>M</div>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              value="F"
              checked={gender === 'F'}
              onChange={() => setGender('F')}
              className="accent-black"
            />
            <div>F</div>
          </label>
        </div>

        {/* Warning message */}
        <p className="text-[12px] text-[#E55B5B] mt-2 leading-snug">
          ※ This is a <b>foreign resident verification</b> process. <br/>
          If you are found not to be a foreign resident, access to the service may be restricted.
        </p>
      </div>

    </div>
  )
}
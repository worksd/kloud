import React, { useCallback, useEffect } from "react";
import { CommonSubmitButton } from "@/app/components/buttons";
import { updateUserAction } from "@/app/onboarding/update.user.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { useRouter } from "next/navigation";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";

export const ForeignCertificationForm = ({email, appVersion, isFromPayment}: { email: string, appVersion: string, isFromPayment: boolean }) => {

  const [birthDate, setBirthDate] = React.useState<string>('');
  const [name, setName] = React.useState("");
  const [gender, setGender] = React.useState<string>('');
  const [country, setCountry] = React.useState<string>('');
  const disabled = birthDate == '' || gender == '' || country == ''
  const router = useRouter();

  const confirmationDialogText = ({birthDate, email, country, gender, name}: {
    birthDate: string,
    email: string,
    country: string,
    gender: string,
    name: string
  }) => `
🤔 Are you ready to verify yourself?

Please confirm that the following information is correct:

- Name: ${name}
- Birthday: ${birthDate}
- Email: ${email}
- Country: ${country}
- Gender: ${gender === 'M' ? 'Male' : 'Female'}

If everything looks good, tap the [Confirm] button below to complete your verification.
⚠️ If the information is inaccurate, access to the service may be restricted.
`;

  const onClickSubmit = useCallback(async () => {
    const [year, month, day] = birthDate.split('-'); // ['1999', '05', '13']
    const yy = year.slice(-2); // '99'
    const genderCode = (() => {
      const y = parseInt(year, 10);
      if (y >= 2000) return gender === 'M' ? '3' : '4';
      if (y >= 1900) return gender === 'M' ? '1' : '2';
      return gender === 'M' ? '9' : '0'; // 1800년대 fallback
    })();

    const rrn = `${yy}${month}${day}${genderCode}`;
    const res = await updateUserAction({
      rrn,
      country,
      name,
      emailVerified: true,
    })
    if (res.success && res.user?.emailVerified == true){
      if (isFromPayment) {
        if (appVersion == '') {
          router.back()
        } else {
          window.KloudEvent?.back()
        }
      } else {
        const bottomMenuList = await getBottomMenuList();
        const bootInfo = JSON.stringify({
          bottomMenuList: bottomMenuList,
          route: '',
        });
        window.KloudEvent?.navigateMain(bootInfo);
      }
    }
  }, [birthDate, gender, country])

  const showCertificationDialog = async () => {
    if (appVersion == '') {
      await onClickSubmit()
    } else {
      const message = confirmationDialogText({birthDate, email, country, gender, name})
      const dialog = await createDialog({id: 'ForeignerVerificationRequest', message: message})
      window.KloudEvent.showDialog(JSON.stringify(dialog))
    }
  }

  useEffect(() => {
    window.onDialogConfirm = async (dialogInfo: DialogInfo) => {
      if (dialogInfo.id == 'ForeignerVerificationRequest') {
        await onClickSubmit()
      }
    }
  }, [birthDate, gender, country])

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

      <div className={'fixed bottom-4 left-0 right-0 px-6'}>
        <CommonSubmitButton originProps={{onClick: showCertificationDialog}} disabled={disabled}>
          Confirm
        </CommonSubmitButton>
      </div>

    </div>
  )
}
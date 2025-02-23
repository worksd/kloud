import { Dispatch, SetStateAction } from "react";

interface inputBoxProps {
  width: string;
  height: string;
  placeholder?: string;
  id?: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  handleChange: (e: any) => void;
  handleKeyDown?: (e: any) => void;
}
const InputBox = ({width, height, placeholder, handleChange, handleKeyDown, value, setValue, id}: inputBoxProps) => {
  return (
    <div className="relative flex items-center">
      <input
        type="text"
        className={
          `input-box flex justify-center items-center text-[#fff] text-[1.333rem] pl-[2rem] pr-[4.3rem] bg-[#212121] border-[0.083rem] border-solid rounded-[0.25rem] cursor-pointer border-[#212121] focus:border-[#888888] outline-0 ${width} ${height} `
        }
        id={id || ''}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};
export default InputBox;
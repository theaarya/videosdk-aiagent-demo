
import React from 'react';

interface CustomButtonProps {
  text: string;
  thickBorder?: boolean;
  onClick?: () => void;
}

export const CustomButton: React.FC<CustomButtonProps> = ({ 
  text, 
  thickBorder = false,
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={`box-border px-9 py-7 w-72 text-xl font-medium leading-8 text-center text-white whitespace-nowrap transition-all cursor-pointer duration-[0.2s] ease-[ease-in-out] h-[62px] rounded-[160px] flex items-center justify-center
        ${thickBorder
          ? 'border-pink-900 border-[6px]'
          : 'border-rose-400 border-[1.5px]'}
        hover:opacity-90
        max-md:px-8 max-md:py-6 max-md:h-14 max-md:text-lg max-md:w-[220px]
        max-sm:px-7 max-sm:py-5 max-sm:text-base max-sm:h-[52px] max-sm:w-[300px]`}
    >
      {text}
    </button>
  );
};

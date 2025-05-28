
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
      className={`box-border px-9 py-7 w-60 text-xl font-medium leading-8 text-center text-white whitespace-nowrap transition-all cursor-pointer duration-[0.2s] ease-[ease-in-out] h-[62px] rounded-[160px]
        ${thickBorder
          ? 'border-pink-900 border-[6px]'
          : 'border-rose-400 border-[1.5px]'}
        hover:opacity-90
        max-md:px-8 max-md:py-6 max-md:h-14 max-md:text-lg max-md:w-[200px]
        max-sm:px-7 max-sm:py-5 max-sm:text-base max-sm:h-[52px] max-sm:w-[280px]`}
    >
      {text}
    </button>
  );
};

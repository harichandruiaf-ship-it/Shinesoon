import React from 'react';

const Logo = ({ className = "w-10 h-10", showText = false, light = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Stylized Walking Figure - Simplified SVG Path */}
        <circle cx="50" cy="18" r="7" fill="#FF809B" />
        <path
          d="M48 28C42 28 38 32 38 38V52C38 54 39 56 41 56H43L40 85M52 28C58 28 62 32 62 38V48C62 50 61 52 59 53M50 28V56M50 56L58 85"
          stroke="#FF809B"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Briefcase */}
        <path
          d="M32 42H44V54C44 56 42 58 40 58H36C34 58 32 56 32 54V42Z"
          fill="#FF809B"
        />
        <path
          d="M35 42V40C35 39 36 38 37 38H39C40 38 41 39 41 40V42"
          stroke="#FF809B"
          strokeWidth="1.5"
        />
      </svg>
      {showText && (
        <div className="flex flex-col">
          <span className={`text-xl font-black uppercase tracking-tighter leading-none ${light ? 'text-white' : 'text-gray-100'}`}>
            ShineSoon
          </span>
          <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-[#FF809B]">
            Future of Interview
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;

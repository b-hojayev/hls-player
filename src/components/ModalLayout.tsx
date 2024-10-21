import { ReactNode } from "react";

const ModalLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="absolute bottom-[70px] right-[20px] rounded-[10px] w-[270px] h-[300px] overflow-y-auto z-50 bg-[#535353] opacity-70 p-[15px] pt-0 text-white">
      {children}
    </div>
  );
};

export default ModalLayout;

import { ButtonSize, ButtonType } from "@/utils/Button.types";
import Button from "./Button";
import Student from "./Student";

const Header = () => {    
    return (
        <header className="h-[65px] mt-[15px] mx-[130px] pb-[15px] bg-[var(--color-black-4)] border-b border-[var(--color-stroke)]/50 flex items-center justify-between">
            <div className="font-content text-[var(--color-white)]">
                Memorium
            </div>

            <div className="flex items-center gap-x-4">
                <Student/>
            </div>
        </header>
    );
};

export default Header;
"use client";

import { ButtonSize, ButtonType } from "@/utils/Button.types";

type CircleButtonProps = {
    type?: ButtonType.PRIMARY | ButtonType.SECONDARY;
    size?: ButtonSize.NORMAL | ButtonSize.SMALL; 
    onClick: () => void;
    icon: string;
    className?: string;
}

const CircleButton = ({
    type = ButtonType.PRIMARY,
    size = ButtonSize.NORMAL,
    onClick,
    icon,
    className
}: CircleButtonProps) => {
    const typeStyles: Record<ButtonType, string> = {
        [ButtonType.PRIMARY]: "bg-[var(--color-red)]",
        [ButtonType.SECONDARY]: "bg-[var(--color-black-1)]",
        [ButtonType.GHOST]: "",
        [ButtonType.STROKE]: "",
        [ButtonType.DANGER]: "",
        [ButtonType.DISABLED]: "",
        [ButtonType.NEUTRAL]: "",
    };

    const sizeStyles: Record<ButtonSize, string> = {
        [ButtonSize.NORMAL]: "w-[40px] h-[40px]",
        [ButtonSize.MEDIUM]: "",
        [ButtonSize.SMALL]: "w-[30px] h-[30px]",
    };

    const selectedSize = sizeStyles[size];
    const selectedStyle = typeStyles[type];
    const border = size === ButtonSize.NORMAL && type === ButtonType.SECONDARY ? "border border-[var(--color-stroke)]" : "";

    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center hover:cursor-pointer rounded-full ${selectedSize} ${selectedStyle} ${border} ${className}`}
        >
            <img src={icon} alt="" className="w-[12px] h-[12px]" />
        </button>
    );
};

export default CircleButton;
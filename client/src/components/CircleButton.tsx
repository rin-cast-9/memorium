"use client";

import { ButtonSize, ButtonType } from "@/utils/Button.types";

type CircleButtonProps = {
    type?: ButtonType;
    size?: ButtonSize; 
    onClick: () => void;
    icon: string;
    className?: string;
    customIconSize?: string;
}

const CircleButton = ({
    type = ButtonType.SECONDARY,
    size = ButtonSize.NORMAL,
    onClick,
    icon,
    className,
    customIconSize
}: CircleButtonProps) => {
    const typeStyles: Record<ButtonType, string> = {
        [ButtonType.PRIMARY]: "",
        [ButtonType.SECONDARY]: "bg-[var(--color-black-1)]",
        [ButtonType.GHOST]: "",
        [ButtonType.STROKE]: "",
        [ButtonType.DANGER]: "bg-[var(--color-red)]",
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
            <img src={icon} alt="" className={customIconSize ?? `w-[12px] h-[12px]`} />
        </button>
    );
};

export default CircleButton;
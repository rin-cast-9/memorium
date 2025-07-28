import { ButtonSize, ButtonType } from "@/utils/Button.types";

type ButtonProps = {
    label: string;
    size?: ButtonSize;
    type?: ButtonType;
    htmlType?: "button" | "submit";
    onClick?: () => void;
    icon?: React.ReactNode;
    className?: string;
};

const Button = ({
    label,
    size = ButtonSize.NORMAL,
    type = ButtonType.PRIMARY,
    htmlType = "button",
    onClick,
    icon,
    className = "",
}: ButtonProps) => {
    const baseStyles = "flex items-center justify-center whitespace-nowrap font-bold-content text-[var(--color-white)] hover:cursor-pointer";

    const sizeStyles: Record<ButtonSize, string> = {
        [ButtonSize.NORMAL]: "min-w-[180px] h-[45px] rounded-[15px] px-[20px] text-content-bold",
        [ButtonSize.MEDIUM]: "min-w-[140px] h-[42px] rounded-[12px] px-[15px] font-small-text",
        [ButtonSize.SMALL]: "min-w-[100px] h-[30px] rounded-[10px] px-[10px] font-small-text",
    };

    const typeStyles: Record<ButtonType, string> = {
        [ButtonType.PRIMARY]: "bg-[var(--color-violet)]",
        [ButtonType.SECONDARY]: "bg-[var(--color-violet)]/50",
        [ButtonType.GHOST]: "bg-[var(--color-violet)]/30",
        [ButtonType.STROKE]: "bg-[var(--color-stroke)]/50",
        [ButtonType.DANGER]: "bg-[var(--color-red)]",
        [ButtonType.DISABLED]: "bg-[var(--color-violet)]/20 cursor-not-allowed opacity-50 pointer-events-none",
        [ButtonType.NEUTRAL]: "bg-[var(--color-black-1)] border border-[var(--color-stroke)]",
    };

    const iconMargin: Record<ButtonSize, string> = {
        [ButtonSize.NORMAL]: "mr-[10px]",
        [ButtonSize.MEDIUM]: "mr-[10px]",
        [ButtonSize.SMALL]: "mr-[4px]"
    }

    const selectedSize = sizeStyles[size];
    const selectedStyle = typeStyles[type];
    const selectedIconMargin = iconMargin[size];

    return (
        <button
            type={htmlType}
            className={`${baseStyles} ${selectedSize} ${selectedStyle} ${className}`}
            onClick={onClick}
            disabled={type === ButtonType.DISABLED}
        >
            {icon && <span className={`${selectedIconMargin} w-[16px] h-[16px]`}>{icon}</span>}
            {label}
        </button>
    );
};

export default Button;
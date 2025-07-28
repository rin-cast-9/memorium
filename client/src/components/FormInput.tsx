type FormInputProps = {
    id?: string;
    className?: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: ((e: React.ChangeEvent<HTMLInputElement>) => void);
    error?: string;
    success?: boolean;
    successMessage?: string;
    label?: string;
    icon?: React.ReactNode;
    onIconClick?: () => void;
    forgotPasswordLink?: string;
};

const FormInput = ({
    id,
    className = "",
    type,
    placeholder,
    value,
    onChange,
    error,
    success,
    successMessage,
    label,
    icon,
    onIconClick,
    forgotPasswordLink,
}: FormInputProps) => {
    const borderClass = error
        ? "border-[var(--color-error)]"
        : success
            ? "border-[var(--color-green-border)]"
            : "border-[var(--color-stroke)] focus-within:border-[var(--color-violet)]";

    return (
        <div className={`flex flex-col gap-1 w-full ${className}`}>
            <div className="flex justify-between w-full mb-[10px]">
                {label && (
                    <label
                        htmlFor={id}
                        className="font-small-text text-[var(--color-grey)] inline-block"
                    >
                        {label}
                    </label>
                )}
                {forgotPasswordLink && (
                    <a
                        href={forgotPasswordLink}
                        className="font-small-text text-[var(--color-violet)]/80"
                    >
                        Forgot password?
                    </a>
                )}
            </div>
            <div
                className={`relative flex w-full mb-[10px] items-center rounded-[12px] bg-[var(--color-black-1)] border ${borderClass}`}
            >
                <input
                    id={id}
                    className={`flex-grow bg-transparent rounded-[12px] outline-none font-small-text text-[var(--color-white)] placeholder:text-[var(--color-grey)] pl-[15px] h-[45px]`}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required
                />
                {icon && (
                    <button
                        type="button"
                        onClick={onIconClick}
                        className="absolute right-[15px] hover:cursor-pointer"
                    >
                        {icon}
                    </button>
                )}
            </div>
            {error && (
                <span className="font-small-text text-[var(--color-error)]">
                    {error}
                </span>
            )}
            {successMessage && (
                <span className="font-small-text text-[var(--color-green-border)]">
                    {successMessage}
                </span>
            )}
        </div>
    );
};

export default FormInput;
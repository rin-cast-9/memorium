type CheckboxProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    children?: React.ReactNode;
    className?: string;
};

const Checkbox = ({
    checked,
    onChange,
    children,
    className = "",
}: CheckboxProps) => {
    return (
        <label className={`inline-flex items-center gap-[10px] cursor-pointer ${className}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="hidden peer"
            />
            <span
                className={`w-[14px] h-[14px] rounded-[4px] bg-[var(--color-black-1)] flex items-center justify-center`}
            >
                {checked && (
                    <img src="/icons/icon-check.svg" alt="checked" className="w-[9.8px] h-[7px]"/>
                )}
            </span>
            {children}
        </label>
    );
};

export default Checkbox;
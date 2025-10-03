import FormInput from "./FormInput";

type TermInputProps = {
    value: string;
    setValue: (v: string) => void;
    placeholder: string;
    icon?: string;
    onIconClick?: () => void;
    className?: string;
};

const TermInput = ({
    value,
    setValue,
    placeholder,
    icon,
    onIconClick,
    className,
}: TermInputProps) => {
    return (
        <FormInput
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={e => setValue(e.target.value)}
            icon={
                icon ? (
                    <img src={icon} alt="translate" className="w-[16px] h-[16px]"/>
                ) : null
            }
            onIconClick={onIconClick}
            className={className}
        />
    )
};

export default TermInput;
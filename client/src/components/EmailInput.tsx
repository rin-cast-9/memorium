import FormInput from "./FormInput";

type EmailInputProps = {
    id?: string;
    className?: string;
    placeholder: string;
    value: string;
    onChange: ((e: React.ChangeEvent<HTMLInputElement>) => void);
    error?: React.ReactNode;
    success?: boolean;
    label?: string;
};

const EmailInput = ({
    id,
    className = "",
    placeholder,
    value,
    onChange,
    error,
    success,
    label
}: EmailInputProps) => {
    return (
        <FormInput
            id={id}
            className={className}
            type="email"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            error={error}
            success={success}
            label={label}
        />
    );
};

export default EmailInput;
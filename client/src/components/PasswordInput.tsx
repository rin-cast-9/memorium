import { useState } from "react";
import FormInput from "./FormInput";

type PasswordInputProps = {
    value: string;
    setValue: (v: string) => void;
    validate?: (v: string) => string | null;
    placeholder: string;
    label: string;
    showValidation?: boolean;
    error?: string;
    success?: boolean;
    forgotPasswordLink?: string;
    className?: string;
};

const PasswordInput = ({
    value,
    setValue,
    validate,
    placeholder,
    label,
    showValidation = false,
    error,
    success,
    forgotPasswordLink,
    className = "",
}: PasswordInputProps) => {
    const [internalError, setInternalError] = useState <string | null> (null);
    const [visible, setVisible] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setValue(v);

        if (showValidation && validate) {
            setInternalError(validate(v));
        }
    };

    const icon = (
        <img 
            src={visible ? "/icons/icon-hide.svg" : "/icons/icon-show.svg"}
            alt={visible ? "Hide" : "Show"}
        />
    );

    return (
        <FormInput
            type={visible ? "text" : "password"}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            error={error ?? internalError ?? undefined}
            label={label}
            icon={icon}
            onIconClick={() => setVisible((prev) => !prev)}
            success={success}
            forgotPasswordLink={forgotPasswordLink}
            className={className}
        />
    );

};

export default PasswordInput;
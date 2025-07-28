import { useState } from "react";
import FormInput from "./FormInput";

type ValidatedInputProps = {
    value: string;
    setValue: (v: string) => void;
    validate: (v: string) => string | null;
    type: string;
    placeholder: string;
    label: string;
    showSuccess?: boolean;
    className?: string;
    serverError?: string | null;
};

const ValidatedInput = ({
    value,
    setValue,
    validate,
    type,
    placeholder,
    label,
    showSuccess = false,
    className = "",
    serverError,
}: ValidatedInputProps) => {
    const [error, setError] = useState<string | null> (null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setValue(v);
        setError(validate(v));
    };

    const isSuccess = showSuccess && value.length > 0 && !error;
    const finalError = serverError ?? error;

    return (
        <FormInput
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            error={finalError ?? undefined}
            success={isSuccess}
            label={label}
            className={className}
        />
    );
};

export default ValidatedInput;
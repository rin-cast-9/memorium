"use client";

import { useState } from "react";
import FormInput from "./FormInput";
import { useTranslations } from "next-intl";

type ValidatedInputProps = {
    value: string;
    setValue: (v: string) => void;
    validate: (v: string, t: (key: string) => string) => string | null;
    type: string;
    placeholder: string;
    label?: string;
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
    const t = useTranslations();

    // const [error, setError] = useState<string | null> (null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setValue(v);
        // setError(validate(v, t));
    };

    // const isSuccess = showSuccess && value.length > 0 && !error;
    const finalError = serverError;

    return (
        <FormInput
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            error={finalError ?? undefined}
            label={label}
            className={className}
        />
    );
};

export default ValidatedInput;
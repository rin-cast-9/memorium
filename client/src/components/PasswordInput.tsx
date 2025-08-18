"use client";

import { useState } from "react";
import FormInput from "./FormInput";
import { useTranslations } from "next-intl";

type PasswordInputProps = {
    value: string;
    setValue: (v: string) => void;
    validate?: (v: string, t: (key: string) => string) => string | null;
    placeholder: string;
    label: string;
    showValidation?: boolean;
    showSuccess?: boolean;
    error?: string;
    forgotPasswordLink?: string;
    className?: string;
};

const PasswordInput = ({
    value,
    setValue,
    validate = (v: string, t: (key: string) => string) => {
        if (v.length === 0) {
            return (t("errors.PASSWORD_EMPTY"));
        }
        if (v.length < 8) {
            return t("errors.PASSWORD_TOO_SHORT");
        }
        return null;
    },
    placeholder,
    label,
    showValidation = true,
    showSuccess,
    error,
    forgotPasswordLink,
    className = "",
}: PasswordInputProps) => {
    const t = useTranslations();

    const [internalError, setInternalError] = useState <string | null> (null);
    const [visible, setVisible] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setValue(v);

        if (showValidation && validate) {
            setInternalError(validate(v, t));
        }
    };

    const icon = (
        <img 
            src={visible ? "/icons/icon-hide.svg" : "/icons/icon-show.svg"}
            alt={visible ? "Hide" : "Show"}
        />
    );

    const success = showSuccess && !error && !internalError;

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
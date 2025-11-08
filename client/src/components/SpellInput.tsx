"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

interface SpellInputProps {
    value: string;
    setValue: (v: string) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    locked?: boolean;
    feedback?: "correct" | "wrong" | null;
    onAnswered?: (value: string) => void;
};
    
const SpellInput = ({
    value,
    setValue,
    onKeyDown,
    locked,
    feedback,
    onAnswered,
}: SpellInputProps) => {
    const t = useTranslations();

    const [isFocused, setIsFocused] = useState(false);

    let borderColor = "var(--color-stroke)";

    if (feedback === "correct") {
        borderColor = "var(--color-green-border)";
    } else if (feedback === "wrong") {
        borderColor = "var(--color-red)";
    } else if (isFocused && !locked) {
        borderColor = "var(--color-violet)";
    }

    return (
        <input
            type="text"
            value={value}
            onChange={(e) => {
                const newValue = e.target.value;
                setValue(newValue);
                onAnswered?.(newValue)
            }}
            onKeyDown={onKeyDown}
            placeholder={t("enterCorrectAnswer")}
            disabled={locked}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full h-[45px] rounded-[12px] bg-[var(--color-black-1)] border border-[var(--color-stroke)] px-[20px] text-[var(--color-white)] font-small-text outline-none`}
            style={{ borderColor }}
        />
    );
};

export default SpellInput;
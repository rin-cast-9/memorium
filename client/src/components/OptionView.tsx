"use client";

interface OptionViewProps {
    value: string;
    onClick: (value: string) => void;
    selected: boolean;
    feedback: "correct" | "wrong" | null;
    isCorrect: boolean;
    locked: boolean;
};

const OptionView = ({
    value,
    onClick,
    selected,
    feedback,
    isCorrect,
    locked,
}: OptionViewProps) => {

    let borderColor = "var(--color-stroke)";

    if (selected && feedback === null) {
        borderColor = "var(--color-violet)";
    }

    if (feedback === "correct" && selected) {
        borderColor = "var(--color-green-border)";
    }

    if (feedback === "wrong") {
        if (selected) {
            borderColor = "var(--color-red)";
        }

        if (isCorrect) {
            borderColor = "var(--color-green-border)";
        }
    }

    return (
        <button
            onClick={() => !locked && onClick(value)}
            className={`h-[45px] w-full bg-[var(--color-black-1)] border rounded-[12px] px-[15px] flex items-center justify-between`}
            style={{ borderColor }}
        >
            {value}
        </button>
    )
};

export default OptionView;
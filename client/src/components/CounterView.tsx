import { useTranslations } from "next-intl";

interface CounterViewProps {
    value: number;
    isCorrect: boolean;
};

const CounterView = ({
    value,
    isCorrect,
}: CounterViewProps) => {
    const t = useTranslations();

    return (
        <div className="flex items-center gap-[12px] bg-[var(--color-black-1)] rounded-[15px] pl-[25px] h-[80px] w-[240px]">
            <span className={`font-h2 ${isCorrect ? "text-[var(--color-green-border)]" : "text-[var(--color-red)]"}`}>
                {value}
            </span>
            <div className="w-[1px] h-[30px] bg-[var(--color-stroke)]"/>
            <span className="text-[var(--color-white)] font-content">
                {isCorrect ? t("correct") : t("incorrect")}
            </span>
        </div>
    );
};

export default CounterView;
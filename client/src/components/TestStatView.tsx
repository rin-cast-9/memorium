"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import CircleProgressView from "./CircleProgressView";
import CounterView from "./CounterView";
import Button from "./Button";
import { ButtonSize, ButtonType } from "@/utils/Button.types";

interface TestStatViewProps {
    correct: number;
    total: number;
}

const TestStatView = ({
    correct,
    total,
}: TestStatViewProps) => {
    const t = useTranslations();
    const router = useRouter();
    const percentage = total > 0 ? (correct / total) * 100 : 0;
    const incorrect = total - correct;

    return (
        <div className="mt-[50px] mx-[130px]">
            <div className="h-[460px] py-[60px] bg-[var(--color-black-3)] rounded-[20px] border border-[var(--color-stroke)] flex flex-col items-center justify-center gap-[40px]">
                <div className="text-[var(--color-white)] font-h2">
                    {t("congratulations")}
                </div>

                <div className="flex items-center gap-[62px]">
                    <CircleProgressView
                        value={Math.round(percentage)}
                    />

                    <div className="flex flex-col gap-[15px]">
                        <CounterView
                            value={correct}
                            isCorrect={true}
                        />
                        <CounterView
                            value={incorrect}
                            isCorrect={false}
                        />
                    </div>
                </div>

                <Button
                    label={t("backToLibrary")}
                    size={ButtonSize.NORMAL}
                    type={ButtonType.PRIMARY}
                    onClick={() => router.push("/library")}
                />
            </div>
        </div>
    );
};

export default TestStatView;
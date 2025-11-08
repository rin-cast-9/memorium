"use client";

import { QuestionPayload } from "@/utils/QuestionPayload";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import OptionsGrid from "./OptionsGrid";
import SpellInput from "./SpellInput";

interface QuestionViewProps {
    question: QuestionPayload;
    mode?: "standalone" | "test";
    onAnswered?: (card: QuestionPayload, answer: string, isCorrect?: boolean) => void;
};

const QuestionView = ({
    question,
    mode = "test",
    onAnswered,
}: QuestionViewProps) => {
    const t = useTranslations();

    const [selected, setSelected] = useState<string | null>(null);
    const [value, setValue] = useState("");
    const [locked, setLocked] = useState(false);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

    useEffect(() => {
        setSelected(null);
        setValue("");
        setFeedback(null);
        setLocked(false);
    }, [question]);

    const handleSelect = (option: string) => {
        if (locked) {
            return;
        }

        setSelected(option);

        if (mode === "standalone") {
            const isCorrect = option === question.answer;
            setFeedback(isCorrect ? "correct" : "wrong");
            setLocked(true);
            onAnswered?.(question, option, isCorrect);
        } else if (mode === "test") {
            onAnswered?.(question, option);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (locked || mode !== "standalone") {
            return;
        }

        if (e.key === "Enter") {
            if (mode === "standalone") {
                const isCorrect = value.trim().toLowerCase() === question.answer.trim().toLowerCase();
                setFeedback(isCorrect ? "correct" : "wrong");
                setLocked(true);
                onAnswered?.(question, value, isCorrect);
            } else if (mode === "test") {
                onAnswered?.(question, value);
            }
        }
    };

    let label = question.question_type_id === 1 ? t("chooseCorrectAnswer") : t("yourAnswer");
    let labelColor = "var(--color-grey)";

    if (mode === "standalone") {
        if (feedback === "correct") {
            label = t("greatKeepItUp");
            labelColor = "var(--color-green-border)";
        } else if (feedback === "wrong") {
            label = t("tryAgain");
            labelColor = "var(--color-red)";
        }
    }

    return (
        <div className="h-[285px] bg-[var(--color-black-2)] rounded-[20px] border border-[var(--color-stroke)] px-[40px] py-[30px] flex flex-col justify-between">
            <p className="font-h2">{question.prompt}</p>

            <div>
                <p
                    className="font-small-text mb-[15px]"
                    style={{ color: labelColor }}
                >
                    {label}
                </p>

                {question.question_type_id === 1 && (
                    <OptionsGrid
                        options={question.options}
                        onSelect={handleSelect}
                        selected={selected}
                        feedback={feedback}
                        correctAnswer={question.answer}
                        locked={locked}
                    />
                )}

                {question.question_type_id === 2 && (
                    <SpellInput
                        value={value}
                        setValue={setValue}
                        onKeyDown={handleKeyDown}
                        locked={locked}
                        feedback={feedback}
                        onAnswered={(val: string) => {
                            if (mode === "test") {
                                onAnswered?.(question, val);
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default QuestionView;
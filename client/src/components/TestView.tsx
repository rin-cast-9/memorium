"use client";

import { finishTestApi, startTestApi } from "@/utils/ApiRequests";
import { QuestionPayload } from "@/utils/QuestionPayload";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import QuestionView from "./QuestionView";
import Button from "./Button";
import { useTranslations } from "next-intl";
import { ButtonSize, ButtonType } from "@/utils/Button.types";

interface TestViewProps {
    moduleId: number;
    isReviewOnly: boolean;
};

const TestView = ({
    moduleId,
    isReviewOnly,
}: TestViewProps) => {
    const router = useRouter();
    const t = useTranslations();

    const [questions, setQuestions] = useState<QuestionPayload[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [testId, setTestId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTest = async () => {
            const { data, error } = await startTestApi(moduleId, isReviewOnly);
            if (error || !data) {
                console.error(error?.error);
                return;
            }

            setTestId(data.test.id);
            setQuestions(data.payload);
            setLoading(false);
        };

        fetchTest();
    }, [moduleId, isReviewOnly]);

    const handleAnswer = (questionId: number, answer: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    const handleSubmit = async () => {
        if (!testId) {
            return;
        }

        const formattedAnswers = Object.entries(answers).map(([qid, text]) => ({
            question_id: Number(qid),
            answered_text: text,
        }));

        const { data, error } = await finishTestApi(testId, formattedAnswers);
        if (error) {
            console.error(error);
            return;
        }

        sessionStorage.setItem("testSummary", JSON.stringify(data));
        router.push(`/test/summary`);
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <div className="mt-[50px] mx-[130px] flex flex-col gap-[20px]">
                {questions.map(q => (
                    <QuestionView
                        key={q.question_id}
                        question={q}
                        mode="test"
                        onAnswered={(question, answer) => handleAnswer(question.question_id, answer)}
                    />
                ))}

                <Button
                    label={t("finishTest")}
                    size={ButtonSize.NORMAL}
                    type={ButtonType.PRIMARY}
                    onClick={handleSubmit}
                    className="self-center mt-[10px]"
                />
            </div>
        </>
    );
};

export default TestView;
"use client";

import { useEffect, useState } from "react";
import TestStatView from "./TestStatView";
import { IncorrectQuestionInfo } from "@/utils/IncorrectQuestionInfo";
import TestFeedbackView from "./TestFeedbackView";

const TestSummaryView = () => {
    const [summary, setSummary] = useState<{ correct: number, total: number, incorrect_questions: IncorrectQuestionInfo[] } | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem("testSummary");
        if (stored) {
            setSummary(JSON.parse(stored));
        }
    }, []);

    if (!summary) {
        return null;
    }

    const { correct, total, incorrect_questions } = summary;

    return (
        <div className="flex flex-col gap-[50px]">
            <TestStatView
                correct={correct}
                total={total}
            />
            <TestFeedbackView
                incorrectQuestions={incorrect_questions}
            />
        </div>
    );
};

export default TestSummaryView;
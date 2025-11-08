"use client";

import TestView from "@/components/TestView";
import { useSearchParams } from "next/navigation";

const TestPage = () => {
    const params = useSearchParams();
    const moduleId = params.get("moduleId");
    const isReviewOnly = params.get("isReviewOnly");

    if (!moduleId || !isReviewOnly) {
        return <p>Invalid parameters</p>;
    }

    return (
        <TestView
            moduleId={Number(moduleId)}
            isReviewOnly={Boolean(isReviewOnly)}
        />
    );
};

export default TestPage;
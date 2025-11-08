"use client";

import ReviewView from "@/components/ReviewView";
import { useSearchParams } from "next/navigation";

const ReviewPage = () => {
    const params = useSearchParams();
    const moduleId = params.get("moduleId");
    const mode = params.get("mode");

    if (!moduleId || !mode) {
        return <p>Invalid parameters</p>;
    }

    return (
        <ReviewView
            moduleId={Number(moduleId)}
            mode={Number(mode)}
        />
    );
}

export default ReviewPage;
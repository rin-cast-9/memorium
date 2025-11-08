"use client";

import QuestionView from "@/components/QuestionView";
import { finishReviewApi, startReviewApi } from "@/utils/ApiRequests";
import { QuestionPayload } from "@/utils/QuestionPayload";
import { ReviewResult } from "@/utils/ReviewResult";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ReviewViewProps {
    moduleId: number;
    mode: number;
};

const ReviewView = ({
    moduleId,
    mode,
}: ReviewViewProps) => {
    const router = useRouter();

    const [cards, setCards] = useState<QuestionPayload[]>([]);
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [statuses, setStatuses] = useState<Record<number, { correct: number, incorrect: number }>>({});

    useEffect(() => {
        const fetchCards = async () => {
            const { data, error } = await startReviewApi(moduleId, mode);
            if (error) {
                console.error(error.error);
                return;
            }

            if (!data) {
                console.warn("no data");
                return;
            }
            
            setCards(data.payload);
            setLoading(false);
        };

        fetchCards();
    }, [moduleId, mode]);

    useEffect(() => {
        console.log("cards JSON", JSON.stringify(cards));
    }, [cards]);

    const handleFinish = async () => {
        const reviewResults = Object.entries(statuses).map(([cardId, s]) => ({
            card_id: Number(cardId),
            correct_count: s.correct,
            incorrect_count: s.incorrect,
        } satisfies ReviewResult));

        console.log(reviewResults);
        if (reviewResults.length === 0 || reviewResults.some(r => isNaN(r.card_id))) {
            console.error("Invalid reviewResults", reviewResults);
            return;
        }

        await finishReviewApi(moduleId, reviewResults);
    };

    useEffect(() => {
        if (index >= cards.length && cards.length > 0) {
            handleFinish().then(() => router.push(`/library/module/${moduleId}`));
        }
    }, [index, cards.length]);

    if (loading || !cards[index]) {
        return <p>Loading...</p>;
    }

    const currentCard = cards[index];

    const handleAnswered = (card: QuestionPayload, _answer: string, isCorrect?: boolean) => {
        setStatuses(prev => ({
            ...prev,
            [card.card_id]: {
                correct: (prev[card.card_id]?.correct ?? 0) + (isCorrect ? 1 : 0),
                incorrect: (prev[card.card_id]?.incorrect ?? 0) + (isCorrect ? 0 : 1),
            },
        }));

        if (!isCorrect) {
            setCards(prev => [...prev, card]);
        }

        setTimeout(() => {
            setIndex(i => i + 1);
        }, 3000);
    };

    return (
        <div className="mt-[50px] mx-[130px]">
            <QuestionView
                key={index}
                question={currentCard}
                mode="standalone"
                onAnswered={handleAnswered}
            />
        </div>
    );
};

export default ReviewView;
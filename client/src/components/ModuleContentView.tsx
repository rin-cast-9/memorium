"use client";

import { getModuleApi, getProgressByModuleApi, listCardsByModuleApi, startReviewApi, startTestApi } from "@/utils/ApiRequests";
import { Card } from "@/utils/Card";
import { Module } from "@/utils/Module";
import { useEffect, useState } from "react";
import Button from "./Button";
import { useTranslations } from "next-intl";
import { ButtonSize, ButtonType } from "@/utils/Button.types";
import { useRouter } from "next/navigation";
import CircleButton from "./CircleButton";
import CardView from "./CardView";
import CardGridView from "./CardGridView";
import { TestMode } from "@/utils/TestMode";

type ModuleContentViewProps = {
    moduleId: number;
}

const ModuleContentView = ({
    moduleId
}: ModuleContentViewProps) => {
    const t = useTranslations();
    const router = useRouter();

    const [cards, setCards] = useState<Card[]>([]);
    const [progress, setProgress] = useState<Record<number, number>>({});
    const [categorizedCards, setCategorizedCards] = useState<{
        new: Card[];
        review: Card[];
        learned: Card[];
    }>({ new: [], review: [], learned: [] });

    const [index, setIndex] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            const [{ data: cardData }, { data: progressData }] = await Promise.all([
                listCardsByModuleApi(moduleId),
                getProgressByModuleApi(moduleId),
            ]);

            const fetchedCards = cardData?.map(c => ({
                id: c.id,
                front: c.front,
                back: c.back,
            } satisfies Card)) ?? [];

            setCards(fetchedCards);
            setProgress(progressData ?? {});

            const categorized = {
                new: fetchedCards.filter(c => progressData?.[c.id] === 1),
                review: fetchedCards.filter(c => progressData?.[c.id] === 2),
                learned: fetchedCards.filter(c => progressData?.[c.id] === 3),
            };
            setCategorizedCards(categorized);
        };

        fetchData();
    }, [moduleId]);

    const handleStartTest = async (moduleId: number) => {
        router.push(`/test?moduleId=${moduleId}&isReviewOnly=false`);
    };

    const handleStartReview = async (moduleId: number, mode: TestMode) => {
        router.push(`/review?moduleId=${moduleId}&mode=${mode}`);
    };

    return (
        <div className="mt-[50px] mx-[130px] mb-[97px] flex flex-col">
            <div className="flex items-center justify-between">
                <Button
                    label={t("backToLibrary")}
                    size={ButtonSize.SMALL}
                    type={ButtonType.GHOST}
                    htmlType="button"
                    onClick={() => router.push("/library")}
                    icon={
                        <img src="/icons/icon-arrow-left.svg" alt="back"/>
                    }
                />

                <CircleButton
                    type={ButtonType.DANGER}
                    onClick={() => {}}
                    icon="/icons/icon-menu.svg"
                    customIconSize="w-[24px] h-[6px]"
                />
            </div>
            {cards.length > 0 && (
                <CardView
                    card={cards[index]}
                    onPrev={() => setIndex(i => (i === 0 ? cards.length - 1 : i - 1))}
                    onNext={() => setIndex(i => (i === cards.length - 1 ? 0 : i + 1))}
                />
            )}
            <div className="mt-[24px] flex justify-center gap-[20px]">
                <Button
                    label={t("learnModule")}
                    size={ButtonSize.NORMAL}
                    type={ButtonType.PRIMARY}
                    onClick={() => handleStartReview(moduleId, TestMode.All)}
                />

                <Button
                    label={t("takeTest")}
                    size={ButtonSize.NORMAL}
                    type={ButtonType.SECONDARY}
                    onClick={() => handleStartTest(moduleId)}
                />
            </div>

            <div className="mt-[100px] flex flex-col gap-[60px]">
                {categorizedCards.new.length > 0 && (
                    <CardGridView
                        label={t("new")}
                        buttonLabel={t("learnWords")}
                        cards={categorizedCards.new}
                        onButtonClick={() => handleStartReview(moduleId, TestMode.New)}
                    />
                )}

                {categorizedCards.review.length > 0 && (
                    <CardGridView
                        label={t("needReview")}
                        buttonLabel={t("reviewWords")}
                        cards={categorizedCards.review}
                        onButtonClick={() => handleStartReview(moduleId, TestMode.NeedReview)}
                    />
                )}

                {categorizedCards.learned.length > 0 && (
                    <CardGridView
                        label={t("learned")}
                        buttonLabel={t("reviewWords")}
                        cards={categorizedCards.learned}
                        onButtonClick={() => handleStartReview(moduleId, TestMode.Learned)}
                    />
                )}
            </div>
        </div>
    );
};

export default ModuleContentView;
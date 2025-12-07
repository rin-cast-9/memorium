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
import Modal from "./Modal";
import { ModalTitleAlignment } from "@/utils/ModalTitleAlignment";
import ToggleSwitch from "./ToggleSwitch";

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

    const [isTestSettingModalOpen, setIsTestSettingModalOpen] = useState(false);
    const [isReviewOnly, setIsReviewOnly] = useState(false);
    const handleToggle = () => setIsReviewOnly(prev => !prev);

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

    const handleStartTest = async (moduleId: number, isReviewOnly = false) => {
        router.push(`/test?moduleId=${moduleId}&isReviewOnly=${isReviewOnly}`);
    };

    const handleStartReview = async (moduleId: number, mode: TestMode) => {
        router.push(`/review?moduleId=${moduleId}&mode=${mode}`);
    };

    return (
        <>
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
                        onClick={() => setIsTestSettingModalOpen(true)}
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

            {isTestSettingModalOpen && 
                <Modal
                    title={t("testSetting")}
                    titleAlign={ModalTitleAlignment.LEFT}
                    onClose={() => setIsTestSettingModalOpen(false)}
                >
                    <div className="flex flex-col gap-[25px]">
                        <ToggleSwitch
                            isOn={isReviewOnly}
                            onToggle={handleToggle}
                            label={t("reviewOnlyTest")}
                        />
                        <Button
                            label={t("startTest")}
                            size={ButtonSize.NORMAL}
                            type={ButtonType.PRIMARY}
                            onClick={() => handleStartTest(moduleId, isReviewOnly)}
                        />
                    </div>
                </Modal>
            }
        </>
    );
};

export default ModuleContentView;
"use client";

import { getModuleApi, listCardsByModuleApi } from "@/utils/ApiRequests";
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

type ModuleContentViewProps = {
    moduleId: number;
}

const ModuleContentView = ({
    moduleId
}: ModuleContentViewProps) => {
    const t = useTranslations();
    const router = useRouter();

    const [module, setModule] = useState<Module | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const fetchModule = async () => {
            const { data } = await getModuleApi(moduleId);
            setModule(data ?? null);
        };

        const fetchCards = async () => {
            const { data } = await listCardsByModuleApi(moduleId);
            const fetchedCards = data?.map(c => ({
                id: c.id,
                front: c.front,
                back: c.back,
            } satisfies Card)) ?? [];
            setCards(fetchedCards);
        };

        fetchModule();
        fetchCards();
    }, []);

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
                    onClick={() => {}}
                />

                <Button
                    label={t("takeTest")}
                    size={ButtonSize.NORMAL}
                    type={ButtonType.SECONDARY}
                    onClick={() => {}}
                />
            </div>

            <div className="mt-[100px]">
                <CardGridView
                    cards={cards}
                />
            </div>
        </div>
    );
};

export default ModuleContentView;
"use client";

import { useTranslations } from "next-intl";
import Button from "./Button";
import { ButtonSize, ButtonType } from "@/utils/Button.types";
import ModuleName from "./ModuleName";
import { useState } from "react";
import { Card, CardApi } from "@/utils/Card";
import { Module } from "@/utils/Module";
import { createCardApi, createModuleApi, deleteCardApi, editCardApi } from "@/utils/ApiRequests";
import { useRouter } from "next/navigation";
import CardGridEditView from "./CardGridEditView";

type ModuleEditViewProps = {
    existingModule?: Module;
    existingCards?: CardApi[];
};

const ModuleEditView = ({
    existingModule,
    existingCards = [],
}: ModuleEditViewProps) => {
    const t = useTranslations();
    const router = useRouter();

    const isEdit = !!existingModule;

    const [moduleDisplayName, setModuleDisplayName] = useState(
        existingModule?.display_name ?? ""
    );

    const [cards, setCards] = useState<Card[]>(() => {
        let baseCards: Card[];

        if (isEdit && existingCards.length > 0) {
            baseCards = existingCards.map(c => ({
                id: c.id,
                front: c.front,
                back: c.back,
            }));
        }
        else {
            baseCards = Array.from({ length: 8 }, () => ({ front: "", back: "" }));
        }

        if (baseCards.length % 2 !== 0) {
            baseCards.push({ front: "", back: "" });
        }

        return baseCards;
    });

    const addCards = () => {
        setCards(prev => [
            ...prev,
            { front: "", back: "" },
            { front: "", back: "" },
        ]);
    };

    const handleCreateModule = async () => {
        if (!moduleDisplayName.trim()) {
            return;
        }

        try {
            const { data: newModule, error } = await createModuleApi(moduleDisplayName.trim());
            if (error || !newModule) {
                console.error("Failed to create module", error);
                return;
            }

            for (const card of cards) {
                if (card.front.trim()) {
                    const { error } = await createCardApi(newModule.id, card.front.trim(), card.back.trim());
                    if (error) {
                        console.error("Failed to create card", error);
                    }
                }
            }
        }
        catch (e) {
            alert(e);
        }
    };

    const handleUpdateModule = async () => {
        if (!existingModule) {
            return;
        }

        for (const card of cards) {
            // new card
            if (!card.id && card.front.trim()) {
                await createCardApi(existingModule.id, card.front, card.back);
                continue;
            }

            // deleted card
            if (card.id && !card.front.trim()) {
                await deleteCardApi(card.id);
                continue;
            }

            // edited card
            if (card.id && card.front.trim()) {
                const original = existingCards.find(c => c.id === card.id);
                if (original && (original.front !== card.front || original.back !== card.back)) {
                    await editCardApi(card.id, card.front, card.back);
                }

                continue;
            }
        }
    };

    const handleSubmit = async () => {
        if (isEdit) {
            await handleUpdateModule();
        }
        else {
            await handleCreateModule();
        }

        router.push("/library");
    };

    return (
        <div className="mt-[50px] mx-[130px] flex flex-col gap-[20px] mb-[97px]">
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
            </div>
            <ModuleName
                displayName={moduleDisplayName}
                setDisplayName={setModuleDisplayName}
            />
            <CardGridEditView
                cards={cards}
                updateCard={(index, changes) => {
                    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, ...changes } : c)));
                }}
                addCards={addCards}
            />
            <div className="flex justify-center">
                <Button
                    label={isEdit ? t("save") : t("createModule")}
                    size={ButtonSize.NORMAL}
                    type={moduleDisplayName.trim() ? ButtonType.PRIMARY : ButtonType.DISABLED}
                    htmlType="button"
                    onClick={handleSubmit}
                    className="mt-[10px]"
                />
            </div>
        </div>
    );
};

export default ModuleEditView;
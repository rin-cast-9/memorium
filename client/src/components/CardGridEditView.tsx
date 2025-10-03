"use client";

import { useTranslations } from "next-intl";
import CircleButton from "./CircleButton";
import { ButtonType } from "@/utils/Button.types";
import { Card } from "@/utils/Card";
import CardEditView from "./CardEditView";

type CardGridEditViewProps = {
    cards: Card[];
    updateCard: (index: number, changes: Partial<Card>) => void;
    addCards: () => void;
};

const CardGridEditView = ({
    cards,
    updateCard,
    addCards,
}: CardGridEditViewProps) => {
    const t = useTranslations();

    return (
        <div className="grid grid-cols-2 gap-[20px]">
            {cards.map((c, i) => (
                <CardEditView
                    key={i}
                    index={i}
                    card={c}
                    updateCard={updateCard}
                />
            ))}
            <div
                className="col-span-2 border border-[var(--color-stroke)] h-[142px] rounded-[20px] bg-[var(--color-black-2)] flex flex-col items-center justify-between pt-[33px] pb-[34px] mt-[10px]"
            >
                <p className="font-content text-[var(--color-white)]">{t("addCards")}</p>
                <CircleButton
                    type={ButtonType.SECONDARY}
                    onClick={addCards}
                    icon="/icons/icon-plus.svg"
                />
            </div>
        </div>
    );
};

export default CardGridEditView;
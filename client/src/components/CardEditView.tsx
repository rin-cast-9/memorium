"use client";

import { ButtonSize, ButtonType } from "@/utils/Button.types";
import CircleButton from "./CircleButton";
import { useTranslations } from "next-intl";
import TermInput from "./TermInput";
import { Card } from "@/utils/Card";

type CardEditViewProps = {
    index: number;
    card: Card;
    updateCard: (index: number, changes: Partial<Card>) => void;
};

const CardEditView = ({
    index,
    card,
    updateCard,
}: CardEditViewProps) => {
    const t = useTranslations();

    return (
        <div key={index} className="flex flex-col justify-between bg-[var(--color-black-2)] border border-[var(--color-stroke)] rounded-[20px] h-[158px] px-[25px] pb-[15px] pt-[21px]">
            <div className="flex justify-between">
                <span className="mt-[9px] font-small-text text-[var(--color-white)]">{index + 1}</span>

                <CircleButton
                    type={ButtonType.DANGER}
                    size={ButtonSize.NORMAL}
                    onClick={() => updateCard(index, { front: "", back: "" })}
                    icon="/icons/icon-delete.svg"
                />
            </div>

            <div className="flex gap-[20px]">
                <TermInput
                    value={card.front}
                    setValue={(v) => updateCard(index, { front: v })}
                    placeholder={t("enterTerm")}
                />

                <TermInput
                    value={card.back}
                    setValue={(v) => updateCard(index, { back: v })}
                    placeholder={t("enterDefinition")}
                />
            </div>
        </div>
    );
};

export default CardEditView;
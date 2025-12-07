"use client";

import { Card } from "@/utils/Card";
import CircleButton from "./CircleButton";
import { ButtonSize, ButtonType } from "@/utils/Button.types";
import { useTranslations } from "next-intl";
import { useState } from "react";

type CardViewProps = {
    card: Card;
    onPrev: () => void;
    onNext: () => void;
};

const CardView = ({
    card,
    onPrev,
    onNext,
}: CardViewProps) => {
    const t = useTranslations();

    const [showBack, setShowBack] = useState(false);

    const handleFlip = () => {
        setShowBack(s => !s);
    };

    return (
        <div
            className="relative h-[344px] bg-[var(--color-black-2)] border border-[var(--color-stroke)] p-[30px] mt-[15px] rounded-[20px] flex items-center justify-center hover:cursor-pointer"
            onClick={handleFlip}
        >
            <p className="font-h1">
                {showBack ? card.back : card.front}
            </p>

            <div
                className="absolute left-0 top-1/2 -translate-y-1/2 ml-[30px]"
                onClick={(e) => e.stopPropagation()}
            >
                <CircleButton
                    size={ButtonSize.SMALL}
                    icon="/icons/icon-arrow-left.svg"
                    onClick={onPrev}
                />
            </div>

            <div 
                className="absolute right-0 top-1/2 -translate-y-1/2 mr-[30px]"
                onClick={(e) => e.stopPropagation()}
            >
                <CircleButton
                    size={ButtonSize.SMALL}
                    icon="/icons/icon-arrow-left.svg"
                    className="transform scale-x-[-1]"
                    onClick={onNext}
                />
            </div>

            <div
                className="absolute bottom-[30px] left-1/2 -translate-x-1/2 flex items-center gap-[10px]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* <CircleButton
                    type={ButtonType.DANGER}
                    size={ButtonSize.SMALL}
                    icon="/icons/icon-edit-2.svg"
                    customIconSize="w-[12px] h-[12px]"
                    onClick={() => {}}
                />
                <CircleButton
                    size={ButtonSize.SMALL}
                    icon="/icons/icon-sound.svg"
                    customIconSize="w-[12px] h-[11px]"
                    onClick={() => {}}
                /> */}
            </div>

            <div className="absolute bottom-[30px] right-[30px] flex items-center gap-[12px]">
                <img src="/icons/icon-click.svg" className="w-[16px] h-[16px]" />
                <span className="font-small-text text-[var(--color-grey)]/70">{t("tapCardToShowTranlsation")}</span>
            </div>
        </div>
    );
};

export default CardView;
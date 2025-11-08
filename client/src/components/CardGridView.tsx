"use client";

import { Card } from "@/utils/Card";
import TermInput from "./TermInput";
import Button from "./Button";
import { ButtonSize, ButtonType } from "@/utils/Button.types";

type CardGridViewProps = {
    label: string;
    buttonLabel: string;
    cards: Card[];
    onButtonClick: () => void;
};

const CardGridView = ({
    label,
    buttonLabel,
    cards,
    onButtonClick,
}: CardGridViewProps) => {
    return (
        <div className="flex flex-col">
            <p className="content-regular text-[var(--color-grey)]">{label} ({cards.length})</p>

            <hr className="w-full mt-[14px] border-t border-[var(--color-grey)]/20"/>

            <div className="grid grid-cols-3 gap-[20px] mt-[30px]">
                {cards.map((card) => (
                    <TermInput
                        key={card.id}
                        value={card.front}
                        setValue={() => {}}
                        placeholder=""
                        icon="/icons/icon-edit-1.svg"
                    />
                ))}
            </div>

            <div className="flex justify-center mt-[30px]">
                <Button
                    label={buttonLabel}
                    size={ButtonSize.NORMAL}
                    type={ButtonType.PRIMARY}
                    onClick={onButtonClick}
                />
            </div>
        </div>
    );
};

export default CardGridView;
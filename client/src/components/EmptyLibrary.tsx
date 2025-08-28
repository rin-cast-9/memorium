"use client";

import { useTranslations } from "next-intl";
import Button from "./Button";
import { ButtonSize, ButtonType } from "@/utils/Button.types";

type EmptyLibraryProps = {
    text: string,
    onClick: () => void,
};

const EmptyLibrary = ({
    text,
    onClick
}: EmptyLibraryProps) => {
    const t = useTranslations();

    return (
        <div className="flex flex-col gap-[20px] items-center justify-center h-[212px] rounded-[30px] bg-[var(--color-black-1)]">
            <p className="w-[410px] text-center font-content text-[var(--color-grey)]">{text}</p>
            <Button
                label={t("create")}
                size={ButtonSize.NORMAL}
                type={ButtonType.PRIMARY}
                htmlType="button"
                onClick={onClick}
            />
        </div>
    )
}

export default EmptyLibrary;
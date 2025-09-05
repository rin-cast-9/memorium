"use client";

import { useTranslations } from "next-intl";
import Button from "./Button";
import { ButtonSize, ButtonType } from "@/utils/Button.types";
import ModuleName from "./ModuleName";
import { useState } from "react";

const CreateModule = () => {
    const t = useTranslations();

    const [moduleDisplayName, setModuleDisplayName] = useState("");

    return (
        <div className="mt-[50px] mx-[130px] flex flex-col gap-[20px]">
            <div className="flex items-center justify-between">
                <Button
                    label={t("backToLibrary")}
                    size={ButtonSize.SMALL}
                    type={ButtonType.GHOST}
                    htmlType="button"
                    onClick={() => {}}
                    icon={
                        <img src="/icons/icon-arrow-left.svg" alt="back"/>
                    }
                />
                <Button
                    label={t("done")}
                    size={ButtonSize.SMALL}
                    type={ButtonType.PRIMARY}
                    htmlType="submit"
                    onClick={() => {}}
                />
            </div>
            <ModuleName
                displayName={moduleDisplayName}
                setDisplayName={setModuleDisplayName}
            />
        </div>
    );
};

export default CreateModule;
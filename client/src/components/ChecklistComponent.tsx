"use client";

import { ChecklistComponentMode } from "@/utils/ChecklistComponentMode";
import { useTranslations } from "use-intl";
import Checkbox from "./Checkbox";

type ChecklistComponentProps = 
    | { mode: ChecklistComponentMode.CREATE;
        displayName: string;
        setDisplayName: React.Dispatch<React.SetStateAction<string>>;
    }
    | { mode: ChecklistComponentMode.DISPLAY;
        id: number;
        displayName: string;
        onClick: (id: number, checked: boolean) => void;
        isSelected: boolean;
    };

const ChecklistComponent = (props: ChecklistComponentProps) => {
    const t = useTranslations();

    let innerContent;

    if (props.mode === ChecklistComponentMode.CREATE) {
        const { displayName, setDisplayName } = props;
        innerContent = (
            <>
                <img src="/icons/icon-plus-grey.svg" alt="add" className="w-[16px] h-[16px]"/>
                <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder={t("createNewModuleInFolder")}
                    className="flex-1 placeholder:font-small-text placeholder-[var(--color-grey)] outline-none"
                />
            </>
        );
    } else {
        const { id, displayName, onClick, isSelected } = props;
        innerContent = (
            <>
                <Checkbox
                    checked={isSelected}
                    onChange={(checked) => onClick(id, checked)}
                >
                    {displayName}
                </Checkbox>
            </>
        );
    }

    return (
        <div
            className="h-[45px] bg-[var(--color-black-2)] rounded-[12px] border border-[var(--color-stroke)] px-[15px] pt-[13px] pb-[14px] flex items-center gap-[8px]"
        >
            {innerContent}
        </div>
    );
};

export default ChecklistComponent;
"use client";

import { LibraryTabs } from "@/utils/LibraryTabs";
import Tab from "./Tab";
import { TabState } from "@/utils/TabState";
import { useTranslations } from "next-intl";

type LibraryTabsComponentProps = {
    activeTab: LibraryTabs;
    setActiveTab: (tab: LibraryTabs) => void;
}

const LibraryTabsComponent = ({
    activeTab,
    setActiveTab,
}: LibraryTabsComponentProps) => {
    const t = useTranslations();

    return (
        <div className="flex gap-[15px]">
            <button onClick={() => setActiveTab(LibraryTabs.FOLDERS)}>
                <Tab
                    icon="/icons/icon-folder.svg"
                    text={t("folders")}
                    state={
                        activeTab === LibraryTabs.FOLDERS
                            ? TabState.ACTIVE
                            : TabState.INACTIVE
                    }
                />
            </button>
            <button onClick={() => setActiveTab(LibraryTabs.MODULES)}>
                <Tab
                    icon="/icons/icon-module.svg"
                    text={t("modules")}
                    state={
                        activeTab === LibraryTabs.MODULES
                            ? TabState.ACTIVE
                            : TabState.INACTIVE
                    }
                />
            </button>
        </div>
    )
};

export default LibraryTabsComponent;
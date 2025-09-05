import { Module } from "@/utils/Module";
import ModuleView from "./ModuleView";

type ModulesListViewProps = {
    items: Module[];
}

const ModulesListView = ({
    items
}: ModulesListViewProps) => {
    return (
        <div className="flex flex-col gap-[20px]">
            {items.map(module => (
                <ModuleView
                    key={module.id}
                    id={module.id}
                    displayName={module.display_name}
                />
            ))}
        </div>
    );
};

export default ModulesListView;
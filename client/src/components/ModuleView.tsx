import DropdownMenu from "./DropdownMenu";

type ModuleViewProps = {
    id: number;
    displayName: string;
}

const ModuleView = ({
    id,
    displayName,
}: ModuleViewProps) => {
    return (
        <>
            <div
                className="flex items-center justify-between bg-[var(--color-black-2)] border border-[var(--color-stroke)] rounded-[20px] px-[30px] h-[90px]"
            >
                <p className="font-content text-[var(--color-white)]">{displayName}</p>
                <DropdownMenu
                    trigger={
                        <button>
                            <img src="icons/icon-edit.svg" alt="edit" className="w-[16px] h-[16px]"/>
                        </button>
                    }
                    items={[
                        
                    ]}
                />
            </div>
        </>
    );
};

export default ModuleView;
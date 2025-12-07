interface ToggleSwitchProps {
    isOn: boolean;
    onToggle: () => void;
    label: string;
};

const ToggleSwitch = ({
    isOn,
    onToggle,
    label
}: ToggleSwitchProps) => {
    return (
        <div
            onClick={onToggle}
            className="flex items-center cursor-pointer select-none"
        >
            <div
                className={`relative w-[60px] h-[30px] rounded-[20px] bg-[var(--color-black-2)] transition-colors duration-200`}
            >
                <div
                    className={`absolute top-[2px] left-[2px] w-[26px] h-[26px] rounded-[20px] transition-all duration-200 ${isOn ? "bg-[var(--color-violet)] left-[calc(100%-28px)]" : "bg-[var(--color-grey)]"}`}
                ></div>
            </div>

            <span className={`ml-[10px] ${isOn ? "text-[var(--color-white)]" : "text-[var(--color-grey)]"}`}>{label}</span>
        </div>
    );
};

export default ToggleSwitch;
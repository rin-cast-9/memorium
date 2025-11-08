import { useTranslations } from "use-intl";
import OptionView from "./OptionView";

interface OptionsGridProps {
    options: string[];
    onSelect: (value: string) => void;
    selected: string | null;
    feedback: "correct" | "wrong" | null;
    correctAnswer: string;
    locked: boolean;
}

const OptionsGrid = ({
    options,
    onSelect,
    selected,
    feedback,
    correctAnswer,
    locked,
}: OptionsGridProps) => {
    const t = useTranslations();
    return (
        <>
            <div className="grid grid-cols-2 gap-[20px] w-full">
                {options.map(opt => (
                    <OptionView
                        key={opt}
                        value={opt}
                        onClick={onSelect}
                        selected={selected === opt}
                        feedback={feedback}
                        isCorrect={opt === correctAnswer}
                        locked={locked}
                    />
                ))}
            </div>
        </>
    );
};

export default OptionsGrid;
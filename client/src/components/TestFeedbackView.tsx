import { IncorrectQuestionInfo } from "@/utils/IncorrectQuestionInfo";
import { useTranslations } from "next-intl";
import OptionView from "./OptionView";

interface TestFeedbackViewProps {
    incorrectQuestions: IncorrectQuestionInfo[];
}

const TestFeedbackView = ({
    incorrectQuestions,
}: TestFeedbackViewProps) => {
    const t = useTranslations();

    return (
        <div className="flex flex-col gap-[20px] mx-[130px]">
            <h2 className="text-[var(--color-white)] font-h2">
                {t("mistakenWords")}
            </h2>

            {incorrectQuestions.map((q) => (
                <div
                    key={q.question_id}
                    className="h-[254px] bg-[var(--color-black-2)] border border-[var(--color-stroke)] rounded-[20px] pl-[30px] pb-[30px] pr-[50px]"
                >
                    <p className="font-h2 text-[var(--color-white)] mt-[74px]">{q.prompt}</p>

                    <div className="grid grid-cols-2 gap-[20px] mt-[30px] w-full">
                        <div className="flex flex-col gap-[15px] justify-baseline">
                            <p className="font-small-text text-[var(--color-grey)]">
                                {t("yourAnswer")}
                            </p>
                            <OptionView
                                value={q.user_answer}
                                onClick={() => {}}
                                selected={true}
                                feedback="wrong"
                                isCorrect={false}
                                locked={true}
                            />
                        </div>

                        <div className="flex flex-col gap-[15px] justify-baseline">
                            <p className="font-small-text text-[var(--color-grey)]">
                                {t("correctAnswer")}
                            </p>
                            <OptionView
                                value={q.correct_answer}
                                onClick={() => {}}
                                selected={true}
                                feedback="correct"
                                isCorrect={true}
                                locked={true}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TestFeedbackView;
import { IncorrectQuestionInfo } from "./IncorrectQuestionInfo";

export interface FinishedTestSummary {
    correct: number;
    total: number;
    incorrect_questions: IncorrectQuestionInfo[];
};
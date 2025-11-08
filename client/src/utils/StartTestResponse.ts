import { QuestionPayload } from "./QuestionPayload";
import { Test } from "./Test";

export interface StartTestResponse {
    test: Test;
    payload: QuestionPayload[];
};
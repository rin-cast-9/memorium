import { QuestionPayload } from "./QuestionPayload";

export interface StartReviewRequest {
    module_id: number,
    review_type: number,
};

export interface StartReviewResponse {
    payload:  QuestionPayload[];
};
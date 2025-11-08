export interface ReviewResult {
    card_id: number;
    correct_count: number;
    incorrect_count: number;
};

export interface FinishReviewRequest {
    review_results: ReviewResult[];
};
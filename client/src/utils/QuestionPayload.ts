export interface QuestionPayload {
    question_id: number;
    test_id: number;
    card_id: number;
    question_type_id: number;
    prompt: string;
    answer: string;
    options: string[];
};
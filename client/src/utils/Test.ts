export interface Test {
    id: number;
    user_id: number;
    module_id: number;
    is_review_only: boolean;
    started_at: string;
    finished_at?: string | null;
    correct_answers: number;
    total_questions: number;
};
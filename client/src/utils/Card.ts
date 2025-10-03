export type Card = {
    id?: number;
    front: string;
    back: string;
};

export type CardApi = {
    id: number;
    module_id: number;
    front: string;
    back: string;
    created_at: string;
};
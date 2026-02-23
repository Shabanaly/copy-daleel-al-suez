export type ActionResult<T = any> = {
    success: boolean;
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
    data?: T;
    idempotencyKey?: string;
};

export type ActionState<T = any> = ActionResult<T>;

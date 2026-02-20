export class DomainError extends Error {
    constructor(
        public message: string,
        public code: string = 'DOMAIN_ERROR',
        public statusCode: number = 400
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class NotFoundError extends DomainError {
    constructor(entity: string, identifier: string | number) {
        super(`${entity} with identifier ${identifier} not found`, 'NOT_FOUND', 404);
    }
}

export class ValidationError extends DomainError {
    constructor(message: string, public errors?: Record<string, string[]>) {
        super(message, 'VALIDATION_ERROR', 422);
    }
}

export class UnauthorizedError extends DomainError {
    constructor(message: string = 'Unauthorized access') {
        super(message, 'UNAUTHORIZED', 401);
    }
}

export class ForbiddenError extends DomainError {
    constructor(message: string = 'Action forbidden') {
        super(message, 'FORBIDDEN', 403);
    }
}

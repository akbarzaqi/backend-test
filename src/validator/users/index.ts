import { RegisterUserSchema, LoginUserSchema } from './schema.ts';

const RegisterUserValidator = {
    validateUserPayload: (payload: any) => {
        const { error } = RegisterUserSchema.validate(payload);
        if (error) {
            throw new Error(`Validation error: ${error.details[0].message}`);
        }
    },
}

const LoginUserValidator = {
    validateLoginPayload: (payload: any) => {
        const { error } = LoginUserSchema.validate(payload);
        if (error) {
            throw new Error(`Validation error: ${error.details[0].message}`);
        }
    },
}

export { RegisterUserValidator, LoginUserValidator };
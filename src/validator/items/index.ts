import { CreateItemSchema } from './schema.ts';

const CreateItemValidator = {
    validateItemPayload: (payload: any) => {
        const { error } = CreateItemSchema.validate(payload);
        if (error) {
            throw new Error(`Validation error: ${error.details[0].message}`);
        }
    },
}

export { CreateItemValidator };
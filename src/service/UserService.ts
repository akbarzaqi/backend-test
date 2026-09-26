import { PrismaClient } from '@prisma/client';
import { type User } from '../types/users.ts';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

class UserService {
    constructor() {}

    async createUser(user: User): Promise<User> {

        const hashedPassword = await bcrypt.hash(user.password, 10);

        const newUser = await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: hashedPassword,
            },
        });
        return newUser;
    }

    async verifyCredentials(email: string, password: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new Error('invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('invalid credentials');
        }

        return user;
    }

    async getUserById(id: number): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new Error('User not found');
        }
        
        return user;
    }

    

}

export { UserService };

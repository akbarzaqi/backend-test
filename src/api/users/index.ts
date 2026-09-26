import { UsersHandler } from './usersHandler.ts';
import { UserService } from '../../service/UserService.ts';
import { RegisterUserValidator, LoginUserValidator } from '../../validator/users/index.ts';

const userService = new UserService();
const registerUserValidator = RegisterUserValidator;
const loginUserValidator = LoginUserValidator;

const usersHandler = new UsersHandler(userService, registerUserValidator, loginUserValidator);

export { usersHandler };
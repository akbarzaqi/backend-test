import { ItemsHandler } from './itemsHandler.ts';
import { ItemService } from '../../service/ItemService.ts';
import { CreateItemValidator } from '../../validator/items/index.ts';

const itemService = new ItemService();
const createItemValidator = CreateItemValidator;

const itemsHandler = new ItemsHandler(itemService, createItemValidator);

export { itemsHandler };

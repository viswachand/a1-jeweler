import express from "express";
import { createItem, getItems, updateItem, deleteItem } from "../controllers/itemController";
const router = express.Router()

router.route('/itemCreation').post(createItem);
router.route('/items').get(getItems);
router.route('/:id').put(updateItem).delete(deleteItem);

export default router
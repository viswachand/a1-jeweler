import express from 'express';
import { addCategory, getCategories } from '../controllers/categoryController';

const router = express.Router();

router.route('/add').post(addCategory);
router.route('/get').get(getCategories);

export default router;

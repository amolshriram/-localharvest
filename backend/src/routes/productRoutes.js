import { Router } from 'express';
import { list,get,create } from '../controllers/productController.js';
import { protect,authorize } from '../middleware/auth.js';
const router=Router(); router.get('/',list); router.get('/:id',get); router.post('/',protect,authorize('admin'),create); export default router;

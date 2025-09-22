import express from 'express';
import { createToDoList, getToDoList, deleteToDoList } from '../handlers/todoController.js';
import { getSFAccount } from '../handlers/accountController.js';

const router = express.Router();

router.post("/create-todo", createToDoList);
router.get("/get-todo", getToDoList);
router.delete("/delete-todo", deleteToDoList);
router.post("/create-account", getSFAccount);

export default router;
import { TodosAccess } from './todosAcess'
import * as attachmentUtils from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

const logger = createLogger('todos')
const todosAccess = new TodosAccess()

export async function createTodo(
  CreateTodoRequest: CreateTodoRequest,
  userId: string
) {
  logger.info('Creating an item')
  const itemId = uuid.v4()
  const todoItem: TodoItem = {
    userId,
    createdAt: new Date().toISOString(),
    todoId: itemId,
    done: false,
    attachmentUrl: `https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${itemId}`,
    ...CreateTodoRequest
  }

  await todosAccess.createTodo(todoItem, userId)
  return todoItem
}

export async function deleteTodo(todoId: string, userId: string) {
  const todoExists = await todosAccess.getTodo(todoId, userId)
  if (!todoExists) {
    logger.warn('Failed to delete an item')
    throw createError(404, "Todo item doesn't exist!")
  }
  return await todosAccess.deleteTodo(todoId, userId)
}

export async function updateTodo(
  UpdateTodoRequest: UpdateTodoRequest,
  todoId: string,
  userId: string
) {
  const todoExists = await todosAccess.getTodo(todoId, userId)
  if (!todoExists) {
    logger.warn('Failed to update an item')
    throw createError(404, "Todo item doesn't exist!")
  }
  return await todosAccess.updateTodo(todoId, userId, UpdateTodoRequest)
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('Retrieving all items')

  const todos = await todosAccess.getAllTodos(userId)
  return todos
}

export async function createAttachmentPresignedUrl(
  todoId: string,
  userId: string
) {
  logger.info(`Getting pre-signed url for item ${todoId} for user ${userId}`)
  return attachmentUtils.getUploadURL(todoId)
}

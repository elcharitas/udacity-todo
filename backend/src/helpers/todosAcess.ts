import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {
  private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient()
  private readonly table = process.env.TODOS_TABLE
  private createdAtIndex = process.env.TODOS_CREATED_AT_INDEX

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting Todo items for user ${userId}`)
    const result = await this.docClient
      .query({
        TableName: this.table,
        IndexName: this.createdAtIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()
    return result.Items as TodoItem[]
  }

  async getTodo(todoId: string, userId: string): Promise<TodoItem> {
    logger.info(`Retrieving Todo item ${todoId} for user ${userId}`)
    const result = await this.docClient
      .get({
        TableName: this.table,
        Key: {
          todoId,
          userId
        }
      })
      .promise()
    return result.Item as TodoItem
  }

  async createTodo(item: TodoItem, userId: string): Promise<void> {
    logger.info(`Creating Todo item for user ${userId}`)
    await this.docClient
      .put({
        TableName: this.table,
        Item: item
      })
      .promise()
  }

  async deleteTodo(todoId: string, userId: string): Promise<void> {
    logger.info(`Deleting Todo item ${todoId} for user ${userId}`)

    await this.docClient
      .delete({
        TableName: this.table,
        Key: {
          todoId,
          userId
        }
      })
      .promise()
  }

  async updateTodo(
    todoId: string,
    userId: string,
    todoItem: TodoUpdate
  ): Promise<void> {
    logger.info(`Updating Todo item ${todoId} for user ${userId}`)
    await this.docClient
      .update({
        TableName: this.table,
        Key: {
          todoId,
          userId
        },
        UpdateExpression:
          'set #name = :name, #dueDate = :dueDate, #done = :done',
        ExpressionAttributeValues: {
          ':name': todoItem.name,
          ':dueDate': todoItem.dueDate,
          ':done': todoItem.done
        }
      })
      .promise()
  }
}

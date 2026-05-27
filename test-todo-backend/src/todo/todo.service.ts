import { Injectable } from '@nestjs/common';

export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TodoService {
  private todos: Todo[] = [
    {
      id: 1,
      title: '学习 NestJS',
      description: '完成 NestJS 后端开发学习',
      completed: true,
      createdAt: new Date('2026-05-25'),
      updatedAt: new Date('2026-05-25'),
    },
    {
      id: 2,
      title: '开发代理功能',
      description: '实现基于目标地址的请求转发',
      completed: true,
      createdAt: new Date('2026-05-26'),
      updatedAt: new Date('2026-05-26'),
    },
    {
      id: 3,
      title: '测试代理功能',
      description: '创建测试项目验证代理功能',
      completed: false,
      createdAt: new Date('2026-05-27'),
      updatedAt: new Date('2026-05-27'),
    },
  ];

  findAll(): Todo[] {
    return this.todos;
  }

  findOne(id: number): Todo | undefined {
    return this.todos.find(todo => todo.id === id);
  }

  create(todoData: { title: string; description: string }): Todo {
    const newTodo: Todo = {
      id: Math.max(...this.todos.map(t => t.id), 0) + 1,
      title: todoData.title,
      description: todoData.description,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.todos.push(newTodo);
    return newTodo;
  }

  update(id: number, todoData: { title?: string; description?: string; completed?: boolean }): Todo | undefined {
    const index = this.todos.findIndex(todo => todo.id === id);
    if (index === -1) {
      return undefined;
    }
    this.todos[index] = {
      ...this.todos[index],
      ...todoData,
      updatedAt: new Date(),
    };
    return this.todos[index];
  }

  delete(id: number): boolean {
    const index = this.todos.findIndex(todo => todo.id === id);
    if (index === -1) {
      return false;
    }
    this.todos.splice(index, 1);
    return true;
  }
}
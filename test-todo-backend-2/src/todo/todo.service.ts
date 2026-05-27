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
      title: '代理测试 - 服务2任务A',
      description: '这是来自第二个后端服务的测试任务',
      completed: false,
      createdAt: new Date('2026-05-27'),
      updatedAt: new Date('2026-05-27'),
    },
    {
      id: 2,
      title: '代理测试 - 服务2任务B',
      description: '服务2专用的任务列表',
      completed: true,
      createdAt: new Date('2026-05-27'),
      updatedAt: new Date('2026-05-27'),
    },
    {
      id: 3,
      title: '服务2 - 热切换验证',
      description: '用于验证代理热切换功能',
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

  create(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Todo {
    const newTodo: Todo = {
      ...todo,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.todos.push(newTodo);
    return newTodo;
  }

  update(id: number, todo: Partial<Omit<Todo, 'id' | 'createdAt'>>): Todo | undefined {
    const index = this.todos.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    this.todos[index] = {
      ...this.todos[index],
      ...todo,
      updatedAt: new Date(),
    };
    return this.todos[index];
  }

  remove(id: number): boolean {
    const initialLength = this.todos.length;
    this.todos = this.todos.filter(todo => todo.id !== id);
    return this.todos.length < initialLength;
  }
}
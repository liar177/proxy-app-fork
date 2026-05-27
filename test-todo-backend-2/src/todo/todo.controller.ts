import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TodoService, Todo } from './todo.service';

@Controller('api/todos')
export class TodoController {
  constructor(private todoService: TodoService) {}

  @Get()
  findAll() {
    return {
      code: 0,
      message: 'success from backend-2',
      data: this.todoService.findAll(),
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const todo = this.todoService.findOne(parseInt(id));
    if (todo) {
      return {
        code: 0,
        message: 'success from backend-2',
        data: todo,
      };
    }
    return {
      code: -1,
      message: 'Todo not found',
      data: null,
    };
  }

  @Post()
  create(@Body() body: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) {
    const todo = this.todoService.create(body);
    return {
      code: 0,
      message: 'Todo created successfully',
      data: todo,
    };
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Omit<Todo, 'id' | 'createdAt'>>) {
    const todo = this.todoService.update(parseInt(id), body);
    if (todo) {
      return {
        code: 0,
        message: 'Todo updated successfully',
        data: todo,
      };
    }
    return {
      code: -1,
      message: 'Todo not found',
      data: null,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const success = this.todoService.remove(parseInt(id));
    if (success) {
      return {
        code: 0,
        message: 'Todo deleted successfully',
        data: null,
      };
    }
    return {
      code: -1,
      message: 'Todo not found',
      data: null,
    };
  }
}
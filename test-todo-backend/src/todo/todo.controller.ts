import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TodoService } from './todo.service';

@Controller('api/todos')
export class TodoController {
  constructor(private todoService: TodoService) {}

  @Get()
  findAll() {
    return {
      code: 0,
      message: 'success',
      data: this.todoService.findAll(),
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const todo = this.todoService.findOne(parseInt(id));
    if (todo) {
      return {
        code: 0,
        message: 'success',
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
  create(@Body() body: { title: string; description: string }) {
    const todo = this.todoService.create(body);
    return {
      code: 0,
      message: 'Todo created successfully',
      data: todo,
    };
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { title?: string; description?: string; completed?: boolean }) {
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
  delete(@Param('id') id: string) {
    const success = this.todoService.delete(parseInt(id));
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
import { useState, useEffect } from 'react';
import { todoApi } from './api/todoApi';
import TodoItem from './components/TodoItem';
import AddTodoForm from './components/AddTodoForm';
import FilterBar from './components/FilterBar';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');
  const [filter, setFilter] = useState('all');

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await todoApi.getAll();
      if (response.code === 0) {
        setTodos(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('获取任务列表失败: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAdd = async (data) => {
    try {
      const response = await todoApi.create(data);
      if (response.code === 0) {
        setTodos(prev => [response.data, ...prev]);
        showMessage('任务添加成功');
      } else {
        showMessage(response.message, 'error');
      }
    } catch (err) {
      showMessage('添加任务失败: ' + (err.message || err), 'error');
    }
  };

  const handleToggle = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      try {
        const response = await todoApi.update(id, { completed: !todo.completed });
        if (response.code === 0) {
          setTodos(prev =>
            prev.map(t => (t.id === id ? response.data : t))
          );
        } else {
          showMessage(response.message, 'error');
        }
      } catch (err) {
        showMessage('更新任务状态失败: ' + (err.message || err), 'error');
      }
    }
  };

  const handleEdit = async (id, data) => {
    try {
      const response = await todoApi.update(id, data);
      if (response.code === 0) {
        setTodos(prev =>
          prev.map(t => (t.id === id ? response.data : t))
        );
        showMessage('任务更新成功');
      } else {
        showMessage(response.message, 'error');
      }
    } catch (err) {
      showMessage('更新任务失败: ' + (err.message || err), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      try {
        const response = await todoApi.delete(id);
        if (response.code === 0) {
          setTodos(prev => prev.filter(t => t.id !== id));
          showMessage('任务删除成功');
        } else {
          showMessage(response.message, 'error');
        }
      } catch (err) {
        showMessage('删除任务失败: ' + (err.message || err), 'error');
      }
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter(t => t.completed).length;
  const activeCount = todos.length - completedCount;

  if (loading) {
    return (
      <div className="container">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="proxy-indicator enabled">
        🔄 代理模式已启用
      </div>

      <div className="header">
        <h1>📝 Todo List</h1>
        <p>代理功能测试应用</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && (
        <div className={messageType === 'error' ? 'error-message' : 'success-message'}>
          {message}
        </div>
      )}

      <div className="todo-card">
        <AddTodoForm onAdd={handleAdd} />
        <FilterBar filter={filter} onFilterChange={setFilter} />
        
        <div className="todo-list">
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 15s1.5-2 4-2 4 2 4 2" />
                <circle cx="9" cy="9" r="1" fill="currentColor" />
                <circle cx="15" cy="9" r="1" fill="currentColor" />
              </svg>
              <p>暂无任务，添加一个新任务吧！</p>
            </div>
          ) : (
            filteredTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        <div className="todo-stats">
          <span>总数: {todos.length}</span>
          <span>待完成: {activeCount} | 已完成: {completedCount}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
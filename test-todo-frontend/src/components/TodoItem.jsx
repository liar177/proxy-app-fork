import { useState } from 'react';
import EditModal from './EditModal';

function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const [showEditModal, setShowEditModal] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
        <input
          type="checkbox"
          className="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <div className="todo-content">
          <div className="todo-title">{todo.title}</div>
          <div className="todo-description">{todo.description}</div>
          <div className="todo-meta">
            创建于 {formatDate(todo.createdAt)}
            {todo.createdAt !== todo.updatedAt && (
              <span> · 更新于 {formatDate(todo.updatedAt)}</span>
            )}
          </div>
        </div>
        <div className="todo-actions">
          <button className="action-btn btn-edit" onClick={() => setShowEditModal(true)}>
            编辑
          </button>
          <button className="action-btn btn-delete" onClick={() => onDelete(todo.id)}>
            删除
          </button>
        </div>
      </div>

      {showEditModal && (
        <EditModal
          todo={todo}
          onClose={() => setShowEditModal(false)}
          onSave={(data) => {
            onEdit(todo.id, data);
            setShowEditModal(false);
          }}
        />
      )}
    </>
  );
}

export default TodoItem;
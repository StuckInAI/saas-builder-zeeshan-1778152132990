import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useTodos } from '@/hooks/useTodos';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  Plus, LogOut, CheckSquare, Trash2, Pencil, Check, X, ClipboardList
} from 'lucide-react';
import type { Todo } from '@/types';
import styles from './DashboardPage.module.css';
import clsx from 'clsx';

type Filter = 'all' | 'active' | 'completed';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { todos, loading, error, createTodo, toggleTodo, updateTodo, deleteTodo, clearCompleted } = useTodos(user ? user.id : null);

  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showError = (msg: string) => {
    setToastError(msg);
    setTimeout(() => setToastError(null), 3500);
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    navigate('/login');
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      setInputError('Please enter a task.');
      return;
    }
    setInputError(null);
    setSubmitting(true);
    const err = await createTodo(input.trim());
    setSubmitting(false);
    if (err) {
      showError(err);
    } else {
      setInput('');
      inputRef.current?.focus();
    }
  };

  const handleToggle = async (todo: Todo) => {
    const err = await toggleTodo(todo.id, !todo.completed);
    if (err) showError(err);
  };

  const handleEditStart = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleEditSave = async (id: string) => {
    if (!editText.trim()) return;
    const err = await updateTodo(id, editText);
    if (err) showError(err);
    setEditingId(null);
    setEditText('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const err = await deleteTodo(id);
    setDeletingId(null);
    if (err) showError(err);
  };

  const handleClearCompleted = async () => {
    const err = await clearCompleted();
    if (err) showError(err);
  };

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const totalCount = todos.length;
  const completedCount = todos.filter(t => t.completed).length;
  const activeCount = totalCount - completedCount;

  return (
    <div className={styles.page}>
      {/* Navbar */}
      <header className={styles.navbar}>
        <div className={styles.navBrand}>
          <CheckSquare size={22} className={styles.navIcon} />
          <span className={styles.navName}>TodoApp</span>
        </div>
        <div className={styles.navRight}>
          <span className={styles.navEmail}>{user?.email}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Page header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>My Tasks</h1>
            <p className={styles.pageSubtitle}>Stay organised and get things done</p>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{totalCount}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.statCard}>
            <span className={clsx(styles.statValue, styles.statActive)}>{activeCount}</span>
            <span className={styles.statLabel}>Remaining</span>
          </div>
          <div className={styles.statCard}>
            <span className={clsx(styles.statValue, styles.statDone)}>{completedCount}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
        </div>

        {/* Add todo form */}
        <form onSubmit={handleAdd} className={styles.addForm}>
          <div className={styles.addInputWrap}>
            <input
              ref={inputRef}
              type="text"
              className={clsx(styles.addInput, inputError && styles.addInputError)}
              placeholder="Add a new task..."
              value={input}
              onChange={e => {
                setInput(e.target.value);
                if (inputError) setInputError(null);
              }}
              disabled={submitting}
            />
            {inputError && <span className={styles.inputErrMsg}>{inputError}</span>}
          </div>
          <button type="submit" className={styles.addBtn} disabled={submitting}>
            <Plus size={18} />
            {submitting ? 'Adding...' : 'Add Task'}
          </button>
        </form>

        {/* Filter tabs */}
        <div className={styles.filterBar}>
          <div className={styles.filterTabs}>
            {(['all', 'active', 'completed'] as Filter[]).map(f => (
              <button
                key={f}
                className={clsx(styles.filterTab, filter === f && styles.filterTabActive)}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {completedCount > 0 && (
            <button className={styles.clearBtn} onClick={handleClearCompleted}>
              Clear completed ({completedCount})
            </button>
          )}
        </div>

        {/* Error banner */}
        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* Todo list */}
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <ClipboardList size={48} strokeWidth={1.2} />
            <p className={styles.emptyTitle}>
              {todos.length === 0
                ? 'No tasks yet'
                : filter === 'active'
                ? 'No remaining tasks'
                : 'No completed tasks'}
            </p>
            <p className={styles.emptySubtitle}>
              {todos.length === 0
                ? 'Add your first task above to get started.'
                : 'Switch the filter to see other tasks.'}
            </p>
          </div>
        ) : (
          <ul className={styles.todoList}>
            {filtered.map(todo => (
              <li
                key={todo.id}
                className={clsx(styles.todoItem, todo.completed && styles.todoCompleted, deletingId === todo.id && styles.todoDeleting)}
              >
                {/* Checkbox */}
                <button
                  className={clsx(styles.checkbox, todo.completed && styles.checkboxChecked)}
                  onClick={() => handleToggle(todo)}
                  title={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                  disabled={deletingId === todo.id}
                >
                  {todo.completed && <Check size={13} strokeWidth={3} />}
                </button>

                {/* Text / Edit input */}
                {editingId === todo.id ? (
                  <div className={styles.editWrap}>
                    <input
                      className={styles.editInput}
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleEditSave(todo.id);
                        if (e.key === 'Escape') handleEditCancel();
                      }}
                      autoFocus
                    />
                    <button
                      className={styles.editSaveBtn}
                      onClick={() => handleEditSave(todo.id)}
                      title="Save"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      className={styles.editCancelBtn}
                      onClick={handleEditCancel}
                      title="Cancel"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <span
                    className={styles.todoText}
                    onDoubleClick={() => !todo.completed && handleEditStart(todo)}
                    title={todo.completed ? '' : 'Double-click to edit'}
                  >
                    {todo.text}
                  </span>
                )}

                {/* Actions */}
                {editingId !== todo.id && (
                  <div className={styles.todoActions}>
                    {!todo.completed && (
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEditStart(todo)}
                        title="Edit task"
                        disabled={deletingId === todo.id}
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(todo.id)}
                      title="Delete task"
                      disabled={deletingId === todo.id}
                    >
                      {deletingId === todo.id ? (
                        <span className={styles.deletingDot} />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Toast error */}
      {toastError && (
        <div className={styles.toastError}>{toastError}</div>
      )}
    </div>
  );
}

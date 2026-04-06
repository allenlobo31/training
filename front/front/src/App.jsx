import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [newText, setNewText] = useState('')
  const [editingId, setEditingId] = useState('')
  const [editText, setEditText] = useState('')
  const [editCompleted, setEditCompleted] = useState(false)

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  const fetchTodos = async () => {
    const response = await fetch(`${apiBaseUrl}/page`)
    const data = await response.json()
    setTodos(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  const addTodo = async (event) => {
    event.preventDefault()
    if (!newText.trim()) {
      return
    }

    const response = await fetch(`${apiBaseUrl}/page`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText.trim(), completed: false }),
    })

    const created = await response.json()
    setTodos((currentTodos) => [created, ...currentTodos])
    setNewText('')
  }

  const startEdit = (todo) => {
    setEditingId(todo._id)
    setEditText(todo.text)
    setEditCompleted(todo.completed)
  }

  const cancelEdit = () => {
    setEditingId('')
    setEditText('')
    setEditCompleted(false)
  }

  const saveEdit = async (id) => {
    if (!editText.trim()) {
      return
    }

    const response = await fetch(`${apiBaseUrl}/page/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editText.trim(), completed: editCompleted }),
    })

    const updated = await response.json()
    setTodos((currentTodos) => currentTodos.map((todo) => (todo._id === id ? updated : todo)))
    cancelEdit()
  }

  const deleteTodo = async (id) => {
    await fetch(`${apiBaseUrl}/page/${id}`, { method: 'DELETE' })
    setTodos((currentTodos) => currentTodos.filter((todo) => todo._id !== id))
  }

  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Trainer Dashboard</p>
        <h1>Tasks</h1>

        <form className="create-form" onSubmit={addTodo}>
          <input
            type="text"
            value={newText}
            onChange={(event) => setNewText(event.target.value)}
            placeholder="New task"
          />
          <button type="submit">Add</button>
        </form>
      </section>

      <section className="card-grid">
        {todos.length === 0 && <p className="state-text">No tasks yet.</p>}

        {todos.map((todo) => {
          const isEditing = editingId === todo._id

          return (
            <article className="task-card" key={todo._id}>
              <div className="card-head">
                <span className={todo.completed ? 'status done' : 'status pending'}>
                  {todo.completed ? 'Done' : 'Open'}
                </span>
                <span className="card-id">#{todo._id.slice(-6)}</span>
              </div>

              {isEditing ? (
                <>
                  <input
                    className="card-input"
                    type="text"
                    value={editText}
                    onChange={(event) => setEditText(event.target.value)}
                  />
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={editCompleted}
                      onChange={(event) => setEditCompleted(event.target.checked)}
                    />
                    Done
                  </label>
                  <div className="card-actions">
                    <button type="button" onClick={() => saveEdit(todo._id)}>Save</button>
                    <button type="button" className="ghost" onClick={cancelEdit}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <h2>{todo.text}</h2>
                  <div className="card-actions">
                    <button type="button" className="ghost" onClick={() => startEdit(todo)}>
                      Edit
                    </button>
                    <button type="button" className="danger" onClick={() => deleteTodo(todo._id)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </article>
          )
        })}
      </section>
    </main>
  )
}

export default App

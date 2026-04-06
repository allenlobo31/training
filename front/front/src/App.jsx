import { useEffect, useMemo, useState } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newText, setNewText] = useState('')
  const [newCompleted, setNewCompleted] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [editText, setEditText] = useState('')
  const [editCompleted, setEditCompleted] = useState(false)

  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_URL || 'http://localhost:3000',
    [],
  )

  const fetchTodos = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`${apiBaseUrl}/page`)

      if (!response.ok) {
        throw new Error('Could not load tasks from server.')
      }

      const data = await response.json()
      setTodos(Array.isArray(data) ? data : [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  const addTodo = async (event) => {
    event.preventDefault()
    if (!newText.trim()) {
      return
    }

    try {
      setError('')
      const response = await fetch(`${apiBaseUrl}/page`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newText.trim(),
          completed: newCompleted,
        }),
      })

      if (!response.ok) {
        throw new Error('Could not create task.')
      }

      const created = await response.json()
      setTodos((prev) => [created, ...prev])
      setNewText('')
      setNewCompleted(false)
    } catch (requestError) {
      setError(requestError.message)
    }
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

    try {
      setError('')
      const response = await fetch(`${apiBaseUrl}/page/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: editText.trim(),
          completed: editCompleted,
        }),
      })

      if (!response.ok) {
        throw new Error('Could not update task.')
      }

      const updated = await response.json()
      setTodos((prev) => prev.map((todo) => (todo._id === id ? updated : todo)))
      cancelEdit()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const deleteTodo = async (id) => {
    try {
      setError('')
      const response = await fetch(`${apiBaseUrl}/page/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Could not delete task.')
      }

      setTodos((prev) => prev.filter((todo) => todo._id !== id))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <main className="app-shell">
      <section className="top-panel">
        <div>
          <p className="eyebrow">Trainer Dashboard</p>
          <h1>Workout Task Cards</h1>
          <p className="subtitle">Create, track, and update tasks stored in MongoDB.</p>
        </div>

        <form className="create-form" onSubmit={addTodo}>
          <input
            type="text"
            value={newText}
            onChange={(event) => setNewText(event.target.value)}
            placeholder="Add a new workout task"
          />
          <label>
            <input
              type="checkbox"
              checked={newCompleted}
              onChange={(event) => setNewCompleted(event.target.checked)}
            />
            Completed
          </label>
          <button type="submit">Add Task</button>
        </form>
      </section>

      {error && <p className="error-box">{error}</p>}

      <section className="card-grid">
        {loading && <p className="state-text">Loading tasks...</p>}
        {!loading && todos.length === 0 && (
          <p className="state-text">No tasks yet. Add one from the form above.</p>
        )}

        {!loading &&
          todos.map((todo) => {
            const isEditing = editingId === todo._id

            return (
              <article className="task-card" key={todo._id}>
                <p className="card-id">#{todo._id.slice(-6)}</p>

                {isEditing ? (
                  <>
                    <input
                      className="card-input"
                      type="text"
                      value={editText}
                      onChange={(event) => setEditText(event.target.value)}
                    />
                    <label className="card-checkbox">
                      <input
                        type="checkbox"
                        checked={editCompleted}
                        onChange={(event) => setEditCompleted(event.target.checked)}
                      />
                      Completed
                    </label>
                    <div className="card-actions">
                      <button onClick={() => saveEdit(todo._id)}>Save</button>
                      <button className="ghost" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2>{todo.text}</h2>
                    <p className={todo.completed ? 'badge done' : 'badge pending'}>
                      {todo.completed ? 'Completed' : 'Pending'}
                    </p>
                    <div className="card-actions">
                      <button onClick={() => startEdit(todo)}>Edit</button>
                      <button className="danger" onClick={() => deleteTodo(todo._id)}>
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

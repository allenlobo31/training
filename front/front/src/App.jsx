import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [newText, setNewText] = useState('')

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  const fetchTodos = async () => {
    const response = await fetch(`${apiBaseUrl}/page`)
    setTodos(await response.json())
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  const addTodo = async (event) => {
    event.preventDefault()
    if (!newText.trim()) return

    const response = await fetch(`${apiBaseUrl}/page`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText.trim(), completed: false }),
    })

    setTodos([await response.json(), ...todos])
    setNewText('')
  }

  const editTodo = async (todo) => {
    const text = window.prompt('Task text', todo.text)
    if (text === null || !text.trim()) return

    const response = await fetch(`${apiBaseUrl}/page/${todo._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim(), completed: !todo.completed }),
    })

    const updated = await response.json()
    setTodos(todos.map((item) => (item._id === todo._id ? updated : item)))
  }

  const deleteTodo = async (id) => {
    if (!window.confirm('Delete this task?')) return

    await fetch(`${apiBaseUrl}/page/${id}`, { method: 'DELETE' })
    setTodos(todos.filter((todo) => todo._id !== id))
  }

  return (
    <main className="app-shell">
      <section className="panel">
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
        {todos.length === 0 ? (
          <p className="state-text">No tasks yet.</p>
        ) : (
          todos.map((todo) => (
            <article className="task-card" key={todo._id}>
              <h2>{todo.text}</h2>
              <p className={todo.completed ? 'status done' : 'status pending'}>
                {todo.completed ? 'Done' : 'Open'}
              </p>
              <div className="card-actions">
                <button type="button" className="ghost" onClick={() => editTodo(todo)}>
                  Edit
                </button>
                <button type="button" className="danger" onClick={() => deleteTodo(todo._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  )
}

export default App

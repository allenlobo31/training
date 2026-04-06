import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [newText, setNewText] = useState('')
  const [username, setUsername] = useState('demo')
  const [password, setPassword] = useState('demo123')
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [error, setError] = useState('')

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const api = axios.create({ baseURL: apiBaseUrl })

  const fetchTodos = async () => {
    if (!token) return

    const response = await api.get('/page', {
      headers: { Authorization: `Bearer ${token}` },
    })
    setTodos(response.data)
  }

  useEffect(() => {
    fetchTodos().catch(() => {
      setError('Session expired. Please login again.')
      setToken('')
      localStorage.removeItem('token')
    })
  }, [token])

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const response = await api.post('/auth/login', { username, password })
      setToken(response.data.token)
      localStorage.setItem('token', response.data.token)
    } catch {
      setError('Invalid login. Try demo / demo123.')
    }
  }

  const handleLogout = () => {
    setToken('')
    setTodos([])
    localStorage.removeItem('token')
  }

  const addTodo = async (event) => {
    event.preventDefault()
    if (!newText.trim()) return

    const response = await api.post(
      '/page',
      { text: newText.trim(), completed: false },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    setTodos([response.data, ...todos])
    setNewText('')
  }

  const editTodo = async (todo) => {
    const text = window.prompt('Task text', todo.text)
    if (text === null || !text.trim()) return

    const response = await api.put(
      `/page/${todo._id}`,
      { text: text.trim(), completed: !todo.completed },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    const updated = response.data
    setTodos(todos.map((item) => (item._id === todo._id ? updated : item)))
  }

  const deleteTodo = async (id) => {
    if (!window.confirm('Delete this task?')) return

    await api.delete(`/page/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    setTodos(todos.filter((todo) => todo._id !== id))
  }

  return (
    <main className="app-shell">
      <section className="panel">
        <h1>Tasks + JWT</h1>

        {!token ? (
          <form className="create-form" onSubmit={handleLogin}>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
            />
            <button type="submit">Login</button>
          </form>
        ) : (
          <>
            <form className="create-form" onSubmit={addTodo}>
              <input
                type="text"
                value={newText}
                onChange={(event) => setNewText(event.target.value)}
                placeholder="New task"
              />
              <button type="submit">Add</button>
            </form>
            <button type="button" className="ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
        {error ? <p className="state-text">{error}</p> : null}
      </section>

      <section className="card-grid">
        {!token ? (
          <p className="state-text">Login with demo / demo123</p>
        ) : todos.length === 0 ? (
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

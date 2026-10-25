import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const FILTERS = ["All", "Active", "Completed"];

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || "The request could not be completed.");
  }
  return response.status === 204 ? null : response.json();
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    request("/tasks")
      .then((data) => {
        if (mounted) setTasks(data);
      })
      .catch((err) => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const counts = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    return { total: tasks.length, completed, pending: tasks.length - completed };
  }, [tasks]);

  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (filter === "Active") return !task.completed;
        if (filter === "Completed") return task.completed;
        return true;
      }),
    [filter, tasks],
  );

  async function createTask(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const task = await request("/tasks", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });
      setTasks((current) => [task, ...current]);
      setTitle("");
      setDescription("");
      setFilter("All");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    setError("");
    try {
      const updated = await request(`/tasks/${task._id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !task.completed }),
      });
      setTasks((current) => current.map((item) => (item._id === updated._id ? updated : item)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteTask(task) {
    setError("");
    try {
      await request(`/tasks/${task._id}`, { method: "DELETE" });
      setTasks((current) => current.filter((item) => item._id !== task._id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="Taskly home">
          <span className="brand-mark">t</span>
          <span>taskly</span>
        </a>

        <div className="side-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="side-link selected" href="#overview">
            <span className="nav-icon">⌂</span> Overview
          </a>
          <a className="side-link" href="#tasks">
            <span className="nav-icon">▤</span> My tasks
            <span className="nav-count">{counts.total}</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="study-card">
            <div className="study-icon">✦</div>
            <p className="study-title">One step at a time.</p>
            <p className="study-copy">Small progress is still progress. Keep going!</p>
            <div className="study-progress"><span /></div>
            <div className="study-foot"><span>Your momentum</span><span>↗</span></div>
          </div>
          <div className="profile">
            <div className="avatar">S</div>
            <div><strong>Student</strong><span>My workspace</span></div>
            <span className="profile-menu" aria-hidden="true">···</span>
          </div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> Overview</div>
          <div className="today-chip"><span className="live-dot" /> Your study space</div>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow">YOUR PERSONAL DASHBOARD</p>
            <h1>Make today <span>count.</span></h1>
            <p className="welcome-copy">A little focus goes a long way. What are you working on?</p>
          </div>
          <div className="date-note"><span className="date-icon">▦</span><span>One task at a time<br /><strong>You’ve got this.</strong></span></div>
        </section>

        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} aria-label="Dismiss error">×</button>
          </div>
        )}

        <section className="stats-grid" aria-label="Task summary">
          <SummaryCard label="Total tasks" value={counts.total} detail="In your workspace" icon="▤" tone="purple" />
          <SummaryCard label="Completed" value={counts.completed} detail="Nicely done!" icon="✓" tone="green" />
          <SummaryCard label="Pending" value={counts.pending} detail="Ready when you are" icon="◷" tone="orange" />
        </section>

        <section className="workspace-grid">
          <section className="tasks-panel panel" id="tasks">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">YOUR WORKLOAD</p>
                <h2>My tasks <span className="task-total">{counts.total}</span></h2>
              </div>
              <div className="filters" role="group" aria-label="Filter tasks">
                {FILTERS.map((item) => (
                  <button
                    className={filter === item ? "filter-button active" : "filter-button"}
                    key={item}
                    type="button"
                    aria-pressed={filter === item}
                    onClick={() => setFilter(item)}
                  >
                    {item}
                    {item === "Active" && <span className="filter-count">{counts.pending}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="task-list">
              {loading ? (
                <div className="empty-state"><span className="loader" />Loading your tasks…</div>
              ) : visibleTasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">{filter === "Completed" ? "✧" : "＋"}</div>
                  <strong>{filter === "Completed" ? "Nothing completed yet" : "Your list is clear"}</strong>
                  <span>{filter === "Completed" ? "Finished tasks will show up here." : "Add a task to get your day started."}</span>
                </div>
              ) : (
                visibleTasks.map((task) => (
                  <TaskRow key={task._id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                ))
              )}
            </div>
            <div className="list-footer">
              <span>Showing {visibleTasks.length} of {counts.total} tasks</span>
              <span className="footer-dot" /> Synced with your workspace
            </div>
          </section>

          <section className="create-panel panel">
            <div className="create-heading">
              <div className="create-icon">＋</div>
              <div><p className="eyebrow">STAY ON TRACK</p><h2>Add a task</h2></div>
            </div>
            <p className="form-intro">Get it out of your head and onto your list.</p>
            <form onSubmit={createTask}>
              <label htmlFor="task-title">Task title <span className="required">*</span></label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Review lecture notes"
                maxLength={120}
                required
              />
              <label htmlFor="task-description">Description <span className="optional">OPTIONAL</span></label>
              <textarea
                id="task-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add a few details…"
                rows={4}
                maxLength={1000}
              />
              <button className="submit-button" type="submit" disabled={saving || !title.trim()}>
                {saving ? "Adding task…" : "Add to my tasks"} <span aria-hidden="true">↗</span>
              </button>
            </form>
            <div className="form-tip"><span>✦</span> Tip: Break big assignments into smaller tasks.</div>
          </section>
        </section>
        <footer className="page-footer">Made for your next small win <span>✦</span></footer>
      </main>
    </div>
  );
}

function SummaryCard({ label, value, detail, icon, tone }) {
  return (
    <article className="summary-card">
      <div className={`summary-icon ${tone}`}>{icon}</div>
      <div className="summary-content">
        <span className="summary-label">{label}</span>
        <strong className="summary-value">{value}</strong>
        <span className="summary-detail">{detail}</span>
      </div>
      <span className={`summary-accent ${tone}`} aria-hidden="true" />
    </article>
  );
}

function TaskRow({ task, onToggle, onDelete }) {
  return (
    <article className={task.completed ? "task-row completed" : "task-row"}>
      <button
        className="task-check"
        type="button"
        onClick={() => onToggle(task)}
        aria-label={task.completed ? `Mark ${task.title} as pending` : `Mark ${task.title} as completed`}
        aria-pressed={task.completed}
      >
        {task.completed && "✓"}
      </button>
      <div className="task-copy">
        <strong>{task.title}</strong>
        {task.description && <span>{task.description}</span>}
      </div>
      <span className={task.completed ? "status-badge done" : "status-badge pending"}>
        {task.completed ? "Completed" : "In progress"}
      </span>
      <button className="delete-button" type="button" onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`}>
        ×
      </button>
    </article>
  );
}

export default App;

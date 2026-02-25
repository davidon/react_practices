export const TYPES = {
  ADD_TASK: 'ADD_TASK',
  TOGGLE_TASK: 'TOGGLE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  LOAD_STORAGE: 'LOAD_STORAGE' // Useful for manual syncs
};

export const fallbackState = {
  tasks: [],
  metrics: { total: 0, completed: 0, completionRate: 0 },
  history: []
};

// 2. Helper to get data from LocalStorage on first load
export const getStoredState = () => {
  const saved = localStorage.getItem('task_app_state');
  return saved ? JSON.parse(saved) : fallbackState;
};

function calculateMetrics(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.done).length;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, completionRate: rate };
}

// WD: Parameter action of function reducer(state, action)  in reducer.js is parameter of dispatch(payloadObject) in app.js
export function reducer(state, action) {
  let newTasks;

  switch (action.type) {
    case TYPES.ADD_TASK:
      newTasks = [...state.tasks, { id: Date.now(), text: action.payload, done: false }];
      return {
        ...state,
        tasks: newTasks,
        metrics: calculateMetrics(newTasks),
        history: [`Added: ${action.payload}`, ...state.history].slice(0, 5) // Keep last 5 logs
      };

    case TYPES.TOGGLE_TASK:
      newTasks = state.tasks.map(t => 
        t.id === action.payload ? { ...t, done: !t.done } : t
      );
      return {
        ...state,
        tasks: newTasks,
        metrics: calculateMetrics(newTasks),
        history: [`Toggled task ID: ${action.payload}`, ...state.history].slice(0, 5)
      };

    case TYPES.DELETE_TASK:
      newTasks = state.tasks.filter(t => t.id !== action.payload);
      return {
        ...state,
        tasks: newTasks,
        metrics: calculateMetrics(newTasks),
        history: ['Task Deleted', ...state.history].slice(0, 5)
      };

    default:
      return state;
  }
}

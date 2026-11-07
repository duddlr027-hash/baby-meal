const PREFIX = 'bm:';

export function createStore(backend) {
  if (backend === undefined) {
    try { backend = globalThis.localStorage ?? null; } catch { backend = null; }
  }
  const mem = new Map();
  let persistent = !!backend;

  function read(key) {
    if (mem.has(key)) return mem.get(key);
    if (!backend) return null;
    try { return backend.getItem(PREFIX + key); } catch { return null; }
  }

  function write(key, value) {
    mem.set(key, value);
    if (persistent) {
      try { backend.setItem(PREFIX + key, value); } catch { persistent = false; }
    }
  }

  function readJSON(key, fallback) {
    const raw = read(key);
    if (raw == null) return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  }

  return {
    isPersistent: () => persistent,
    loadSettings: () => readJSON('settings', null),
    saveSettings: (s) => write('settings', JSON.stringify(s)),
    loadPlan: (w) => readJSON(`plan:${w}`, null),
    savePlan: (w, p) => write(`plan:${w}`, JSON.stringify(p)),
    loadChecks: (w) => readJSON(`checks:${w}`, {}),
    saveChecks: (w, c) => write(`checks:${w}`, JSON.stringify(c)),
    clearAll() {
      mem.clear();
      if (!backend) return;
      try {
        const keys = [];
        for (let i = 0; i < backend.length; i++) {
          const k = backend.key(i);
          if (k && k.startsWith(PREFIX)) keys.push(k);
        }
        keys.forEach((k) => backend.removeItem(k));
      } catch { /* 지우지 못해도 메모리는 비웠다 */ }
    },
  };
}

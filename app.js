/* ═══════════════════════════════════════════
   STUDENT STUDY PLANNER — app.js
   Single clean file — correct execution order
   ═══════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────
   HELPER FUNCTIONS (defined first — used by SAMPLE_TASKS)
────────────────────────────────────────── */

/** Returns YYYY-MM-DD offset by `days` from today */
function getDateStr(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/** Returns today as YYYY-MM-DD */
function today() {
  return getDateStr(0);
}

/** Format YYYY-MM-DD → "Mon, 14 Jul 2025" */
function formatDate(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/** Unique id generator */
function uid() {
  return 'task-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
}

/** Minimal HTML-escape */
function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Shorthand for getElementById */
const $ = id => document.getElementById(id);

/* ──────────────────────────────────────────
   SAMPLE DATA
────────────────────────────────────────── */
const SAMPLE_TASKS = [
  { id: 'task-1', subject: 'Mathematics',      topic: 'Calculus – Definite Integration',       date: getDateStr(0),  time: '', priority: 'High',   duration: '2 hours', notes: 'Practice 10 problems from Chapter 6',              completed: false },
  { id: 'task-2', subject: 'Physics',           topic: 'Laws of Motion – Newton\'s 3rd Law',   date: getDateStr(0),  time: '', priority: 'Medium', duration: '1 hour',  notes: 'Read textbook pages 120–135',                      completed: true  },
  { id: 'task-3', subject: 'Computer Science',  topic: 'Data Structures – Linked Lists',       date: getDateStr(1),  time: '', priority: 'High',   duration: '2 hours', notes: 'Implement singly and doubly linked list in Python', completed: false },
  { id: 'task-4', subject: 'English',           topic: 'Essay Writing – Argumentative Style',  date: getDateStr(2),  time: '', priority: 'Low',    duration: '1 hour',  notes: 'Draft 500-word essay on climate change',           completed: false },
  { id: 'task-5', subject: 'Chemistry',         topic: 'Organic Chemistry – Functional Groups',date: getDateStr(-1), time: '', priority: 'Medium', duration: '1 hour',  notes: 'Memorise 8 common functional groups',              completed: true  },
  { id: 'task-6', subject: 'Mathematics',       topic: 'Probability – Bayes Theorem',          date: getDateStr(3),  time: '', priority: 'Medium', duration: '1 hour',  notes: '',                                                 completed: false },
  { id: 'task-7', subject: 'Computer Science',  topic: 'Machine Learning – Linear Regression', date: getDateStr(1),  time: '', priority: 'High',   duration: '1.5 hours', notes: 'IBM SkillsBuild exercise – module 4',             completed: false },
  { id: 'task-8', subject: 'Biology',           topic: 'Cell Division – Mitosis vs Meiosis',   date: getDateStr(4),  time: '', priority: 'Low',    duration: '1 hour',  notes: 'Draw and label diagrams',                          completed: false }
];

/* ──────────────────────────────────────────
   LOCAL STORAGE KEYS
────────────────────────────────────────── */
const STORAGE_KEY   = 'studyPlannerTasks';  // existing key — unchanged
const PROFILE_KEY   = 'studyProfile';
const SCHEDULE_KEY  = 'studySchedule';
const SESSIONS_KEY  = 'studySessions';
const THEME_KEY     = 'studyTheme';

/* ──────────────────────────────────────────
   LOAD / SAVE
────────────────────────────────────────── */
function loadTasks() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function saveTasks(t)   { localStorage.setItem(STORAGE_KEY,  JSON.stringify(t)); }
function loadProfile()  { try { return JSON.parse(localStorage.getItem(PROFILE_KEY))  || {}; } catch { return {}; } }
function saveProfile(p) { localStorage.setItem(PROFILE_KEY,  JSON.stringify(p)); }
function loadSchedule() { try { return JSON.parse(localStorage.getItem(SCHEDULE_KEY)) || []; } catch { return []; } }
function saveSchedule(s){ localStorage.setItem(SCHEDULE_KEY, JSON.stringify(s)); }
function loadSessions() { try { return JSON.parse(localStorage.getItem(SESSIONS_KEY)) || []; } catch { return []; } }
function saveSessions(s){ localStorage.setItem(SESSIONS_KEY, JSON.stringify(s)); }

/* ──────────────────────────────────────────
   APPLICATION STATE
────────────────────────────────────────── */
let tasks           = loadTasks() || (() => { saveTasks(SAMPLE_TASKS); return SAMPLE_TASKS; })();
let profile         = loadProfile();
let scheduleItems   = loadSchedule();
let sessionHistory  = loadSessions();
let deleteTargetId  = null;
let deleteSchedId   = null;

/* ──────────────────────────────────────────
   TOAST NOTIFICATIONS
────────────────────────────────────────── */
function showToast(msg, type, icon) {
  const container = $('toastContainer');
  if (!container) return;
  const icons = { success: '✓', danger: '✕', warning: '!', info: 'i' };
  const toast = document.createElement('div');
  toast.className = 'toast ' + (type || 'success');
  toast.innerHTML = '<span class="toast-icon">' + (icon || icons[type] || '✓') + '</span>' +
                    '<span class="toast-msg">' + escHtml(msg) + '</span>';
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }, 3200);
}

/* ──────────────────────────────────────────
   CONFETTI
────────────────────────────────────────── */
let confettiActive = false;
function launchConfetti() {
  const canvas = $('confettiCanvas');
  if (!canvas || confettiActive) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  confettiActive = true;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const COLORS = ['#1d4ed8','#16a34a','#d97706','#dc2626','#7c3aed','#0e7490'];
  const pieces = Array.from({ length: 70 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    w: 5 + Math.random() * 8,
    h: 8 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    speed: 2 + Math.random() * 3,
    spin: (Math.random() - .5) * .18,
    angle: 0,
    drift: (Math.random() - .5) * 1.4
  }));
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.speed; p.x += p.drift; p.angle += p.spin;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
      ctx.fillStyle = p.color; ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    });
    if (++frame < 140) { requestAnimationFrame(draw); }
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); confettiActive = false; }
  }
  draw();
  showToast('All tasks complete! Congratulations!', 'success');
}

/* ──────────────────────────────────────────
   THEME SYSTEM
────────────────────────────────────────── */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  const isDark = theme === 'dark';
  const icon = $('themeIcon');
  if (icon) icon.textContent = isDark ? '\u2600' : '\u263D'; // sun / crescent
  const toggle = $('darkModeToggle');
  if (toggle) toggle.checked = isDark;
}

function initTheme() {
  applyTheme(localStorage.getItem(THEME_KEY) || 'light');
}

// Theme toggle in header
const themeToggleBtn = $('themeToggle');
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const curr = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(curr === 'dark' ? 'light' : 'dark');
  });
}

// Dark mode toggle in profile section
const darkModeToggleEl = $('darkModeToggle');
if (darkModeToggleEl) {
  darkModeToggleEl.addEventListener('change', () => {
    applyTheme(darkModeToggleEl.checked ? 'dark' : 'light');
  });
}

/* ──────────────────────────────────────────
   NAVIGATION
────────────────────────────────────────── */
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const menuToggleEl = $('menuToggle');
const sidebarEl    = $('sidebar');
const overlayEl    = $('sidebarOverlay');

function showSection(name) {
  sections.forEach(s => {
    s.classList.toggle('hidden', s.id !== 'section-' + name);
  });
  navItems.forEach(n => {
    n.classList.toggle('active', n.dataset.section === name);
  });
  // Render section-specific data
  if (name === 'schedule')  renderSchedule();
  if (name === 'sessions')  renderSessionHistory();
  if (name === 'analytics') renderAnalytics();
}

navItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    showSection(item.dataset.section);
    if (window.innerWidth <= 768) closeSidebar();
  });
});

function openSidebar() {
  sidebarEl.classList.add('open');
  overlayEl.classList.add('show');
  menuToggleEl.classList.add('is-open');
}
function closeSidebar() {
  sidebarEl.classList.remove('open');
  overlayEl.classList.remove('show');
  menuToggleEl.classList.remove('is-open');
}

if (menuToggleEl) {
  menuToggleEl.addEventListener('click', () => {
    if (sidebarEl.classList.contains('open')) closeSidebar();
    else openSidebar();
  });
}
if (overlayEl) {
  overlayEl.addEventListener('click', closeSidebar);
}

/* ──────────────────────────────────────────
   HEADER DATE
────────────────────────────────────────── */
function renderHeaderDate() {
  const el = $('currentDate');
  if (!el) return;
  el.textContent = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

/* ──────────────────────────────────────────
   WELCOME MESSAGE
────────────────────────────────────────── */
function updateWelcome() {
  const greeting = $('welcomeGreeting');
  const sub      = $('welcomeSub');
  const badge    = $('welcomeDateBadge');
  if (!greeting) return;

  const hour = new Date().getHours();
  const timeWord = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = (profile && profile.name) ? ', ' + profile.name : '';
  greeting.textContent = timeWord + name + '!';

  const quotes = [
    'Ready to make progress today?',
    'Every study session brings you closer to your goal.',
    'Consistency is the key to success. Keep going!',
    'Small progress is still progress. You got this!',
    "Focus, study, repeat. You're doing great!"
  ];
  if (sub) sub.textContent = quotes[new Date().getDate() % quotes.length];
  if (badge) badge.textContent = new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}

/* ──────────────────────────────────────────
   REMINDERS
────────────────────────────────────────── */
function renderReminders() {
  const strip = $('remindersStrip');
  if (!strip) return;
  const todayStr    = today();
  const tomorrowStr = getDateStr(1);
  const reminders   = [];

  tasks.forEach(t => {
    if (t.completed) return;
    if      (t.date < todayStr)    reminders.push('"' + t.subject + ' – ' + t.topic + '" is overdue.');
    else if (t.date === todayStr)  reminders.push('"' + t.subject + ' – ' + t.topic + '" is due today.');
    else if (t.date === tomorrowStr) reminders.push('"' + t.subject + ' – ' + t.topic + '" is due tomorrow.');
  });
  scheduleItems.forEach(s => {
    if (s.date === todayStr && s.status !== 'cancelled' && s.status !== 'completed') {
      reminders.push('Study session: "' + s.subject + '"' + (s.time ? ' at ' + s.time : '') + ' today.');
    }
  });

  if (!reminders.length) {
    strip.style.display = 'none';
    return;
  }
  strip.style.display = 'flex';
  strip.innerHTML = reminders.slice(0, 4).map(r =>
    '<div class="reminder-item">' + escHtml(r) + '</div>'
  ).join('');
}

/* ──────────────────────────────────────────
   STATS
────────────────────────────────────────── */
function renderStats() {
  const total   = tasks.length;
  const done    = tasks.filter(t => t.completed).length;
  const pending = total - done;
  const overdue = tasks.filter(t => !t.completed && t.date < today()).length;
  const pct     = total ? Math.round((done / total) * 100) : 0;

  const set = (id, val) => { const el = $(id); if (el) el.textContent = val; };
  set('statTotal',   total);
  set('statDone',    done);
  set('statPending', pending);
  set('statOverdue', overdue);
  set('progressPercent', pct + '%');
  set('statProgress', done + ' of ' + total + ' tasks completed');

  const bar = $('progressBar');
  if (bar) bar.style.width = pct + '%';

  // Nav badge
  const badge = $('navBadgeTasks');
  if (badge) badge.textContent = pending > 0 ? String(pending) : '';

  // Analytics mirror
  set('aStatTotal', total);
  set('aStatDone',  done);

  // Celebration
  if (total > 0 && pct === 100) launchConfetti();
}

/* ──────────────────────────────────────────
   BUILD TASK CARD
────────────────────────────────────────── */
function buildTaskCard(task) {
  const isToday   = task.date === today();
  const isOverdue = !task.completed && task.date < today();

  const card = document.createElement('div');
  card.className = 'task-card' + (task.completed ? ' completed' : '') + (isOverdue ? ' overdue' : '');
  card.dataset.id = task.id;

  const dateLabel = isToday ? 'Today' : formatDate(task.date);
  const dateCls   = isToday ? 'task-date today' : (isOverdue ? 'task-date overdue' : 'task-date');
  const statusCls = task.completed ? 'status-badge status-completed' : (isOverdue ? 'status-badge status-overdue' : 'status-badge status-pending');
  const statusLbl = task.completed ? 'Completed' : (isOverdue ? 'Overdue' : 'Pending');

  card.innerHTML =
    '<input type="checkbox" class="task-check" ' + (task.completed ? 'checked' : '') + ' aria-label="Toggle complete" />' +
    '<div class="task-body">' +
      '<div class="task-subject">' + escHtml(task.subject) + '</div>' +
      '<div class="task-topic">'   + escHtml(task.topic)   + '</div>' +
      '<div class="task-meta">' +
        '<span class="' + dateCls + '">' + escHtml(dateLabel) + '</span>' +
        '<span class="priority-badge priority-' + task.priority + '">' + task.priority + '</span>' +
        '<span class="' + statusCls + '">' + statusLbl + '</span>' +
        (task.duration ? '<span class="task-date">' + escHtml(task.duration) + '</span>' : '') +
      '</div>' +
      (task.notes ? '<div class="task-notes">' + escHtml(task.notes) + '</div>' : '') +
    '</div>' +
    '<div class="task-actions">' +
      '<button class="btn-icon edit"   title="Edit task"   aria-label="Edit task">✎</button>' +
      '<button class="btn-icon delete" title="Delete task" aria-label="Delete task">✕</button>' +
    '</div>';

  card.querySelector('.task-check').addEventListener('change', () => toggleComplete(task.id));
  card.querySelector('.edit').addEventListener('click',   () => openEditModal(task.id));
  card.querySelector('.delete').addEventListener('click', () => openDeleteModal(task.id));
  return card;
}

/* ──────────────────────────────────────────
   EMPTY STATE
────────────────────────────────────────── */
function emptyState(title, desc) {
  return '<div class="empty-state">' +
    '<svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>' +
    '</svg>' +
    '<p class="empty-state-title">' + escHtml(title) + '</p>' +
    '<p class="empty-state-desc">' + escHtml(desc) + '</p>' +
  '</div>';
}

/* ──────────────────────────────────────────
   RENDER LISTS
────────────────────────────────────────── */
function renderList(container, items, title, desc) {
  if (!container) return;
  container.innerHTML = '';
  if (!items.length) {
    container.innerHTML = emptyState(title, desc);
    return;
  }
  items.forEach(t => container.appendChild(buildTaskCard(t)));
}

/* ──────────────────────────────────────────
   DASHBOARD
────────────────────────────────────────── */
function renderDashboard() {
  updateWelcome();
  renderReminders();

  // Today
  renderList($('todayTaskList'),
    tasks.filter(t => t.date === today()),
    'No tasks today', 'Enjoy your day or plan ahead!');

  // High priority
  renderList($('highPriorityList'),
    tasks.filter(t => t.priority === 'High' && !t.completed),
    'No high priority tasks', 'All urgent work is done.');

  // Upcoming (next 7 days)
  const tom   = getDateStr(1);
  const week7 = getDateStr(7);
  renderList($('upcomingTaskList'),
    tasks.filter(t => !t.completed && t.date >= tom && t.date <= week7)
         .sort((a, b) => a.date.localeCompare(b.date)),
    'Nothing upcoming', 'No tasks in the next 7 days.');

  // Overdue
  renderList($('overdueTaskList'),
    tasks.filter(t => !t.completed && t.date < today()),
    "You're on track!", 'No overdue tasks.');
}

/* ──────────────────────────────────────────
   ALL TASKS (with filters)
────────────────────────────────────────── */
function renderAllTasks() {
  const search   = ($('searchInput')     ? $('searchInput').value.trim().toLowerCase()  : '');
  const priority = ($('filterPriority')  ? $('filterPriority').value                   : '');
  const statusF  = ($('filterStatus')    ? $('filterStatus').value                     : '');
  const dateF    = ($('filterDate')      ? $('filterDate').value                       : '');
  const todayStr = today();
  const tomStr   = getDateStr(1);
  const week7    = getDateStr(7);

  let filtered = tasks.filter(t => {
    if (search && !t.subject.toLowerCase().includes(search) && !t.topic.toLowerCase().includes(search)) return false;
    if (priority && t.priority !== priority) return false;
    if (statusF === 'pending')   { if (t.completed || t.date < todayStr) return false; }
    if (statusF === 'completed') { if (!t.completed) return false; }
    if (statusF === 'overdue')   { if (t.completed || t.date >= todayStr) return false; }
    if (dateF === 'today')    { if (t.date !== todayStr) return false; }
    if (dateF === 'tomorrow') { if (t.date !== tomStr)  return false; }
    if (dateF === 'week')     { if (t.date < todayStr || t.date > week7) return false; }
    if (dateF === 'overdue')  { if (t.completed || t.date >= todayStr) return false; }
    return true;
  });

  filtered.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.date.localeCompare(b.date);
  });

  const container = $('allTaskList');
  if (!container) return;
  container.innerHTML = '';
  if (!filtered.length) {
    container.innerHTML = emptyState('No tasks found', 'Try adjusting your filters.');
    return;
  }
  filtered.forEach(t => container.appendChild(buildTaskCard(t)));
}

/* ──────────────────────────────────────────
   FULL RENDER
────────────────────────────────────────── */
function renderAll() {
  renderStats();
  renderDashboard();
  renderAllTasks();
}

/* ──────────────────────────────────────────
   TOGGLE COMPLETE
────────────────────────────────────────── */
function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  tasks = tasks.map(t => t.id === id ? Object.assign({}, t, { completed: !t.completed }) : t);
  saveTasks(tasks);
  renderAll();
  if (!task.completed) showToast('Task marked as complete!', 'success');
  else                 showToast('Task marked as pending.', 'warning');
}

/* ──────────────────────────────────────────
   ADD / EDIT TASK MODAL
────────────────────────────────────────── */
const modalOverlay = $('modalOverlay');
const taskForm     = $('taskForm');

function openAddModal() {
  if (!taskForm) return;
  taskForm.reset();
  $('taskId').value    = '';
  $('modalTitle').textContent = 'Add New Task';
  $('taskDate').value  = today();
  clearTaskErrors();
  modalOverlay.classList.remove('hidden');
  $('taskSubject').focus();
}

function openEditModal(id) {
  const t = tasks.find(t => t.id === id);
  if (!t || !taskForm) return;
  taskForm.reset();
  $('taskId').value        = t.id;
  $('modalTitle').textContent = 'Edit Task';
  $('taskSubject').value   = t.subject;
  $('taskTopic').value     = t.topic;
  $('taskDate').value      = t.date;
  if ($('taskTime'))     $('taskTime').value     = t.time     || '';
  $('taskPriority').value  = t.priority;
  if ($('taskDuration')) $('taskDuration').value = t.duration || '';
  $('taskNotes').value     = t.notes || '';
  $('taskCompleted').checked = t.completed;
  clearTaskErrors();
  modalOverlay.classList.remove('hidden');
  $('taskSubject').focus();
}

function closeTaskModal() {
  if (modalOverlay) modalOverlay.classList.add('hidden');
}

function clearTaskErrors() {
  ['errSubject', 'errTopic', 'errDate'].forEach(id => {
    const el = $(id); if (el) el.textContent = '';
  });
}

function validateTaskForm() {
  clearTaskErrors();
  let ok = true;
  if (!$('taskSubject').value.trim()) { $('errSubject').textContent = 'Subject is required.'; ok = false; }
  if (!$('taskTopic').value.trim())   { $('errTopic').textContent   = 'Topic is required.';   ok = false; }
  if (!$('taskDate').value)           { $('errDate').textContent    = 'Date is required.';    ok = false; }
  return ok;
}

// Wire Add Task buttons (header + tasks section)
const addTaskBtnHeader = $('openAddModal');
const addTaskBtnTasks  = $('openAddModal2');
if (addTaskBtnHeader) addTaskBtnHeader.addEventListener('click', openAddModal);
if (addTaskBtnTasks)  addTaskBtnTasks.addEventListener('click',  openAddModal);

// Close / Cancel
const closeModalBtn  = $('closeModal');
const cancelModalBtn = $('cancelModal');
if (closeModalBtn)  closeModalBtn.addEventListener('click',  closeTaskModal);
if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeTaskModal);
if (modalOverlay) {
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeTaskModal(); });
}

// Form submit
if (taskForm) {
  taskForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateTaskForm()) return;
    const id = $('taskId').value;
    const newTask = {
      id:        id || uid(),
      subject:   $('taskSubject').value.trim(),
      topic:     $('taskTopic').value.trim(),
      date:      $('taskDate').value,
      time:      ($('taskTime')     ? $('taskTime').value     : ''),
      priority:  $('taskPriority').value,
      duration:  ($('taskDuration') ? $('taskDuration').value : ''),
      notes:     $('taskNotes').value.trim(),
      completed: $('taskCompleted').checked
    };
    if (id) {
      tasks = tasks.map(t => t.id === id ? newTask : t);
      showToast('Task updated!', 'success');
    } else {
      tasks = [newTask].concat(tasks);
      showToast('Task added!', 'success');
    }
    saveTasks(tasks);
    closeTaskModal();
    renderAll();
  });
}

/* ──────────────────────────────────────────
   DELETE TASK MODAL
────────────────────────────────────────── */
const deleteOverlay = $('deleteOverlay');

function openDeleteModal(id) {
  deleteTargetId = id;
  if (deleteOverlay) deleteOverlay.classList.remove('hidden');
}
function closeDeleteModal() {
  deleteTargetId = null;
  if (deleteOverlay) deleteOverlay.classList.add('hidden');
}

const closeDeleteBtn  = $('closeDelete');
const cancelDeleteBtn = $('cancelDelete');
const confirmDeleteBtn = $('confirmDelete');

if (closeDeleteBtn)   closeDeleteBtn.addEventListener('click',   closeDeleteModal);
if (cancelDeleteBtn)  cancelDeleteBtn.addEventListener('click',  closeDeleteModal);
if (deleteOverlay) {
  deleteOverlay.addEventListener('click', e => { if (e.target === deleteOverlay) closeDeleteModal(); });
}
if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener('click', () => {
    if (!deleteTargetId) return;
    tasks = tasks.filter(t => t.id !== deleteTargetId);
    saveTasks(tasks);
    closeDeleteModal();
    renderAll();
    showToast('Task deleted.', 'danger');
  });
}

/* ──────────────────────────────────────────
   FILTER LISTENERS
────────────────────────────────────────── */
const searchInputEl   = $('searchInput');
const filterPriorityEl = $('filterPriority');
const filterStatusEl  = $('filterStatus');
const filterDateEl    = $('filterDate');
const clearFiltersBtn = $('clearFilters');

if (searchInputEl)    searchInputEl.addEventListener('input',  renderAllTasks);
if (filterPriorityEl) filterPriorityEl.addEventListener('change', renderAllTasks);
if (filterStatusEl)   filterStatusEl.addEventListener('change',   renderAllTasks);
if (filterDateEl)     filterDateEl.addEventListener('change',     renderAllTasks);
if (clearFiltersBtn) {
  clearFiltersBtn.addEventListener('click', () => {
    if (searchInputEl)    searchInputEl.value    = '';
    if (filterPriorityEl) filterPriorityEl.value = '';
    if (filterStatusEl)   filterStatusEl.value   = '';
    if (filterDateEl)     filterDateEl.value      = '';
    renderAllTasks();
  });
}

/* ──────────────────────────────────────────
   WEEKLY TIMETABLE
────────────────────────────────────────── */
function renderTimetable() {
  const tbody = $('timetableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const todayDate = new Date();
  const dow       = todayDate.getDay();
  const monday    = new Date(todayDate);
  monday.setDate(todayDate.getDate() - ((dow + 6) % 7));

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const byDate = {};
  tasks.forEach(t => { (byDate[t.date] = byDate[t.date] || []).push(t); });

  const slots = ['Morning (8–10)', 'Late Morning (10–12)', 'Afternoon (12–15)', 'Evening (15–18)', 'Night (18–21)'];
  const todayStr = today();

  slots.forEach((slot, si) => {
    const tr = document.createElement('tr');
    let html = '<td>' + slot + '</td>';
    weekDates.forEach((dateStr, di) => {
      const dayTasks = (byDate[dateStr] || []).filter((_, idx) => idx % slots.length === si);
      const isToday  = dateStr === todayStr;
      const bg       = isToday ? 'background:#eff6ff;' : '';
      if (!dayTasks.length) {
        html += '<td style="' + bg + '"></td>';
      } else {
        const cells = dayTasks.map(t =>
          '<div class="tt-task priority-' + t.priority + (t.completed ? ' done' : '') + '">' +
          '<strong>' + escHtml(t.subject) + '</strong><br>' + escHtml(t.topic) + '</div>'
        ).join('');
        html += '<td style="' + bg + '"><div class="tt-cell">' + cells + '</div></td>';
      }
    });
    tr.innerHTML = html;
    tbody.appendChild(tr);
  });

  // Highlight today's column header
  const todayIdx = weekDates.indexOf(todayStr);
  if (todayIdx !== -1) {
    const headers = document.querySelectorAll('#timetableTable thead th');
    if (headers[todayIdx + 1]) headers[todayIdx + 1].style.background = '#1e40af';
  }
}

/* ──────────────────────────────────────────
   SCHEDULE SECTION
────────────────────────────────────────── */
function schedUid() {
  return 'sched-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
}

function buildScheduleCard(item) {
  const card = document.createElement('div');
  const statusClasses = { confirmed: '', tentative: 'tentative', cancelled: 'cancelled', completed: 'completed-sched' };
  card.className = 'schedule-card ' + (statusClasses[item.status] || '');
  card.dataset.id = item.id;

  const statusLabels = { confirmed: 'Confirmed', tentative: 'Tentative', completed: 'Completed', cancelled: 'Cancelled' };
  const statusBadgeCls = { confirmed: 'sched-confirmed', tentative: 'sched-tentative', completed: 'sched-completed', cancelled: 'sched-cancelled' };

  card.innerHTML =
    '<div class="sched-time-badge">' + escHtml(item.time || '--:--') + '</div>' +
    '<div class="sched-body">' +
      '<div class="sched-subject">' + escHtml(item.subject) + '</div>' +
      '<div class="sched-topic">'   + escHtml(item.topic)   + '</div>' +
      '<div class="sched-meta">' +
        '<span class="sched-status-badge ' + (statusBadgeCls[item.status] || '') + '">' + escHtml(statusLabels[item.status] || item.status) + '</span>' +
        (item.duration ? '<span>' + escHtml(item.duration) + '</span>' : '') +
        (item.location ? '<span>' + escHtml(item.location) + '</span>' : '') +
        '<span>' + formatDate(item.date) + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="sched-actions">' +
      '<button class="btn-icon edit"   title="Edit">✎</button>' +
      '<button class="btn-icon delete" title="Delete">✕</button>' +
    '</div>';

  card.querySelector('.edit').addEventListener('click',   () => openEditScheduleModal(item.id));
  card.querySelector('.delete').addEventListener('click', () => openDeleteScheduleModal(item.id));
  return card;
}

function renderSchedule() {
  const todayStr = today();

  // Today tab
  const todayList = $('todayScheduleList');
  if (todayList) {
    const todaySched = scheduleItems.filter(s => s.date === todayStr)
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    todayList.innerHTML = '';
    if (!todaySched.length) {
      todayList.innerHTML = emptyState('No sessions today', 'Add a study session to get started.');
    } else {
      todaySched.forEach(s => todayList.appendChild(buildScheduleCard(s)));
    }
  }

  // Upcoming tab
  const upList = $('upcomingScheduleList');
  if (upList) {
    const upcoming = scheduleItems.filter(s => s.date > todayStr && s.status !== 'cancelled')
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));
    upList.innerHTML = '';
    if (!upcoming.length) {
      upList.innerHTML = emptyState('No upcoming sessions', 'Plan ahead by adding study sessions.');
    } else {
      upcoming.forEach(s => upList.appendChild(buildScheduleCard(s)));
    }
  }
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId  = btn.dataset.tab;
    const tabBar = btn.closest('.tab-bar');
    if (!tabBar) return;
    tabBar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const section = btn.closest('.section');
    if (section) {
      section.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.toggle('hidden', p.id !== tabId);
      });
      if (tabId === 'tab-weekly-sched') renderTimetable();
    }
  });
});

// Schedule modal
const schedModalOverlay    = $('scheduleModalOverlay');
const scheduleFormEl       = $('scheduleForm');
const openAddSchedBtn      = $('openAddSchedule');
const closeSchedModalBtn   = $('closeScheduleModal');
const cancelSchedModalBtn  = $('cancelScheduleModal');

function openScheduleModal(mode, item) {
  if (!schedModalOverlay) return;
  $('scheduleModalTitle').textContent = mode === 'add' ? 'Add Study Session' : 'Edit Session';
  if (scheduleFormEl) scheduleFormEl.reset();
  $('scheduleId').value = item ? item.id : '';
  if (item) {
    $('schedSubject').value   = item.subject  || '';
    $('schedTopic').value     = item.topic    || '';
    $('schedDate').value      = item.date     || '';
    $('schedTime').value      = item.time     || '';
    $('schedDuration').value  = item.duration || '1 hour';
    $('schedStatus').value    = item.status   || 'confirmed';
    $('schedLocation').value  = item.location || '';
  } else {
    $('schedDate').value = today();
  }
  ['errSchedSubject','errSchedTopic','errSchedDate'].forEach(id => {
    const el = $(id); if (el) el.textContent = '';
  });
  schedModalOverlay.classList.remove('hidden');
  $('schedSubject').focus();
}

function closeScheduleModal() {
  if (schedModalOverlay) schedModalOverlay.classList.add('hidden');
}

function openEditScheduleModal(id) {
  const item = scheduleItems.find(s => s.id === id);
  if (item) openScheduleModal('edit', item);
}

if (openAddSchedBtn)    openAddSchedBtn.addEventListener('click',    () => openScheduleModal('add'));
if (closeSchedModalBtn) closeSchedModalBtn.addEventListener('click', closeScheduleModal);
if (cancelSchedModalBtn)cancelSchedModalBtn.addEventListener('click',closeScheduleModal);
if (schedModalOverlay) {
  schedModalOverlay.addEventListener('click', e => {
    if (e.target === schedModalOverlay) closeScheduleModal();
  });
}

if (scheduleFormEl) {
  scheduleFormEl.addEventListener('submit', e => {
    e.preventDefault();
    const sub = $('schedSubject').value.trim();
    const top = $('schedTopic').value.trim();
    const dt  = $('schedDate').value;
    let ok = true;
    if (!sub) { $('errSchedSubject').textContent = 'Subject required.'; ok = false; }
    if (!top) { $('errSchedTopic').textContent   = 'Topic required.';   ok = false; }
    if (!dt)  { $('errSchedDate').textContent    = 'Date required.';    ok = false; }
    if (!ok)  return;

    const id = $('scheduleId').value;
    const newItem = {
      id:       id || schedUid(),
      subject:  sub,
      topic:    top,
      date:     dt,
      time:     $('schedTime').value,
      duration: $('schedDuration').value,
      status:   $('schedStatus').value,
      location: $('schedLocation').value.trim()
    };

    if (id) {
      scheduleItems = scheduleItems.map(s => s.id === id ? newItem : s);
      showToast('Session updated!', 'success');
    } else {
      scheduleItems = [newItem].concat(scheduleItems);
      showToast('Session added!', 'success');
    }
    saveSchedule(scheduleItems);
    closeScheduleModal();
    renderSchedule();
    renderReminders();
  });
}

// Delete schedule modal
const deleteSchedOverlay    = $('deleteScheduleOverlay');
const closeDeleteSchedBtn   = $('closeDeleteSchedule');
const cancelDeleteSchedBtn  = $('cancelDeleteSchedule');
const confirmDeleteSchedBtn = $('confirmDeleteSchedule');

function openDeleteScheduleModal(id) {
  deleteSchedId = id;
  if (deleteSchedOverlay) deleteSchedOverlay.classList.remove('hidden');
}
function closeDeleteScheduleModal() {
  deleteSchedId = null;
  if (deleteSchedOverlay) deleteSchedOverlay.classList.add('hidden');
}

if (closeDeleteSchedBtn)   closeDeleteSchedBtn.addEventListener('click',   closeDeleteScheduleModal);
if (cancelDeleteSchedBtn)  cancelDeleteSchedBtn.addEventListener('click',  closeDeleteScheduleModal);
if (deleteSchedOverlay) {
  deleteSchedOverlay.addEventListener('click', e => {
    if (e.target === deleteSchedOverlay) closeDeleteScheduleModal();
  });
}
if (confirmDeleteSchedBtn) {
  confirmDeleteSchedBtn.addEventListener('click', () => {
    if (!deleteSchedId) return;
    scheduleItems = scheduleItems.filter(s => s.id !== deleteSchedId);
    saveSchedule(scheduleItems);
    closeDeleteScheduleModal();
    renderSchedule();
    showToast('Session deleted.', 'danger');
  });
}

/* ──────────────────────────────────────────
   STUDY SESSION TIMER
────────────────────────────────────────── */
let timerInterval  = null;
let timerSeconds   = 0;
let timerRunning   = false;
let currentSession = null;

function formatTimer(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

function setTimerButtons(state) {
  const map = {
    btnStartSession:    state === 'idle',
    btnPauseSession:    state === 'running',
    btnResumeSession:   state === 'paused',
    btnCompleteSession: state !== 'idle',
    btnCancelSession:   state !== 'idle'
  };
  Object.entries(map).forEach(([id, show]) => {
    const el = $(id);
    if (el) el.classList.toggle('hidden', !show);
  });
  const disp = $('timerDisplay');
  if (disp) disp.style.opacity = state === 'paused' ? '.55' : '1';
}

function startTimer(subject, topic, plannedMins) {
  if (timerInterval) clearInterval(timerInterval);
  currentSession = { subject, topic, planned: plannedMins, start: new Date().toISOString() };
  timerSeconds   = 0;
  timerRunning   = true;
  const titleEl = $('timerTitle');
  const subEl   = $('timerSub');
  const dispEl  = $('timerDisplay');
  if (titleEl) titleEl.textContent = subject + (topic ? ' \u2013 ' + topic : '');
  if (subEl)   subEl.textContent   = 'Planned: ' + plannedMins + ' minutes';
  if (dispEl)  dispEl.textContent  = '00:00:00';
  timerInterval = setInterval(() => {
    timerSeconds++;
    if (dispEl) dispEl.textContent = formatTimer(timerSeconds);
  }, 1000);
  setTimerButtons('running');
  showToast('Session started: ' + subject, 'info');
}

// Start session modal
const startSessModal = $('startSessionModal');

const btnStartEl = $('btnStartSession');
if (btnStartEl) {
  btnStartEl.addEventListener('click', () => {
    if (startSessModal) startSessModal.classList.remove('hidden');
  });
}

const closeStartSessBtn  = $('closeStartSessionModal');
const cancelStartSessBtn = $('cancelStartSession');
const startSessForm      = $('startSessionForm');

if (closeStartSessBtn)  closeStartSessBtn.addEventListener('click',  () => { if (startSessModal) startSessModal.classList.add('hidden'); });
if (cancelStartSessBtn) cancelStartSessBtn.addEventListener('click', () => { if (startSessModal) startSessModal.classList.add('hidden'); });
if (startSessModal) {
  startSessModal.addEventListener('click', e => { if (e.target === startSessModal) startSessModal.classList.add('hidden'); });
}

if (startSessForm) {
  startSessForm.addEventListener('submit', e => {
    e.preventDefault();
    const subVal = $('sesSubject') ? $('sesSubject').value.trim() : '';
    const errEl  = $('errSesSubject');
    if (!subVal) { if (errEl) errEl.textContent = 'Subject is required.'; return; }
    if (errEl)   errEl.textContent = '';
    const topVal  = $('sesTopic')   ? $('sesTopic').value.trim()     : '';
    const planVal = $('sesPlanned') ? parseInt($('sesPlanned').value) : 60;
    if (startSessModal) startSessModal.classList.add('hidden');
    startSessForm.reset();
    startTimer(subVal, topVal, planVal);
    showSection('sessions');
  });
}

const btnPauseEl    = $('btnPauseSession');
const btnResumeEl   = $('btnResumeSession');
const btnCompleteEl = $('btnCompleteSession');
const btnCancelEl   = $('btnCancelSession');

if (btnPauseEl) {
  btnPauseEl.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerRunning = false;
    setTimerButtons('paused');
    showToast('Session paused.', 'warning');
  });
}
if (btnResumeEl) {
  btnResumeEl.addEventListener('click', () => {
    const dispEl = $('timerDisplay');
    timerRunning = true;
    timerInterval = setInterval(() => {
      timerSeconds++;
      if (dispEl) dispEl.textContent = formatTimer(timerSeconds);
    }, 1000);
    setTimerButtons('running');
    showToast('Session resumed.', 'info');
  });
}
if (btnCompleteEl) {
  btnCompleteEl.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerRunning  = false;
    const minutes = Math.max(1, Math.round(timerSeconds / 60));
    const entry = {
      id:      'ses-' + Date.now(),
      subject: currentSession ? currentSession.subject : 'Study Session',
      topic:   currentSession ? currentSession.topic   : '',
      planned: currentSession ? currentSession.planned : 0,
      actual:  minutes,
      date:    today(),
      end:     new Date().toISOString()
    };
    sessionHistory = [entry].concat(sessionHistory);
    saveSessions(sessionHistory);
    currentSession = null;
    timerSeconds   = 0;
    const titleEl = $('timerTitle');
    const subEl   = $('timerSub');
    const dispEl  = $('timerDisplay');
    if (titleEl) titleEl.textContent = 'No active session';
    if (subEl)   subEl.textContent   = 'Start a new study session below.';
    if (dispEl)  dispEl.textContent  = '00:00:00';
    setTimerButtons('idle');
    renderSessionHistory();
    renderAnalytics();
    showToast('Session complete! ' + minutes + ' min studied.', 'success');
    launchConfetti();
  });
}
if (btnCancelEl) {
  btnCancelEl.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerRunning = false;
    currentSession = null;
    timerSeconds   = 0;
    const titleEl = $('timerTitle');
    const subEl   = $('timerSub');
    const dispEl  = $('timerDisplay');
    if (titleEl) titleEl.textContent = 'No active session';
    if (subEl)   subEl.textContent   = 'Start a new study session below.';
    if (dispEl)  dispEl.textContent  = '00:00:00';
    setTimerButtons('idle');
    showToast('Session cancelled.', 'warning');
  });
}

function renderSessionHistory() {
  const container = $('sessionHistory');
  if (!container) return;
  container.innerHTML = '';
  if (!sessionHistory.length) {
    container.innerHTML = emptyState('No sessions yet', 'Complete a study session to see your history.');
    return;
  }
  sessionHistory.slice(0, 20).forEach(s => {
    const div = document.createElement('div');
    div.className = 'session-entry';
    div.innerHTML =
      '<div class="session-info">' +
        '<div class="session-subject">' + escHtml(s.subject) + (s.topic ? ' \u2013 ' + escHtml(s.topic) : '') + '</div>' +
        '<div class="session-meta">' + formatDate(s.date) + ' &middot; Planned: ' + s.planned + 'm</div>' +
      '</div>' +
      '<div class="session-duration">' + s.actual + 'm</div>';
    container.appendChild(div);
  });
}

/* ──────────────────────────────────────────
   ANALYTICS
────────────────────────────────────────── */
function renderAnalytics() {
  const total   = tasks.length;
  const done    = tasks.filter(t => t.completed).length;
  const totalSess = sessionHistory.length;
  const totalMins = sessionHistory.reduce((sum, s) => sum + (s.actual || 0), 0);

  const set = (id, val) => { const el = $(id); if (el) el.textContent = val; };
  set('aStatTotal',    total);
  set('aStatDone',     done);
  set('aStatSessions', totalSess);
  set('aStatTime',     totalMins >= 60 ? Math.round(totalMins / 60) + 'h' : totalMins + 'm');

  // Subject progress
  const subjList = $('subjectProgressList');
  if (subjList) {
    const map = {};
    tasks.forEach(t => {
      if (!map[t.subject]) map[t.subject] = { total: 0, done: 0 };
      map[t.subject].total++;
      if (t.completed) map[t.subject].done++;
    });
    const entries = Object.entries(map).sort((a, b) => b[1].total - a[1].total);
    if (!entries.length) {
      subjList.innerHTML = emptyState('No tasks yet', 'Add tasks to see subject-wise progress.');
    } else {
      subjList.innerHTML = '';
      entries.forEach(([name, data]) => {
        const pct = data.total ? Math.round((data.done / data.total) * 100) : 0;
        const row = document.createElement('div');
        row.className = 'subject-row';
        row.innerHTML =
          '<div class="subject-row-header">' +
            '<span class="subject-name">' + escHtml(name) + '</span>' +
            '<span class="subject-pct">' + pct + '%</span>' +
          '</div>' +
          '<div class="subject-bar-bg"><div class="subject-bar-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="subject-counts">' + data.done + ' / ' + data.total + ' tasks completed</div>';
        subjList.appendChild(row);
      });
    }
  }

  // Weekly chart
  const chartEl = $('weeklyChart');
  if (chartEl) {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const todayDate = new Date();
    const dow = todayDate.getDay();
    const monday = new Date(todayDate);
    monday.setDate(todayDate.getDate() - ((dow + 6) % 7));
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday); d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });
    const counts   = weekDates.map(d => tasks.filter(t => t.completed && t.date === d).length);
    const maxCount = Math.max(1, ...counts);
    const todayStr = today();
    chartEl.innerHTML = '';
    weekDates.forEach((dateStr, i) => {
      const count   = counts[i];
      const heightPct = Math.max(3, Math.round((count / maxCount) * 100));
      const isToday = dateStr === todayStr;
      const wrap = document.createElement('div');
      wrap.className = 'week-bar-wrap' + (isToday ? ' today' : '');
      wrap.innerHTML =
        '<div class="week-bar" style="height:' + heightPct + '%">' +
          (count ? '<span class="week-bar-val">' + count + '</span>' : '') +
        '</div>' +
        '<span class="week-day-label">' + days[i] + '</span>';
      chartEl.appendChild(wrap);
    });
  }

  // Priority breakdown
  const bkEl = $('priorityBreakdown');
  if (bkEl) {
    const total2 = tasks.length || 1;
    const counts = { High: 0, Medium: 0, Low: 0 };
    tasks.forEach(t => { if (counts[t.priority] !== undefined) counts[t.priority]++; });
    bkEl.innerHTML = '';
    [['High','high'], ['Medium','medium'], ['Low','low']].forEach(([lbl, cls]) => {
      const pct = Math.round((counts[lbl] / total2) * 100);
      const row = document.createElement('div');
      row.className = 'priority-row';
      row.innerHTML =
        '<span class="priority-label">' + lbl + '</span>' +
        '<div class="priority-bar-bg">' +
          '<div class="priority-bar-fill priority-bar-' + cls + '" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<span class="priority-count">' + counts[lbl] + '</span>';
      bkEl.appendChild(row);
    });
  }
}

/* ──────────────────────────────────────────
   PROFILE
────────────────────────────────────────── */
function renderProfile() {
  if (!profile) profile = {};
  const name     = profile.name    || 'Student';
  const course   = profile.course  || 'Course';
  const semester = profile.semester || '';
  const college  = profile.college || 'College / University';
  const initials = name.trim().split(/\s+/).map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || 'S';

  // Sidebar
  const av = $('sidebarAvatar');
  const sn = $('sidebarName');
  const sc = $('sidebarCourse');
  if (av) av.textContent = initials;
  if (sn) sn.textContent = name;
  if (sc) sc.textContent = course;

  // Profile section
  const bigAv = $('profileAvatarBig');
  const pName = $('profileDisplayName');
  const pCourse = $('profileDisplayCourse');
  const pColl   = $('profileDisplayCollege');
  if (bigAv)  bigAv.textContent  = initials;
  if (pName)  pName.textContent  = name;
  if (pCourse) pCourse.textContent = [course, semester].filter(Boolean).join(' \u00b7 ');
  if (pColl)  pColl.textContent  = college;

  // Form fields
  const fields = { profName: 'name', profCourse: 'course', profSemester: 'semester', profCollege: 'college', profGoal: 'goal' };
  Object.entries(fields).forEach(([id, key]) => {
    const el = $(id); if (el) el.value = profile[key] || '';
  });
}

const profileFormEl = $('profileForm');
if (profileFormEl) {
  profileFormEl.addEventListener('submit', e => {
    e.preventDefault();
    profile = {
      name:     ($('profName')     ? $('profName').value.trim()     : '') || 'Student',
      course:   ($('profCourse')   ? $('profCourse').value.trim()   : '') || 'Course',
      semester: ($('profSemester') ? $('profSemester').value.trim() : ''),
      college:  ($('profCollege')  ? $('profCollege').value.trim()  : ''),
      goal:     ($('profGoal')     ? $('profGoal').value            : '4')
    };
    saveProfile(profile);
    renderProfile();
    updateWelcome();
    showToast('Profile saved!', 'success');
  });
}

/* ──────────────────────────────────────────
   QUICK ACTIONS
────────────────────────────────────────── */
const qaAddTaskBtn  = $('qaAddTask');
const qaAddSchedBtn = $('qaAddSchedule');
const qaStartSessBtn = $('qaStartSession');

if (qaAddTaskBtn)   qaAddTaskBtn.addEventListener('click',   openAddModal);
if (qaAddSchedBtn)  qaAddSchedBtn.addEventListener('click',  () => { showSection('schedule'); openScheduleModal('add'); });
if (qaStartSessBtn) qaStartSessBtn.addEventListener('click', () => { if (startSessModal) startSessModal.classList.remove('hidden'); });

/* ──────────────────────────────────────────
   KEYBOARD: ESCAPE
────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeTaskModal();
  closeDeleteModal();
  closeScheduleModal();
  closeDeleteScheduleModal();
  if (startSessModal) startSessModal.classList.add('hidden');
});

/* ──────────────────────────────────────────
   INIT
────────────────────────────────────────── */
initTheme();
renderHeaderDate();
renderProfile();
renderAll();
renderSessionHistory();
showSection('dashboard');

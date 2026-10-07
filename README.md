# 📚 Student Study Planner

A polished, modern and fully responsive student productivity web application built with pure HTML, CSS and JavaScript — no frameworks, no backend required.

---

## Overview

The **Student Study Planner** is a browser-based productivity tool designed to help students manage their academic tasks, study sessions, schedules, and progress in one clean interface. Built as an IBM SkillsBuild Machine Learning & Applied AI internship project, it demonstrates modern web development skills including responsive design, animation systems, localStorage persistence, and clean JavaScript architecture.

---

## Features

### 🏠 Dashboard
- Personalised welcome greeting (Good morning / afternoon / evening, [Name])
- Dynamic motivational message
- Real-time stats: Total Tasks, Completed, Pending, Overdue
- Animated progress bar
- Quick action buttons (Add Task, Add Schedule, Start Session)
- Today's tasks, High Priority tasks, Upcoming tasks, Overdue tasks
- In-app reminders strip (overdue, due today, due tomorrow, scheduled sessions)

### 📝 Task Management
- Add, edit, delete tasks
- Task fields: Subject, Topic, Date, Time, Priority, Estimated Duration, Notes, Completion status
- Priority levels: High (🔴), Medium (🟡), Low (🟢)
- Mark tasks complete / incomplete with animated transition
- Overdue tasks automatically detected and highlighted
- Animated task appearance on add, animated removal on delete

### 🔍 Search & Filter
- Search by subject or topic (live)
- Filter by Priority, Status (Pending / In Progress / Completed / Overdue), Date (Today / Tomorrow / This Week / Overdue)
- Clear all filters button

### 📅 Schedule
- Add, edit, delete study sessions
- Session fields: Subject, Topic, Date, Time, Duration, Status, Location/Mode
- Status types: Confirmed ✅, Tentative 🔵, Completed 🟢, Cancelled ❌
- Tabs: Today's Sessions, Weekly Timetable, Upcoming Sessions
- Weekly timetable grid with colour-coded priority tasks

### ⏱ Study Sessions (Timer)
- Start a study session with Subject, Topic, Planned Duration
- Live timer display (HH:MM:SS)
- Pause, Resume, Complete, Cancel controls
- Session history saved to localStorage
- Confetti celebration on session completion

### 📊 Analytics
- Overall stats: Total Tasks, Completed, Sessions Done, Total Study Time
- Subject-wise progress bars with completion percentage
- Weekly tasks completed bar chart (Mon–Sun, current week highlighted)
- Priority breakdown visual (High / Medium / Low)

### 👤 Profile
- Student Name, Course, Semester, College/University, Daily Study Goal
- Profile avatar with initials
- Name displayed throughout the app
- Dark/light mode preference toggle

### 🌙 Dark / Light Mode
- Smooth animated theme transition
- No page reload
- Preference saved in localStorage
- Accessible contrast in both modes

---

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Page structure, semantic markup |
| CSS3 | Design system, animations, dark mode, responsive layout |
| Vanilla JavaScript (ES6+) | All logic, CRUD, timers, localStorage, animations |
| localStorage (browser) | Data persistence — no backend needed |
| Canvas API | Confetti celebration animation |
| MutationObserver API | Reactive overdue class patching |
| CSS Custom Properties | Theme system and design tokens |

---

## Project Structure

```
student-study-planner/
├── index.html    ← Full page structure, all sections, all modals
├── style.css     ← Complete design system, animations, dark mode, responsive styles
├── app.js        ← All application logic, CRUD, timers, analytics, profile
└── README.md     ← This file
```

---

## How to Run

1. Download or clone the project folder.
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).
3. No installation, no build step, no server required.

> The app seeds 8 sample tasks on first load so it works immediately.

---

## LocalStorage

All data is saved automatically in the browser's localStorage. No data is sent to any server.

| Key | Contents |
|---|---|
| `studyPlannerTasks` | All tasks (existing key, backward compatible) |
| `studySchedule` | Schedule / study sessions |
| `studySessions` | Timer session history |
| `studyProfile` | Student profile (name, course, etc.) |
| `studyTheme` | `"light"` or `"dark"` preference |

Data persists after page refresh and browser close/reopen.

---

## Responsive Design

The application is fully responsive and tested at:

| Breakpoint | Layout |
|---|---|
| 320px–480px (mobile) | Single column, hamburger menu, stacked cards |
| 481px–768px (large mobile) | Single column, collapsed sidebar |
| 769px–1024px (tablet) | Two-column dashboard, collapsible sidebar |
| 1025px+ (desktop) | Full sidebar, multi-column dashboard |

---

## Animation System

| Animation | Where |
|---|---|
| Staggered slide-up | Dashboard stat cards on load |
| Slide-down | Welcome banner, reminders strip |
| Scale-in | Modals opening |
| Task appear (slide-right) | New task cards added to lists |
| Task remove (slide-right + fade) | Task deletion |
| Animated counter | Stat numbers increment smoothly |
| Progress bar grow | Progress bar width transition |
| Timer pulse | Active study timer subtle pulse |
| Toast slide-in/out | Notification toasts |
| Confetti canvas | Task completion / session complete |
| Hamburger transform | Mobile menu open/close |
| Sidebar slide | Mobile sidebar open/close |
| Theme crossfade | Dark/light mode switch |
| `prefers-reduced-motion` | All animations disabled for accessibility |

---

## Key Features for Demonstration

- **Works offline** — no internet connection needed
- **Data persists** — tasks survive browser close
- **Immediate demo** — 8 sample tasks loaded on first open
- **Dark mode** — toggle in header or profile settings
- **Complete CRUD** — add, edit, delete, mark complete
- **Live filters** — instant search and filter with no page reload
- **Study timer** — real-time stopwatch with session logging
- **Confetti** — appears on completing all tasks or a study session

---

## Future Improvements

- Export tasks to PDF or CSV
- Cloud sync (Firebase / Supabase)
- Browser push notifications for reminders
- Pomodoro timer mode
- Subject colour customisation
- Exam date countdown widget
- Recurring task support
- Notes / flashcard section

---

## Author

Built as part of the **IBM SkillsBuild Machine Learning & Applied AI Internship** programme.

> This project demonstrates HTML, CSS, and JavaScript skills including responsive design, browser localStorage API, animation systems, and single-page application architecture — without using any frameworks.

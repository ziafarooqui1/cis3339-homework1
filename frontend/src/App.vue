<script setup>
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <RouterLink class="brand" to="/students" aria-label="Student Management home">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 19V8.5L12 4l8 4.5V19M8 19v-5h8v5M9 9h.01M15 9h.01" />
          </svg>
        </span>
        <span class="brand-copy">
          <strong>Student Management</strong>
          <small>SYSTEM</small>
        </span>
      </RouterLink>

      <nav class="main-nav" aria-label="Main navigation">
        <RouterLink to="/students">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="9" cy="8" r="3" />
            <path d="M3.5 19c.5-3 2.4-4.5 5.5-4.5s5 1.5 5.5 4.5M16 5.5a3 3 0 0 1 0 5.8M17 14.8c2.1.5 3.3 1.9 3.6 4.2" />
          </svg>
          <span>Students</span>
        </RouterLink>
        <RouterLink to="/courses">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21zM4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 10h6" />
          </svg>
          <span>Courses</span>
        </RouterLink>
        <RouterLink to="/enrollments">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM8 9h8M8 13h5M8 17h3M7 2v4M17 2v4" />
          </svg>
          <span>Enrollments</span>
        </RouterLink>
      </nav>

    </aside>

    <div class="main-panel">
      <header class="topbar">
        <span>STUDENT MANAGEMENT SYSTEM</span>
      </header>
      <main class="page-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

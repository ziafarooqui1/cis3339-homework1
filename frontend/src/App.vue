<script setup>
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <RouterLink class="brand" to="/students" aria-label="Student Management home">
        <span class="brand-mark" aria-hidden="true">S</span>
        <span>Student Management</span>
      </RouterLink>
      <nav class="main-nav" aria-label="Main navigation">
        <RouterLink to="/students">Students</RouterLink>
        <RouterLink to="/courses">Courses</RouterLink>
        <RouterLink to="/enrollments">Enrollments</RouterLink>
      </nav>
    </header>
    <main class="page-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import StudentAddForm from '../components/StudentAddForm.vue';
import StudentResultCard from '../components/StudentResultCard.vue';
import StudentSearchForm from '../components/StudentSearchForm.vue';
import { useStudentsStore } from '../stores/students';

const studentsStore = useStudentsStore();
const { student, notice, activeAction, hasStudent } = storeToRefs(studentsStore);
</script>

<template>
  <section class="view-intro">
    <p class="eyebrow">Student Management</p>
    <h1>Students</h1>
    <p class="intro">Find a student record or add a student to the system.</p>
  </section>

  <p
    v-if="notice"
    class="notice"
    :class="`notice-${notice.type}`"
    role="status"
    aria-live="polite"
  >
    {{ notice.message }}
  </p>

  <div class="student-layout">
    <section class="view-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Find a record</p>
          <h2>Search students</h2>
        </div>
      </div>
      <StudentSearchForm @search="studentsStore.searchStudent" />
    </section>

    <section class="view-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">New record</p>
          <h2>Add a student</h2>
        </div>
      </div>
      <StudentAddForm
        :loading="activeAction === 'add'"
        @add="studentsStore.addStudent"
      />
    </section>

    <StudentResultCard
      :student="hasStudent ? student : null"
      :loading="activeAction === 'delete'"
      @delete="studentsStore.deleteStudent"
    />
  </div>
</template>

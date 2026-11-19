<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import CourseAddForm from '../components/CourseAddForm.vue';
import CourseList from '../components/CourseList.vue';
import { useCoursesStore } from '../stores/courses';

const coursesStore = useCoursesStore();
const { courses, notice, loading, activeAction, hasCourses } = storeToRefs(coursesStore);

onMounted(coursesStore.loadCourses);
</script>

<template>
  <section class="view-intro">
    <p class="eyebrow">Course Management</p>
    <h1>Courses</h1>
    <p class="intro">Add courses to the catalog and manage existing records.</p>
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

  <div class="course-layout">
    <section class="view-card course-add-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">New course</p>
          <h2>Add a course</h2>
        </div>
      </div>
      <CourseAddForm
        :loading="activeAction === 'add'"
        @add="coursesStore.addCourse"
      />
    </section>

    <CourseList
      :courses="courses"
      :loading="loading"
      :active-action="activeAction"
      @delete="coursesStore.deleteCourse"
    />
  </div>
</template>

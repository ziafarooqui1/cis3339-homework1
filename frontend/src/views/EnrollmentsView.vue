<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import EnrollmentForm from '../components/EnrollmentForm.vue';
import { useEnrollmentsStore } from '../stores/enrollments';

const enrollmentStore = useEnrollmentsStore();
const {
  students,
  courses,
  roster,
  selectedStudentId,
  selectedCourseId,
  rosterCourseId,
  notice,
  loading
} = storeToRefs(enrollmentStore);

onMounted(enrollmentStore.loadSelections);
</script>

<template>
  <section class="view-intro">
    <p class="eyebrow">Enrollment Management</p>
    <h1>Enrollments</h1>
    <p class="intro">Enroll existing students in courses and review course rosters.</p>
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

  <div class="enrollment-layout">
    <section class="view-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">New enrollment</p>
          <h2>Enroll a student</h2>
        </div>
      </div>
      <EnrollmentForm
        :students="students"
        :courses="courses"
        :student-id="selectedStudentId"
        :course-id="selectedCourseId"
        :loading="loading"
        @update:student-id="selectedStudentId = $event"
        @update:course-id="selectedCourseId = $event"
        @enroll="enrollmentStore.enrollStudent"
      />
    </section>

    <section class="view-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Course roster</p>
          <h2>View enrolled students</h2>
        </div>
      </div>
      <label for="roster-course">Course</label>
      <select
        id="roster-course"
        v-model="rosterCourseId"
        class="roster-select"
        @change="enrollmentStore.loadRoster(rosterCourseId)"
      >
        <option value="" disabled>Select a course</option>
        <option v-for="course in courses" :key="course.courseId" :value="course.courseId">
          {{ course.courseId }} - {{ course.name }}
        </option>
      </select>

      <p v-if="loading" class="empty-state roster-state" role="status">Loading roster…</p>
      <div v-else-if="roster.length" class="course-table-wrap roster-state">
        <table class="data-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Student ID</th>
              <th scope="col">Phone</th>
              <th scope="col">ZIP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in roster" :key="student.id">
              <td>{{ student.name }}</td>
              <td>{{ student.id }}</td>
              <td>{{ student.phone }}</td>
              <td>{{ student.zip }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty-state roster-state">
        {{ rosterCourseId ? 'No students are enrolled in this course.' : 'Select a course to view enrolled students.' }}
      </p>
    </section>
  </div>
</template>

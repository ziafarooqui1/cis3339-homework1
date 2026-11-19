<script setup>
defineProps({
  students: { type: Array, default: () => [] },
  courses: { type: Array, default: () => [] },
  studentId: { type: String, default: '' },
  courseId: { type: String, default: '' },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['update:studentId', 'update:courseId', 'enroll']);
</script>

<template>
  <form class="form-stack" @submit.prevent="emit('enroll')">
    <label for="enrollment-student">Student</label>
    <select
      id="enrollment-student"
      :value="studentId"
      name="studentId"
      required
      @change="emit('update:studentId', $event.target.value)"
    >
      <option value="" disabled>Select a student</option>
      <option v-for="student in students" :key="student.id" :value="student.id">
        {{ student.name }} ({{ student.id }})
      </option>
    </select>

    <label for="enrollment-course">Course</label>
    <select
      id="enrollment-course"
      :value="courseId"
      name="courseId"
      required
      @change="emit('update:courseId', $event.target.value)"
    >
      <option value="" disabled>Select a course</option>
      <option v-for="course in courses" :key="course.courseId" :value="course.courseId">
        {{ course.courseId }} - {{ course.name }}
      </option>
    </select>

    <button class="button button-primary" type="submit" :disabled="loading">
      {{ loading ? 'Saving enrollment…' : 'Enroll student' }}
    </button>
  </form>
</template>

<script setup>
import { reactive } from 'vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['add']);
const form = reactive({ courseId: '', name: '' });

function submitCourse() {
  emit('add', { ...form });
}
</script>

<template>
  <form class="form-stack" @submit.prevent="submitCourse">
    <label for="course-id">Course ID</label>
    <input
      id="course-id"
      v-model="form.courseId"
      name="courseId"
      placeholder="CIS 3339"
      required
    />

    <label for="course-name">Course name</label>
    <input
      id="course-name"
      v-model="form.name"
      name="name"
      placeholder="Enterprise Applications Development"
      required
    />

    <button class="button button-primary" type="submit" :disabled="props.loading">
      {{ props.loading ? 'Saving course…' : 'Add course' }}
    </button>
  </form>
</template>

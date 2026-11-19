<script setup>
import { reactive } from 'vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['add']);
const form = reactive({ name: '', id: '', phone: '', zip: '' });

function submitStudent() {
  emit('add', { ...form });
}
</script>

<template>
  <form class="form-stack" @submit.prevent="submitStudent">
    <label for="student-name">Name</label>
    <input id="student-name" v-model="form.name" autocomplete="name" name="name" required />

    <label for="student-id">Student ID</label>
    <input id="student-id" v-model="form.id" name="id" required />

    <label for="student-phone">Phone number</label>
    <input id="student-phone" v-model="form.phone" autocomplete="tel" name="phone" required />

    <label for="student-zip">ZIP code</label>
    <input id="student-zip" v-model="form.zip" autocomplete="postal-code" name="zip" required />

    <button class="button button-primary" type="submit" :disabled="props.loading">
      {{ props.loading ? 'Saving student…' : 'Add student' }}
    </button>
  </form>
</template>

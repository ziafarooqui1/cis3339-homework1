<script setup>
import { ref } from 'vue';

const emit = defineEmits(['search']);
const name = ref('');

function submitSearch() {
  emit('search', name.value);
}
</script>

<template>
  <form class="form-stack" @submit.prevent="submitSearch">
    <label for="student-search-name">Student name</label>
    <div class="inline-form">
      <input
        id="student-search-name"
        v-model="name"
        autocomplete="name"
        name="name"
        placeholder="Search by exact name"
        required
      />
      <button class="button button-secondary" type="submit">Search</button>
    </div>
  </form>
</template>

<script setup>
const props = defineProps({
  student: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['delete']);

function requestDelete() {
  if (props.student && window.confirm(`Delete student ${props.student.name}?`)) {
    emit('delete');
  }
}
</script>

<template>
  <section class="result-panel" aria-labelledby="student-result-title">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Record</p>
        <h2 id="student-result-title">Student details</h2>
      </div>
      <button
        v-if="props.student"
        class="button button-danger"
        type="button"
        :disabled="props.loading"
        @click="requestDelete"
      >
        Delete
      </button>
    </div>
    <dl v-if="props.student" class="student-details">
      <div>
        <dt>Name</dt>
        <dd>{{ props.student.name }}</dd>
      </div>
      <div>
        <dt>Student ID</dt>
        <dd>{{ props.student.id }}</dd>
      </div>
      <div>
        <dt>Phone</dt>
        <dd>{{ props.student.phone }}</dd>
      </div>
      <div>
        <dt>ZIP code</dt>
        <dd>{{ props.student.zip }}</dd>
      </div>
    </dl>
    <p v-else class="empty-state">Search for a student or add a new record to see details here.</p>
  </section>
</template>

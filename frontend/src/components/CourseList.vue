<script setup>
const props = defineProps({
  courses: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  activeAction: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['delete']);

function requestDelete(course) {
  if (window.confirm(`Delete course ${course.courseId}?`)) {
    emit('delete', course.courseId);
  }
}
</script>

<template>
  <section class="course-list result-panel" aria-labelledby="course-list-title">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Catalog</p>
        <h2 id="course-list-title">All courses</h2>
      </div>
    </div>

    <p v-if="props.loading" class="empty-state" role="status">Loading courses…</p>

    <div v-else-if="props.courses.length" class="course-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th scope="col">Course ID</th>
            <th scope="col">Course name</th>
            <th scope="col"><span class="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in props.courses" :key="course.courseId">
            <td>{{ course.courseId }}</td>
            <td>{{ course.name }}</td>
            <td class="table-action">
              <button
                class="button button-danger"
                type="button"
                :disabled="props.activeAction === `delete:${course.courseId}`"
                @click="requestDelete(course)"
              >
                {{ props.activeAction === `delete:${course.courseId}` ? 'Deleting…' : 'Delete' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="empty-state">No courses have been added yet.</p>
  </section>
</template>

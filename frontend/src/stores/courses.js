import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

async function request(path, options) {
  const response = await fetch(path, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'The request could not be completed.');
  }

  return result;
}

export const useCoursesStore = defineStore('courses', () => {
  const courses = ref([]);
  const notice = ref(null);
  const loading = ref(false);
  const activeAction = ref(null);
  const hasCourses = computed(() => courses.value.length > 0);

  function setNotice(message, type) {
    notice.value = { message, type };
  }

  async function loadCourses() {
    loading.value = true;
    notice.value = null;
    try {
      courses.value = await request('/api/courses');
      return true;
    } catch (error) {
      setNotice(error.message, 'error');
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function addCourse(fields) {
    const course = {
      courseId: fields.courseId.trim(),
      name: fields.name.trim()
    };

    if (!course.courseId || !course.name) {
      setNotice('Enter both a course ID and course name.', 'error');
      return;
    }

    activeAction.value = 'add';
    notice.value = null;
    try {
      const result = await request('/add-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course)
      });
      courses.value = [...courses.value, result.course].sort((a, b) =>
        a.courseId.localeCompare(b.courseId)
      );
      setNotice(result.message || 'Course added successfully.', 'success');
    } catch (error) {
      setNotice(error.message, 'error');
    } finally {
      activeAction.value = null;
    }
  }

  async function deleteCourse(courseId) {
    activeAction.value = `delete:${courseId}`;
    notice.value = null;
    try {
      const result = await request('/delete-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });
      courses.value = courses.value.filter((course) => course.courseId !== courseId);
      setNotice(result.message || 'Course deleted successfully.', 'success');
    } catch (error) {
      setNotice(error.message, 'error');
    } finally {
      activeAction.value = null;
    }
  }

  return {
    courses,
    notice,
    loading,
    activeAction,
    hasCourses,
    loadCourses,
    addCourse,
    deleteCourse
  };
});

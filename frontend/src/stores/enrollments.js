import { ref } from 'vue';
import { defineStore } from 'pinia';

async function request(path, options) {
  const response = await fetch(path, options);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'The request could not be completed.');
  }
  return result;
}

export const useEnrollmentsStore = defineStore('enrollments', () => {
  const students = ref([]);
  const courses = ref([]);
  const roster = ref([]);
  const selectedStudentId = ref('');
  const selectedCourseId = ref('');
  const rosterCourseId = ref('');
  const notice = ref(null);
  const loading = ref(false);

  function setNotice(message, type) {
    notice.value = { message, type };
  }

  async function loadSelections() {
    loading.value = true;
    try {
      const [studentData, courseData] = await Promise.all([
        request('/api/students'),
        request('/api/courses')
      ]);
      students.value = studentData.sort((a, b) => a.name.localeCompare(b.name));
      courses.value = courseData.sort((a, b) => a.courseId.localeCompare(b.courseId));
    } catch (error) {
      setNotice(error.message, 'error');
    } finally {
      loading.value = false;
    }
  }

  async function enrollStudent() {
    if (!selectedStudentId.value || !selectedCourseId.value) {
      setNotice('Select both a student and a course.', 'error');
      return;
    }

    loading.value = true;
    notice.value = null;
    try {
      const result = await request('/add-enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentId.value,
          courseId: selectedCourseId.value
        })
      });
      setNotice(result.message || 'Enrollment added successfully.', 'success');
    } catch (error) {
      setNotice(error.message, 'error');
    } finally {
      loading.value = false;
    }
  }

  async function loadRoster(courseId) {
    rosterCourseId.value = courseId;
    roster.value = [];
    if (!courseId) {
      setNotice('Select a course to view its roster.', 'error');
      return;
    }

    loading.value = true;
    notice.value = null;
    try {
      roster.value = await request(`/api/enrollments/${encodeURIComponent(courseId)}`);
    } catch (error) {
      setNotice(error.message, 'error');
    } finally {
      loading.value = false;
    }
  }

  return {
    students,
    courses,
    roster,
    selectedStudentId,
    selectedCourseId,
    rosterCourseId,
    notice,
    loading,
    loadSelections,
    enrollStudent,
    loadRoster
  };
});

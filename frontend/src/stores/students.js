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

export const useStudentsStore = defineStore('students', () => {
  const students = ref([]);
  const student = ref(null);
  const notice = ref(null);
  const activeAction = ref(null);
  const loadingStudents = ref(false);
  const hasStudent = computed(() => student.value !== null);

  function setNotice(message, type) {
    notice.value = { message, type };
  }

  async function loadStudents() {
    loadingStudents.value = true;
    try {
      students.value = await request('/api/students');
      return true;
    } catch (error) {
      setNotice(error.message, 'error');
      return false;
    } finally {
      loadingStudents.value = false;
    }
  }

  async function searchStudent(name) {
    const searchName = name.trim();
    if (!searchName) {
      student.value = null;
      setNotice('Enter a student name to search.', 'error');
      return;
    }

    activeAction.value = 'search';
    notice.value = null;
    try {
      student.value = await request('/find-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: searchName })
      });
      setNotice('Student found.', 'success');
    } catch (error) {
      student.value = null;
      setNotice(error.message, 'error');
    } finally {
      activeAction.value = null;
    }
  }

  async function addStudent(fields) {
    const values = {
      name: fields.name.trim(),
      id: fields.id.trim(),
      phone: fields.phone.trim(),
      zip: fields.zip.trim()
    };

    if (Object.values(values).some((value) => !value)) {
      setNotice('Complete all student fields before saving.', 'error');
      return;
    }

    activeAction.value = 'add';
    notice.value = null;
    try {
      const result = await request('/add-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      student.value = result.student;
      students.value = [
        ...students.value.filter((existing) => existing.id !== result.student.id),
        result.student
      ].sort((a, b) => a.name.localeCompare(b.name));
      setNotice(result.message || 'Student added successfully.', 'success');
    } catch (error) {
      setNotice(error.message, 'error');
    } finally {
      activeAction.value = null;
    }
  }

  async function deleteStudent() {
    if (!student.value) {
      setNotice('Search for a student before deleting.', 'error');
      return;
    }

    activeAction.value = 'delete';
    notice.value = null;
    try {
      const result = await request('/delete-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: student.value.id })
      });
      student.value = null;
      students.value = students.value.filter((existing) => existing.id !== result.student.id);
      setNotice(result.message || 'Student deleted successfully.', 'success');
    } catch (error) {
      setNotice(error.message, 'error');
    } finally {
      activeAction.value = null;
    }
  }

  return {
    students,
    student,
    notice,
    activeAction,
    loadingStudents,
    hasStudent,
    loadStudents,
    searchStudent,
    addStudent,
    deleteStudent
  };
});

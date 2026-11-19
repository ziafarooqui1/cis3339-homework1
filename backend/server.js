const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'students.json');
const COURSES_FILE = path.join(__dirname, 'courses.json');
const ENROLLMENTS_FILE = path.join(__dirname, 'enrollments.json');
let studentMutationQueue = Promise.resolve();
let courseMutationQueue = Promise.resolve();
let enrollmentMutationQueue = Promise.resolve();

function queueMutation(queueGetter, queueSetter, mutation) {
    const result = queueGetter().then(mutation);
    queueSetter(result.catch(() => {}));
    return result;
}

function queueStudentMutation(mutation) {
    return queueMutation(
        () => studentMutationQueue,
        (queue) => { studentMutationQueue = queue; },
        mutation
    );
}

function queueCourseMutation(mutation) {
    return queueMutation(
        () => courseMutationQueue,
        (queue) => { courseMutationQueue = queue; },
        mutation
    );
}

function queueEnrollmentMutation(mutation) {
    return queueMutation(
        () => enrollmentMutationQueue,
        (queue) => { enrollmentMutationQueue = queue; },
        mutation
    );
}

async function loadJsonArray(filePath, label) {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const records = JSON.parse(data);
        if (!Array.isArray(records)) {
            throw new Error(`${label} data must be a JSON array`);
        }
        return records;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

async function saveJsonArray(filePath, records) {
    await fs.promises.writeFile(filePath, JSON.stringify(records, null, 2), 'utf8');
}

const loadStudents = () => loadJsonArray(DATA_FILE, 'Student');
const saveStudents = (students) => saveJsonArray(DATA_FILE, students);
const loadCourses = () => loadJsonArray(COURSES_FILE, 'Course');
const saveCourses = (courses) => saveJsonArray(COURSES_FILE, courses);
const loadEnrollments = () => loadJsonArray(ENROLLMENTS_FILE, 'Enrollment');
const saveEnrollments = (enrollments) => saveJsonArray(ENROLLMENTS_FILE, enrollments);

app.get('/students', async (req, res) => {
    try {
        res.send(await loadStudents());
    } catch (error) {
        console.error('Error listing students:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

app.post('/find-student', async (req, res) => {
    try {
        const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
        if (!name) {
            return res.status(400).send({ error: 'Student name is required' });
        }

        const students = await loadStudents();
        const student = students.find((item) => item.name === name);
        if (!student) {
            return res.status(404).send({ error: 'Student not found' });
        }

        res.send(student);
    } catch (error) {
        console.error('Error finding student:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

app.post('/add-student', async (req, res) => {
    try {
        const { name, id, phone, zip } = req.body || {};
        const fields = [name, id, phone, zip];
        if (fields.some((value) =>
            (typeof value !== 'string' && typeof value !== 'number') ||
            String(value).trim() === ''
        )) {
            return res.status(400).send({ error: 'All fields (name, id, phone, zip) are required' });
        }

        const newStudent = {
            name: String(name).trim(),
            id: String(id).trim(),
            phone: String(phone).trim(),
            zip: String(zip).trim()
        };
        const result = await queueStudentMutation(async () => {
            const students = await loadStudents();
            if (students.some((student) => String(student.id).trim() === newStudent.id)) {
                return { status: 409, body: { error: 'A student with this ID already exists' } };
            }

            students.push(newStudent);
            await saveStudents(students);
            return {
                status: 201,
                body: { message: 'Student added successfully', student: newStudent }
            };
        });
        res.status(result.status).send(result.body);
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

app.post('/delete-student', async (req, res) => {
    try {
        const { id, name } = req.body || {};
        const studentId = id === undefined || id === null ? '' : String(id).trim();
        const studentName = typeof name === 'string' ? name.trim() : '';
        if (!studentId && !studentName) {
            return res.status(400).send({ error: 'Student ID or name is required' });
        }

        const result = await queueStudentMutation(async () => {
            const students = await loadStudents();
            const index = studentId
                ? students.findIndex((item) => String(item.id).trim() === studentId)
                : students.findIndex((item) => item.name === studentName);
            if (index === -1) {
                return { status: 404, body: { error: 'Student not found' } };
            }

            const deletedStudent = students.splice(index, 1)[0];
            await saveStudents(students);
            const enrollments = await loadEnrollments();
            await saveEnrollments(enrollments.filter((enrollment) =>
                String(enrollment.studentId).trim() !== String(deletedStudent.id).trim()
            ));
            return {
                status: 200,
                body: { message: 'Student deleted successfully', student: deletedStudent }
            };
        });
        res.status(result.status).send(result.body);
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

app.get(['/courses', '/api/courses'], async (req, res) => {
    try {
        res.send(await loadCourses());
    } catch (error) {
        console.error('Error listing courses:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

app.post('/add-course', async (req, res) => {
    try {
        const courseId = typeof req.body?.courseId === 'string'
            ? req.body.courseId.trim()
            : req.body?.courseId === undefined
                ? ''
                : String(req.body.courseId).trim();
        const courseName = typeof req.body?.name === 'string'
            ? req.body.name.trim()
            : '';

        if (!courseId || !courseName) {
            return res.status(400).send({ error: 'Course ID and course name are required' });
        }

        const result = await queueCourseMutation(async () => {
            const courses = await loadCourses();
            if (courses.some((course) => String(course.courseId).trim() === courseId)) {
                return { status: 409, body: { error: 'A course with this ID already exists' } };
            }

            const course = { courseId, name: courseName };
            courses.push(course);
            await saveCourses(courses);
            return {
                status: 201,
                body: { message: 'Course added successfully', course }
            };
        });
        res.status(result.status).send(result.body);
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

app.post('/delete-course', async (req, res) => {
    try {
        const courseId = typeof req.body?.courseId === 'string'
            ? req.body.courseId.trim()
            : req.body?.courseId === undefined
                ? ''
                : String(req.body.courseId).trim();

        if (!courseId) {
            return res.status(400).send({ error: 'Course ID is required' });
        }

        const result = await queueCourseMutation(async () => {
            const courses = await loadCourses();
            const index = courses.findIndex((course) => String(course.courseId).trim() === courseId);
            if (index === -1) {
                return { status: 404, body: { error: 'Course not found' } };
            }

            const deletedCourse = courses.splice(index, 1)[0];
            await saveCourses(courses);
            const enrollments = await loadEnrollments();
            await saveEnrollments(enrollments.filter((enrollment) =>
                String(enrollment.courseId).trim() !== String(deletedCourse.courseId).trim()
            ));
            return {
                status: 200,
                body: { message: 'Course deleted successfully', course: deletedCourse }
            };
        });
        res.status(result.status).send(result.body);
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

app.post('/add-enrollment', async (req, res) => {
    try {
        const studentId = String(req.body?.studentId ?? '').trim();
        const courseId = String(req.body?.courseId ?? '').trim();

        if (!studentId || !courseId) {
            return res.status(400).send({ error: 'Student and course are required' });
        }

        const result = await queueEnrollmentMutation(async () => {
            const [students, courses, enrollments] = await Promise.all([
                loadStudents(),
                loadCourses(),
                loadEnrollments()
            ]);
            if (!students.some((student) => String(student.id).trim() === studentId)) {
                return { status: 404, body: { error: 'Student not found' } };
            }
            if (!courses.some((course) => String(course.courseId).trim() === courseId)) {
                return { status: 404, body: { error: 'Course not found' } };
            }
            if (enrollments.some((enrollment) =>
                String(enrollment.studentId).trim() === studentId &&
                String(enrollment.courseId).trim() === courseId
            )) {
                return { status: 409, body: { error: 'This student is already enrolled in the course' } };
            }

            const enrollment = { studentId, courseId };
            enrollments.push(enrollment);
            await saveEnrollments(enrollments);
            return {
                status: 201,
                body: { message: 'Enrollment added successfully', enrollment }
            };
        });
        res.status(result.status).send(result.body);
    } catch (error) {
        console.error('Error adding enrollment:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

app.get(['/enrollments/:courseId', '/api/enrollments/:courseId'], async (req, res) => {
    try {
        const courseId = String(req.params.courseId).trim();
        const courses = await loadCourses();
        if (!courses.some((course) => String(course.courseId).trim() === courseId)) {
            return res.status(404).send({ error: 'Course not found' });
        }

        const [students, enrollments] = await Promise.all([
            loadStudents(),
            loadEnrollments()
        ]);
        const enrolledStudentIds = new Set(
            enrollments
                .filter((enrollment) => String(enrollment.courseId).trim() === courseId)
                .map((enrollment) => String(enrollment.studentId).trim())
        );
        const roster = students
            .filter((student) => enrolledStudentIds.has(String(student.id).trim()))
            .sort((a, b) => a.name.localeCompare(b.name));
        res.send(roster);
    } catch (error) {
        console.error('Error listing course enrollments:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

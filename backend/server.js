const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Student = require('./models/Student');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is required in the repository .env file');
}

function publicStudent(student) {
  return {
    id: student.id,
    name: student.name,
    phone: student.phone,
    zip: student.zip
  };
}

function publicCourse(course) {
  return { courseId: course.courseId, name: course.name };
}

function handleError(error, res, operation) {
  if (error?.code === 11000) {
    const field = error.keyPattern?.id ? 'student ID'
      : error.keyPattern?.courseId ? 'course ID'
        : error.keyPattern?.student || error.keyPattern?.course ? 'student-course pair'
          : 'record';
    return res.status(409).send({ error: `A duplicate ${field} already exists` });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).send({
      error: Object.values(error.errors).map((item) => item.message).join(', ')
    });
  }
  console.error(`Error ${operation}:`, error);
  return res.status(500).send({ error: 'Internal server error' });
}

app.get('/health', (req, res) => {
  res.send({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.send(students.map(publicStudent));
  } catch (error) {
    handleError(error, res, 'listing students');
  }
});

app.post('/find-student', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!name) return res.status(400).send({ error: 'Student name is required' });

  try {
    const student = await Student.findOne({ name });
    if (!student) return res.status(404).send({ error: 'Student not found' });
    res.send(publicStudent(student));
  } catch (error) {
    handleError(error, res, 'finding student');
  }
});

app.post('/add-student', async (req, res) => {
  const { name, id, phone, zip } = req.body || {};
  const fields = [name, id, phone, zip];
  if (fields.some((value) => value === undefined || value === null || String(value).trim() === '')) {
    return res.status(400).send({ error: 'All fields (name, id, phone, zip) are required' });
  }

  try {
    const student = await Student.create({
      name: String(name).trim(),
      id: String(id).trim(),
      phone: String(phone).trim(),
      zip: String(zip).trim()
    });
    res.status(201).send({
      message: 'Student added successfully',
      student: publicStudent(student)
    });
  } catch (error) {
    handleError(error, res, 'adding student');
  }
});

app.post('/delete-student', async (req, res) => {
  const studentId = req.body?.id === undefined || req.body?.id === null
    ? ''
    : String(req.body.id).trim();
  const studentName = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!studentId && !studentName) {
    return res.status(400).send({ error: 'Student ID or name is required' });
  }

  try {
    const student = studentId
      ? await Student.findOne({ id: studentId })
      : await Student.findOne({ name: studentName });
    if (!student) return res.status(404).send({ error: 'Student not found' });

    await Enrollment.deleteMany({ student: student._id });
    await student.deleteOne();
    res.send({
      message: 'Student deleted successfully',
      student: publicStudent(student)
    });
  } catch (error) {
    handleError(error, res, 'deleting student');
  }
});

app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ courseId: 1 });
    res.send(courses.map(publicCourse));
  } catch (error) {
    handleError(error, res, 'listing courses');
  }
});

app.post('/add-course', async (req, res) => {
  const courseId = req.body?.courseId === undefined || req.body?.courseId === null
    ? ''
    : String(req.body.courseId).trim();
  const courseName = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!courseId || !courseName) {
    return res.status(400).send({ error: 'Course ID and course name are required' });
  }

  try {
    const course = await Course.create({ courseId, name: courseName });
    res.status(201).send({
      message: 'Course added successfully',
      course: publicCourse(course)
    });
  } catch (error) {
    handleError(error, res, 'adding course');
  }
});

app.post('/delete-course', async (req, res) => {
  const courseId = req.body?.courseId === undefined || req.body?.courseId === null
    ? ''
    : String(req.body.courseId).trim();
  if (!courseId) return res.status(400).send({ error: 'Course ID is required' });

  try {
    const course = await Course.findOne({ courseId });
    if (!course) return res.status(404).send({ error: 'Course not found' });

    await Enrollment.deleteMany({ course: course._id });
    await course.deleteOne();
    res.send({
      message: 'Course deleted successfully',
      course: publicCourse(course)
    });
  } catch (error) {
    handleError(error, res, 'deleting course');
  }
});

app.post('/add-enrollment', async (req, res) => {
  const studentId = String(req.body?.studentId ?? '').trim();
  const courseId = String(req.body?.courseId ?? '').trim();
  if (!studentId || !courseId) {
    return res.status(400).send({ error: 'Student and course are required' });
  }

  try {
    const [student, course] = await Promise.all([
      Student.findOne({ id: studentId }),
      Course.findOne({ courseId })
    ]);
    if (!student) return res.status(404).send({ error: 'Student not found' });
    if (!course) return res.status(404).send({ error: 'Course not found' });

    const enrollment = await Enrollment.create({ student: student._id, course: course._id });
    res.status(201).send({
      message: 'Enrollment added successfully',
      enrollment: { studentId, courseId }
    });
  } catch (error) {
    handleError(error, res, 'adding enrollment');
  }
});

app.get('/api/enrollments/:courseId', async (req, res) => {
  const courseId = String(req.params.courseId).trim();
  try {
    const course = await Course.findOne({ courseId });
    if (!course) return res.status(404).send({ error: 'Course not found' });

    const enrollments = await Enrollment.find({ course: course._id }).populate('student');
    const roster = enrollments
      .map((enrollment) => enrollment.student)
      .filter(Boolean)
      .map(publicStudent)
      .sort((a, b) => a.name.localeCompare(b.name));
    res.send(roster);
  } catch (error) {
    handleError(error, res, 'listing course enrollments');
  }
});

const frontendDist = path.resolve(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).send({ error: 'API route not found' });
  }
  if (req.method !== 'GET') {
    return res.status(404).send({ error: 'Route not found' });
  }
  res.sendFile(path.join(frontendDist, 'index.html'));
});

async function start() {
  await mongoose.connect(MONGODB_URI);
  await Promise.all([
    Student.syncIndexes(),
    Course.syncIndexes(),
    Enrollment.syncIndexes()
  ]);
  await Promise.all([
    Enrollment.deleteMany({
      student: { $nin: await Student.distinct('_id') }
    }),
    Enrollment.deleteMany({
      course: { $nin: await Course.distinct('_id') }
    })
  ]);
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    console.log(`MongoDB connected; server is running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start the application:', error.message);
  process.exit(1);
});

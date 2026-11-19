const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'students.json');
let studentMutationQueue = Promise.resolve();

function queueStudentMutation(mutation) {
    const result = studentMutationQueue.then(mutation);
    studentMutationQueue = result.catch(() => {});
    return result;
}

async function loadStudents() {
    try {
        const data = await fs.promises.readFile(DATA_FILE, 'utf8');
        const students = JSON.parse(data);
        if (!Array.isArray(students)) {
            throw new Error('Student data must be a JSON array');
        }
        return students;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

async function saveStudents(students) {
    try {
        await fs.promises.writeFile(DATA_FILE, JSON.stringify(students, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing students file:', error);
        throw error;
    }
}

// Endpoint to search for a student by name
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

// Endpoint to save a student
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
            const duplicateStudent = students.find((student) => String(student.id).trim() === newStudent.id);
            if (duplicateStudent) {
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

// Delete by ID for an unambiguous match; name remains supported for existing clients.
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

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

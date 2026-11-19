const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }
}, { timestamps: true });

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

enrollmentSchema.pre('save', async function () {
  const [Student, Course] = [
    mongoose.model('Student'),
    mongoose.model('Course')
  ];
  const [studentExists, courseExists] = await Promise.all([
    Student.exists({ _id: this.student }),
    Course.exists({ _id: this.course })
  ]);
  if (!studentExists) throw new mongoose.Error.ValidationError(this);
  if (!courseExists) throw new mongoose.Error.ValidationError(this);
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);

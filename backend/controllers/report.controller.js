import { readStore } from "../lib/store.js";

export const getAdminReports = async (req, res) => {
  try {
    const store = await readStore();

    const feeDefaulters = store.students
      .map((student) => {
        const pendingFees = store.fees.filter(
          (fee) => fee.student_id === student.id && fee.status !== "paid"
        );

        return {
          id: student.id,
          name: student.name,
          pendingAmount: pendingFees.reduce((sum, item) => sum + Number(item.amount || 0), 0),
          count: pendingFees.length,
        };
      })
      .filter((item) => item.pendingAmount > 0)
      .sort((a, b) => b.pendingAmount - a.pendingAmount);

    const institutePerformance = store.institutes.map((institute) => {
      const instituteStudents = store.students.filter(
        (student) => student.institute_id === institute.id
      );

      return {
        institute: institute.name,
        students: instituteStudents.length,
        avgMarks: instituteStudents.length
          ? Math.round(
              instituteStudents.reduce((sum, student) => sum + Number(student.marks || 0), 0) /
                instituteStudents.length
            )
          : 0,
        avgAttendance: instituteStudents.length
          ? Math.round(
              instituteStudents.reduce(
                (sum, student) => sum + Number(student.attendance || 0),
                0
              ) / instituteStudents.length
            )
          : 0,
      };
    });

    res.json({
      feeDefaulters,
      institutePerformance,
      auditLogs: (store.auditLogs || []).slice(0, 20),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

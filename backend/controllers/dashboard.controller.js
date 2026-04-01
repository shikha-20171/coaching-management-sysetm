import { readStore } from "../lib/store.js";

function createInsight(student, fees) {
  const pending = fees.filter((fee) => fee.status !== "paid");
  const pendingAmount = pending.reduce((sum, fee) => sum + Number(fee.amount || 0), 0);

  let risk = "low";
  if (student.attendance < 75 || student.marks < 55 || pendingAmount > 12000) {
    risk = "high";
  } else if (student.attendance < 85 || student.marks < 70 || pendingAmount > 0) {
    risk = "medium";
  }

  const summary =
    risk === "high"
      ? "Urgent support recommended. Attendance, performance, or fee follow-up needs action."
      : risk === "medium"
        ? "Student is stable but needs guidance on consistency and payment planning."
        : "Student is progressing well with healthy attendance and academic momentum.";

  const actions = [
    student.attendance < 80
      ? "Schedule attendance counselling and send a class continuity reminder."
      : "Maintain current attendance with weekly learning streak checks.",
    student.marks < 70
      ? "Assign revision sessions for weak topics and a focused practice plan."
      : "Move the student to advanced problem-solving sets and mock tests.",
    pendingAmount > 0
      ? `Fee reminder should be sent for pending amount of Rs ${pendingAmount}.`
      : "No fee follow-up needed right now.",
  ];

  return { risk, summary, actions };
}

export const getAdminDashboard = async (req, res) => {
  try {
    const store = await readStore();
    const totalInstitutes = store.institutes.length;
    const totalStudents = store.students.length;
    const activeBatches = store.batches.length;
    const totalCourses = store.courses.length;
    const totalTests = store.tests.length;
    const notificationsCount = store.notifications.length;
    const paidFees = store.fees.filter((fee) => fee.status === "paid");
    const pendingFees = store.fees.filter((fee) => fee.status !== "paid");
    const revenue = paidFees.reduce((sum, fee) => sum + Number(fee.amount || 0), 0);
    const pendingRevenue = pendingFees.reduce((sum, fee) => sum + Number(fee.amount || 0), 0);

    const attentionStudents = store.students
      .map((student) => {
        const studentFees = store.fees.filter((fee) => fee.student_id === student.id);
        const insight = createInsight(student, studentFees);
        return {
          id: student.id,
          name: student.name,
          attendance: student.attendance,
          marks: student.marks,
          risk: insight.risk,
          course:
            store.courses.find((course) => course.id === student.course_id)?.title ||
            "Not assigned",
          institute:
            store.institutes.find((item) => item.id === student.institute_id)?.name ||
            "Main Campus",
          pendingAmount: studentFees
            .filter((fee) => fee.status !== "paid")
            .reduce((sum, fee) => sum + Number(fee.amount || 0), 0),
        };
      })
      .sort((a, b) => {
        const riskOrder = { high: 0, medium: 1, low: 2 };
        return riskOrder[a.risk] - riskOrder[b.risk];
      })
      .slice(0, 5);

    const topStudents = [...store.students]
      .sort((a, b) => Number(b.marks || 0) - Number(a.marks || 0))
      .slice(0, 4)
      .map((student) => ({
        id: student.id,
        name: student.name,
        marks: student.marks,
        progress: student.progress,
        attendance: student.attendance,
      }));

    const revenueSeries = [
      { month: "Jan", revenue: 98000, enrollments: 14 },
      { month: "Feb", revenue: 121000, enrollments: 18 },
      { month: "Mar", revenue: 135000, enrollments: 22 },
      { month: "Apr", revenue: 148000, enrollments: 25 },
      { month: "May", revenue: 164000, enrollments: 29 },
      { month: "Jun", revenue: revenue || 172000, enrollments: totalStudents },
    ];

    const attendanceOverview = [
      {
        label: "Present",
        value: store.attendance.filter((item) => item.status === "Present").length,
      },
      {
        label: "Absent",
        value: store.attendance.filter((item) => item.status === "Absent").length,
      },
      {
        label: "Late",
        value: store.attendance.filter((item) => item.status === "Late").length,
      },
    ];

    const operations = [
      {
        title: "Admission pipeline",
        value: `${Math.max(4, Math.ceil(totalStudents / 3))} applications`,
        note: "Fresh applications awaiting counselling call and document check.",
      },
      {
        title: "Fee collection ratio",
        value: `${Math.round((paidFees.length / Math.max(store.fees.length, 1)) * 100)}%`,
        note: "Collection health across the currently active installments.",
      },
      {
        title: "Batch utilisation",
        value: `${Math.round((totalStudents / Math.max(activeBatches * 30, 1)) * 100)}%`,
        note: "Seats occupied across available learning groups and timings.",
      },
      {
        title: "Tests & assessments",
        value: `${totalTests} live`,
        note: "Scheduled tests and assignment checkpoints across programs.",
      },
    ];

    const upcomingPayments = pendingFees.slice(0, 6).map((fee) => ({
      id: fee.id,
      studentName:
        store.students.find((student) => student.id === fee.student_id)?.name || "Student",
      amount: fee.amount,
      dueDate: fee.due_date,
      status: fee.status,
    }));

    res.json({
      stats: {
        totalInstitutes,
        totalStudents,
        activeBatches,
        totalCourses,
        totalTests,
        notificationsCount,
        revenue,
        pendingRevenue,
        pendingFees: pendingFees.length,
      },
      attentionStudents,
      topStudents,
      revenueSeries,
      attendanceOverview,
      operations,
      upcomingPayments,
      institutes: store.institutes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStudentDashboard = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const store = await readStore();
    const user = store.users.find((item) => item.id === userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role === "staff") {
      const assignedCourses = store.courses.filter((course) => course.mentor === user.name);
      const courseIds = assignedCourses.map((course) => course.id);
      const assignedBatches = store.batches.filter((batch) => courseIds.includes(batch.course_id));
      const notifications = store.notifications.filter(
        (item) => item.audience === "all" || item.audience === "staff"
      );

      return res.json({
        role: "staff",
        profile: {
          name: user.name,
          email: user.email,
          assignedCourses: assignedCourses.length,
          assignedBatches: assignedBatches.length,
        },
        tasks: [
          { id: 1, title: "Review batch attendance anomalies", status: "Priority" },
          { id: 2, title: "Publish next doubt-solving schedule", status: "Planned" },
          { id: 3, title: "Check upcoming mock test readiness", status: "Live" },
        ],
        notifications: notifications.slice(0, 5),
        schedule: assignedBatches.map((batch) => ({
          id: batch.id,
          title: batch.name,
          time: batch.schedule,
          type: batch.status,
        })),
        tests: store.tests.filter((test) => courseIds.includes(test.course_id)).slice(0, 4),
      });
    }

    const student = store.students.find((item) => Number(item.user_id) === userId);

    if (!student) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    const batch = store.batches.find((item) => item.id === student.batch_id);
    const course =
      store.courses.find((item) => item.id === student.course_id) ||
      store.courses.find((item) => item.id === batch?.course_id);
    const fees = store.fees.filter((fee) => fee.student_id === student.id);
    const pendingAmount = fees
      .filter((fee) => fee.status !== "paid")
      .reduce((sum, fee) => sum + Number(fee.amount || 0), 0);
    const insight = createInsight(student, fees);
    const notifications = store.notifications.filter(
      (item) => item.audience === "all" || item.audience === "student"
    );
    const attendanceHistory = store.attendance
      .filter((item) => item.student_id === student.id)
      .slice(-5)
      .reverse();
    const tests = store.tests.filter((test) => test.course_id === course?.id).slice(0, 4);

    const schedule = [
      {
        id: 1,
        title: `${course?.title || "Core"} live class`,
        time: batch?.schedule || "Mon-Wed-Fri, 5:00 PM",
        type: "Class",
      },
      {
        id: 2,
        title: "Doubt clearing session",
        time: "Saturday, 11:00 AM",
        type: "Mentoring",
      },
      {
        id: 3,
        title: "AI progress review",
        time: "Sunday, 7:30 PM",
        type: "Analysis",
      },
    ];

    const tasks = [
      {
        id: 1,
        title:
          student.marks < 70 ? "Revise weak topics for next mock" : "Attempt advanced worksheet",
        status: student.marks < 70 ? "Priority" : "Stretch",
      },
      {
        id: 2,
        title: pendingAmount > 0 ? "Clear pending installment" : "Check next fee cycle",
        status: pendingAmount > 0 ? "Due" : "Planned",
      },
      {
        id: 3,
        title:
          student.attendance < 85
            ? "Improve attendance consistency this week"
            : "Maintain your strong attendance streak",
        status: "Habit",
      },
    ];

    res.json({
      role: "student",
      student: {
        ...student,
        batch_name: batch?.name || "Not assigned",
        course_name: course?.title || "Not assigned",
        mentor: course?.mentor || "Academic Team",
        pendingAmount,
      },
      fees,
      insight,
      schedule,
      tasks,
      notifications: notifications.slice(0, 5),
      attendanceHistory,
      tests,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

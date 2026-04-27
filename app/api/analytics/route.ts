import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalStudies,
      pendingReports,
      todayAppointments,
      studies,
      modalityGroups,
      appointmentStatusGroups,
    ] = await Promise.all([
      db.study.count(),
      db.report.count({
        where: { status: { in: ["DRAFT", "PRELIMINARY"] } },
      }),
      db.appointment.count({
        where: {
          startTime: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        },
      }),
      db.study.findMany({
        where: {
          studyDate: { gte: thirtyDaysAgo },
        },
        select: { studyDate: true },
        orderBy: { studyDate: "asc" },
      }),
      db.study.groupBy({
        by: ["modality"],
        _count: { id: true },
        where: { modality: { not: null } },
      }),
      db.appointment.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    // Studies per day aggregation
    const studiesPerDayMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split("T")[0];
      studiesPerDayMap.set(key, 0);
    }
    for (const study of studies) {
      if (study.studyDate) {
        const key = study.studyDate.toISOString().split("T")[0];
        if (studiesPerDayMap.has(key)) {
          studiesPerDayMap.set(key, (studiesPerDayMap.get(key) || 0) + 1);
        }
      }
    }
    const studiesPerDay = Array.from(studiesPerDayMap.entries()).map(
      ([date, count]) => ({ date, count })
    );

    // Modality breakdown
    const modalityBreakdown = modalityGroups.map((g) => ({
      modality: g.modality || "Unknown",
      count: g._count.id,
    }));

    // Generate mock turnaround data (since we don't have real report completion times yet)
    const turnaroundPerDay = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split("T")[0],
        avgMinutes: Math.floor(Math.random() * 120) + 30,
      };
    });

    // Appointments by status
    const appointmentsByStatus = appointmentStatusGroups.map((g) => ({
      status: g.status,
      count: g._count.id,
    }));

    // Average turnaround (mock for now)
    const avgTurnaroundMinutes = 72;

    return NextResponse.json({
      totalStudies,
      avgTurnaroundMinutes,
      pendingReports,
      todayAppointments,
      studiesPerDay,
      modalityBreakdown,
      turnaroundPerDay,
      appointmentsByStatus,
    });
  } catch (error) {
    console.error("[ANALYTICS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

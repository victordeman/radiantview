import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const report = await db.report.findUnique({
      where: { id },
      include: {
        study: {
          include: { patient: true },
        },
        author: {
          select: { id: true, name: true, email: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("[REPORT_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { findings, impression, recommendation, status, templateName } = body;

    // Validate status before entering transaction
    if (status !== undefined) {
      const allowedStatuses = ["DRAFT", "PRELIMINARY", "FINAL", "AMENDED"];
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }
    }

    // Use interactive transaction to atomically check status + update
    const report = await db.$transaction(async (tx) => {
      const existingReport = await tx.report.findUnique({
        where: { id },
        select: { status: true },
      });
      if (!existingReport) {
        throw new Error("NOT_FOUND");
      }
      if (existingReport.status === "FINAL") {
        throw new Error("FINALIZED");
      }

      const updateData: Record<string, unknown> = {};
      if (findings !== undefined) updateData.findings = findings;
      if (impression !== undefined) updateData.impression = impression;
      if (recommendation !== undefined) updateData.recommendation = recommendation;
      if (templateName !== undefined) updateData.templateName = templateName;
      if (status !== undefined) {
        updateData.status = status;
        if (status === "FINAL") {
          updateData.signedAt = new Date();
        }
      }

      return tx.report.update({
        where: { id },
        data: updateData,
        include: {
          study: {
            include: { patient: true },
          },
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    });

    return NextResponse.json(report);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
      }
      if (error.message === "FINALIZED") {
        return NextResponse.json({ error: "Cannot modify a finalized report" }, { status: 400 });
      }
    }
    console.error("[REPORT_PUT]", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Use interactive transaction to atomically check status + delete
    await db.$transaction(async (tx) => {
      const existingReport = await tx.report.findUnique({
        where: { id },
        select: { status: true },
      });
      if (!existingReport) {
        throw new Error("NOT_FOUND");
      }
      if (existingReport.status === "FINAL") {
        throw new Error("FINALIZED");
      }
      await tx.report.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
      }
      if (error.message === "FINALIZED") {
        return NextResponse.json({ error: "Cannot delete a finalized report" }, { status: 400 });
      }
    }
    console.error("[REPORT_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}

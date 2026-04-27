import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { study: { patient: { name: { contains: search, mode: "insensitive" } } } },
        { study: { studyDescription: { contains: search, mode: "insensitive" } } },
      ];
    }

    const reports = await db.report.findMany({
      where,
      include: {
        study: {
          include: {
            patient: true,
          },
        },
        author: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("[REPORTS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { studyId, studyInstanceUid, templateName, findings, impression, recommendation } = body;

    if (!studyId && !studyInstanceUid) {
      return NextResponse.json(
        { error: "Study ID or Study Instance UID is required" },
        { status: 400 }
      );
    }

    // Resolve the database study ID — handles both DB IDs and Orthanc IDs
    let resolvedStudyId = studyId;
    if (studyInstanceUid) {
      const study = await db.study.findUnique({
        where: { studyInstanceUid },
      });
      if (study) {
        resolvedStudyId = study.id;
      } else {
        return NextResponse.json(
          { error: "Study not found in database. Please ensure the study is synced." },
          { status: 404 }
        );
      }
    }

    const report = await db.report.create({
      data: {
        studyId: resolvedStudyId,
        authorId: session.user.id,
        templateName,
        findings: findings || "",
        impression: impression || "",
        recommendation: recommendation || "",
      },
      include: {
        study: {
          include: { patient: true },
        },
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("[REPORTS_POST]", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}

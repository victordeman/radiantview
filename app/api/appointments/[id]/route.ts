import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointment = await db.appointment.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!appointment) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("[APPOINTMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { startTime, endTime, status, patientId } = body;

    const appointment = await db.appointment.update({
      where: { id },
      data: {
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        status,
        patientId,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("[APPOINTMENT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointment = await db.appointment.delete({
      where: { id },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("[APPOINTMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search");
  const host = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    // Try fetching from Orthanc first
    const response = await fetch(`${host}/api/orthanc/studies`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Orthanc returned ${response.status}`);
    }

    const studies = await response.json();

    interface OrthancStudy {
      ID: string;
      PatientMainDicomTags?: {
        PatientName?: string;
        PatientID?: string;
      };
      MainDicomTags?: {
        AccessionNumber?: string;
        ModalitiesInStudy?: string;
        StudyDate?: string;
        StudyDescription?: string;
        StudyInstanceUID?: string;
      };
      Instances?: string[];
      LastUpdate?: string;
    }

    // Transform to OmegaAI worklist card shape
    const transformedStudies = studies.map((study: OrthancStudy) => ({
      id: study.ID,
      patientName: study.PatientMainDicomTags?.PatientName || "Unknown",
      patientId: study.PatientMainDicomTags?.PatientID || "Unknown",
      accessionNumber: study.MainDicomTags?.AccessionNumber || "N/A",
      modality: study.MainDicomTags?.ModalitiesInStudy || "N/A",
      studyDate: study.MainDicomTags?.StudyDate || "",
      studyDescription: study.MainDicomTags?.StudyDescription || "",
      studyInstanceUid: study.MainDicomTags?.StudyInstanceUID || study.ID,
      status: "Available",
      instanceCount: study.Instances?.length || 0,
      lastUpdate: study.LastUpdate,
    }));

    // Apply client-side search filter if search param provided
    if (search) {
      const lowerSearch = search.toLowerCase();
      const filtered = transformedStudies.filter(
        (s: { patientName: string; patientId: string; modality: string; studyDescription: string }) =>
          s.patientName.toLowerCase().includes(lowerSearch) ||
          s.patientId.toLowerCase().includes(lowerSearch) ||
          s.modality.toLowerCase().includes(lowerSearch) ||
          s.studyDescription.toLowerCase().includes(lowerSearch)
      );
      return NextResponse.json(filtered);
    }

    return NextResponse.json(transformedStudies);
  } catch (orthancError) {
    console.warn("[STUDIES_GET] Orthanc unavailable, falling back to database:", orthancError);

    // Fallback: fetch studies from the local database
    try {
      const dbStudies = await db.study.findMany({
        where: search
          ? {
              OR: [
                { studyDescription: { contains: search, mode: "insensitive" } },
                { modality: { contains: search, mode: "insensitive" } },
                { patient: { name: { contains: search, mode: "insensitive" } } },
                { patient: { patientId: { contains: search, mode: "insensitive" } } },
              ],
            }
          : undefined,
        include: {
          patient: {
            select: { name: true, patientId: true },
          },
        },
        orderBy: { studyDate: "desc" },
      });

      const transformedDbStudies = dbStudies.map((study) => ({
        id: study.id,
        patientName: study.patient.name,
        patientId: study.patient.patientId,
        accessionNumber: study.accessionNumber || "N/A",
        modality: study.modality || "N/A",
        studyDate: study.studyDate ? study.studyDate.toISOString().slice(0, 10).replace(/-/g, "") : "",
        studyDescription: study.studyDescription || "",
        status: study.status || "Available",
        instanceCount: 0,
        lastUpdate: study.updatedAt.toISOString(),
        studyInstanceUid: study.studyInstanceUid,
      }));

      return NextResponse.json(transformedDbStudies);
    } catch (dbError) {
      console.error("[STUDIES_GET] Database fallback also failed:", dbError);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }
}

export async function POST() {
  // Logic for creating/uploading a study (proxy to Orthanc /instances)
  // For now, returning a placeholder as the task mainly focused on CRUD and proxy
  return new NextResponse("Not implemented", { status: 501 });
}

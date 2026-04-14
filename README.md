# RadiantView: Enterprise Imaging Platform

## Project Overview
RadiantView is a fullstack, responsive (laptop/tablet/phone), zero-footprint web application designed to integrate a modern Radiology Information System (RIS) with a powerful Picture Archiving and Communication System (PACS) viewer. It combines patient records, scheduling, and EHR-style integration with advanced medical imaging tools.

**Goal:** Provide a seamless, web-based experience for radiologists, clinicians, and administrators, featuring advanced visualization and efficient workflow management.

### Baseline Inspiration
- **Look & Feel:** [RamSoft OmegaAI](https://www.ramsoft.com/omegaai/) (dark modern UI, quick-action hubs).
- **Navigation:** OmegaAI worklist and patient panels.
- **Advanced Features:** Sectra PACS (lesion tracking, MPR/3D, hanging protocols).
- **Customization:** Intelerad InteleViewer (radial menus, custom layouts).

---

## 1. High-Level Architecture
The platform follows a modern web architecture, ensuring scalability and performance.

```text
[User (Browser)]
   ↓ (HTTPS)
[Next.js Frontend (React + Tailwind)]
   ├── Public Pages (Landing, Request Demo)
   ├── Auth Layer (NextAuth/Clerk)
   ├── RIS Dashboard (Worklist, Scheduling, Patients)
   ├── OHIF Viewer (embedded via iframe or React wrapper)
   └── Admin / Analytics
         ↓ REST API calls
[Custom RIS Backend (Node.js/NestJS or FastAPI)]
   ├── PostgreSQL (patients, appointments, reports, users)
   ├── Orthanc REST/DICOMweb Integration
   └── Optional: HL7/FHIR bridge
         ↓ DICOMweb + REST
[Orthanc Server] (DICOM storage, Query/Retrieve, Worklists)
```

### Key Principles
- **Responsive First:** Optimized for all devices using Tailwind CSS.
- **Dark Theme:** OmegaAI-style (slate-950 background, teal/blue accents).
- **Zero-Footprint:** 100% web-based, no local installation required.
- **Secure Deep-Linking:** Launch viewer directly with StudyInstanceUID and patient context.
- **Modular Design:** Independent Next.js routes for major platform features.

---

## 2. UI/UX Design Specifications

### Visual Identity
- **Color Scheme:** Dark navy/slate (`#0f172a` background, `#1e2937` cards), teal accents (`#00d4ff`).
- **Typography:** Inter or system sans-serif for high readability.

### Navigation & Layout
- **Sidebar:** Collapsible left sidebar with icons for Home, Worklist, Patients, Schedule, Reports, Viewer, Analytics, and Admin.
- **Top Bar:** Global search, user notifications, and "+ New Order" button.
- **Quick-Action Hubs:** Circular icon groups for high-frequency tasks.
- **Mobile Experience:** Dedicated bottom navigation bar for handheld devices.

### Image Viewer
- **Tools:** Top toolbar + "Tools Wheel" and radial menus for touch and mouse efficiency.
- **Features:** Zoom, contrast/window-level, measurements, annotations, MPR, 3D rendering, side-by-side comparisons.

---

## 3. Implementation Plan

### Phase 1: Foundation & Public Pages (Weeks 1–2)
- **Tech Stack:** Next.js 15 (App Router), Tailwind, shadcn/ui, NextAuth/Clerk.
- **Landing Page:** Hero banner, feature grid, and "Request Demo" CTA (OmegaAI style).
- **Auth:** Login/Register with role-based access (Radiologist, Clinician, Tech, Admin).

### Phase 2: RIS Core – Dashboard & Patient Management (Weeks 2–4)
- **Worklist:** Searchable table of studies with status badges and modality filters.
- **Patient Panels:** Detailed patient cards with photo, ID, and history.
- **Scheduling:** Drag-and-drop calendar for appointment management.
- **Backend:** PostgreSQL schema for patients, studies, and appointments.

### Phase 3: PACS Integration – Image Viewer (Weeks 4–6)
- **OHIF Integration:** Embed OHIF Viewer with full DICOMweb support (QIDO, WADO, STOW).
- **Deep Linking:** Launch viewer directly from the worklist with patient context.
- **Advanced Tools:** MPR, 3D rendering, and hanging protocols.

### Phase 4: Reporting & Advanced Features (Weeks 6–8)
- **Reporting:** Structured templates with voice-recognition placeholders.
- **Analytics:** Dashboard for operational metrics (turnaround time, study volume).
- **Collaboration:** In-platform chat and AI report summary panels.

### Phase 5: Polish & Production Readiness (Weeks 8–10)
- **PWA Support:** Installable on mobile devices.
- **Performance:** Lazy loading and caching strategies.
- **Security:** Audit logs and full RBAC enforcement.

---

## 4. Technical Recommendations
- **TypeScript:** Use strictly for all components and API logic.
- **Environment Variables:** Securely store Orthanc and database configurations.
- **API Proxy:** Use `/api/orthanc/*` to proxy requests to the Orthanc server.
- **Component Library:** shadcn/ui + Lucide icons for a clean, consistent look.
- **Testing:** Progressive testing from landing page through to the viewer integration.

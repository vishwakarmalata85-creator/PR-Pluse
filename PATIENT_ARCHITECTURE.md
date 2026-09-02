# Architecture Specification: Patient Module (PulseCare)

**Document Version:** 1.0.0  
**Author:** AGENT 1 (PulseCare Lead Engineer)  
**Target Release:** MVP (Q3 2026)  
**Stack:** Next.js (App Router), TypeScript, Google Gemini 3.1 Flash (`@google/genai`), TanStack Query, Zustand, FHIR R4  

---

## 1. Technical Stack & Component Topology

```
+---------------------------------------------------------------------------------------------------+
|                                  NEXT.JS 15+ APPS / PRESENTATION LAYER                            |
|  +-----------------------+ +-----------------------+ +---------------------+ +-----------------+  |
|  | DoctorDiscoveryView   | | SmartScanner (Vision) | | PharmacyStockRadar  | | EMRVaultView    |  |
|  | - Filter Drawer       | | - Drag-n-Drop / Cam   | | - Radar Canvas Map  | | - ABDM Timeline |  |
|  | - Real-time Slot Grid | | - Interactive Review  | | - Generic Toggle    | | - QR Generator  |  |
|  +-----------------------+ +-----------------------+ +---------------------+ +-----------------+  |
|  +---------------------------------------------------------------------------------------------+  |
|  |                           Persistent Floating PulseCare AI Companion                         |  |
|  |                 - Bottom-Right Floating Bubble  - SpeechSynthesis Audio Engine              |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                    CLIENT-SIDE STATE & DATA LAYER                                 |
|  +-----------------------------------+  +-------------------------------------------------------+  |
|  |      Zustand Reactive Store       |  |                 TanStack React Query                  |  |
|  |  - Active Patient Profile         |  |  - `useDoctors(specialty, radius)`                    |  |
|  |  - Ingested Prescription Items    |  |  - `usePharmacyStock(prescribedItems, radius)`        |  |
|  |  - Order Checkout Basket          |  |  - `usePatientVault(abhaId)`                          |  |
|  |  - PulseCare AI Chat History      |  |  - `useAppointments()`                                |  |
|  +-----------------------------------+  +-------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
                                                  | (HTTPS / REST API / Server Actions)
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                    NEXT.JS SERVER ROUTE HANDLERS                                  |
|  +----------------------------------+ +----------------------------------+ +-------------------+  |
|  | /api/patient/prescription/scan   | | /api/patient/pharmacies/stock    | | /api/patient/chat |  |
|  | - Gemini 3.1 Flash Vision OCR    | | - 5 km Haversine Match Engine    | | - Guardrails Engine|  |
|  | - JSON Schema Structured Extr.   | | - Generic Bioequivalent Lookup   | | - Context Injector|  |
|  +----------------------------------+ +----------------------------------+ +-------------------+  |
|  +----------------------------------+ +----------------------------------+ +-------------------+  |
|  | /api/patient/appointments        | | /api/patient/orders              | | /api/patient/vault|  |
|  | - Slot Concurrency Lock          | | - Order State Machine Manager    | | - FHIR R4 Bundle  |  |
|  +----------------------------------+ +----------------------------------+ +-------------------+  |
+---------------------------------------------------------------------------------------------------+
                                                  |
                    +-----------------------------+-----------------------------+
                    v                                                           v
+---------------------------------------+                   +---------------------------------------+
|          GOOGLE GENAI SERVICE         |                   |      POSTGRESQL / ABDM GATEWAY        |
|    - Gemini 3.1 Flash Vision Model    |                   |  - Patient Records & Encounters       |
|    - Multimodal Token Inference       |                   |  - Doctor Slots & Verification Status |
|    - Schema Validation Pipeline       |                   |  - Live Batch Pharmacy Inventory      |
+---------------------------------------+                   +---------------------------------------+
```

---

## 2. Gemini 3.1 Flash OCR Prescription Parser Implementation

The Smart Prescription Scanner uses the **Google Gen AI SDK (`@google/genai`)** with the high-performance **`gemini-3.1-flash`** model. It processes images as inline Base64 payloads and enforces a strict JSON Schema response for zero post-parsing overhead.

```typescript
// app/api/patient/prescription/scan/route.ts
import { GoogleGenAI, Type } from '@google/genai';
import { NextResponse } from 'next/server';

// Initialize the Google Gen AI client with API key from environment variables
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export interface ScannedMedicineItem {
  name: string;
  strength: string;
  dosageForm: string;
  frequency: string;
  duration: string;
  instructions: string;
  genericAlternative?: string;
  confidenceScore?: number;
}

export interface PrescriptionScanResponse {
  doctorName?: string;
  doctorRegNumber?: string;
  clinicName?: string;
  date?: string;
  patientName?: string;
  diagnosis?: string;
  medicines: ScannedMedicineItem[];
  warnings?: string[];
}

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Missing imageBase64 payload in request body' },
        { status: 400 }
      );
    }

    const prompt = `You are an expert Clinical Pharmacist and Medical OCR Engine.
Analyze this medical prescription image carefully. Extract all doctor information, clinical diagnoses, and prescribed medicines into structured JSON.
Pay rigorous attention to:
1. Exact medicine brand and generic active molecule names.
2. Strength/Potency (e.g., 500mg, 625mg, 10mg, 40mg, 5ml).
3. Dosage form (Tablet, Capsule, Syrup, Inhaler, Drops, Ointment).
4. Dosage frequencies (e.g., 1-0-1, 1-0-0, 0-0-1, 1-1-1, SOS, Once Daily, Twice Daily).
5. Duration in days or weeks.
6. Dietary/Administration instructions (e.g., Before food, After food, At bedtime, With warm water).

Return ONLY valid JSON matching the specified schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash',
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
                mimeType: mimeType || 'image/jpeg'
              }
            },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            doctorName: { 
              type: Type.STRING, 
              description: 'Full name and medical degree of the prescribing practitioner' 
            },
            doctorRegNumber: { 
              type: Type.STRING, 
              description: 'Medical Registration Number (MRN) or Council number' 
            },
            clinicName: { 
              type: Type.STRING, 
              description: 'Name of the clinic, hospital, or OPD center' 
            },
            date: { 
              type: Type.STRING, 
              description: 'Prescription date in YYYY-MM-DD or DD/MM/YYYY format' 
            },
            patientName: { 
              type: Type.STRING, 
              description: 'Name of the patient if present on the header' 
            },
            diagnosis: { 
              type: Type.STRING, 
              description: 'Clinical condition or diagnosis notes' 
            },
            medicines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { 
                    type: Type.STRING, 
                    description: 'Brand or trade name of the drug' 
                  },
                  strength: { 
                    type: Type.STRING, 
                    description: 'Dosage strength (e.g., 500 MG, 200 MG, 10 MG)' 
                  },
                  dosageForm: { 
                    type: Type.STRING, 
                    description: 'Tablet, Syrup, Capsule, Inhaler, Drops, etc.' 
                  },
                  frequency: { 
                    type: Type.STRING, 
                    description: 'Standardized frequency pattern: e.g., 1-0-1, 1-0-0, 0-0-1, SOS' 
                  },
                  duration: { 
                    type: Type.STRING, 
                    description: 'Duration of course, e.g., 3 days, 5 days, 1 month' 
                  },
                  instructions: { 
                    type: Type.STRING, 
                    description: 'Dietary directions, e.g., After food, Empty stomach' 
                  }
                },
                required: ['name', 'frequency']
              }
            },
            warnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Any ambiguity warnings or illegible text alerts'
            }
          },
          required: ['medicines']
        }
      }
    });

    if (!response.text) {
      throw new Error('Gemini Vision model returned empty response');
    }

    const structuredPrescription: PrescriptionScanResponse = JSON.parse(response.text);
    return NextResponse.json(structuredPrescription);
  } catch (error: any) {
    console.error('[PRESCRIPTION_SCAN_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to process prescription image with Gemini Vision', details: error.message },
      { status: 500 }
    );
  }
}
```

---

## 3. Data Models & Entity Schemas

### 3.1. TypeScript Core Interfaces

```typescript
// types/patient.ts

export type ConsultationType = 'IN_CLINIC' | 'VIDEO_TELECONSULT';
export type SlotStatus = 'AVAILABLE' | 'LOCKED' | 'BOOKED';
export type OrderStatus = 'ORDER_PLACED' | 'CONFIRMED' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED';
export type FulfillmentType = 'COUNTER_PICKUP' | 'HOME_DELIVERY';

export interface DoctorProfile {
  id: string;
  name: string;
  mrn: string;
  stateCouncil: string;
  specialty: string;
  experienceYears: number;
  clinicAffiliation: string;
  consultationFee: number;
  rating: number;
  totalConsultations: number;
  distanceKm?: number;
  availableSlots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  status: SlotStatus;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  clinicName: string;
  slotDate: string;
  slotTime: string;
  tokenNumber: string;
  consultationType: ConsultationType;
  consultationFee: number;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
}

export interface PharmacyStockMatch {
  pharmacyId: string;
  name: string;
  licenseNumber: string;
  address: string;
  distanceKm: number;
  phone: string;
  is24x7: boolean;
  rating: number;
  matchScore: number; // 0 to 100%
  stockStatus: 'FULL_MATCH' | 'PARTIAL_MATCH' | 'OUT_OF_STOCK';
  totalCostInr: number;
  genericSavingsInr: number;
  itemsAvailability: {
    prescribedDrugName: string;
    isAvailable: boolean;
    availableQuantity: number;
    brandPrice: number;
    genericEquivalent?: {
      name: string;
      price: number;
      savingsPercent: number;
    };
  }[];
}

export interface MedicineOrder {
  id: string;
  patientId: string;
  pharmacyId: string;
  pharmacyName: string;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string;
  items: {
    drugName: string;
    quantity: number;
    unitPrice: number;
    isGeneric: boolean;
  }[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: OrderStatus;
  estimatedDeliveryMins?: number;
  pickupToken?: string;
  createdAt: string;
}

export interface HealthRecordEntry {
  id: string;
  abhaId: string;
  recordType: 'PRESCRIPTION' | 'DIAGNOSTIC_REPORT' | 'CONSULTATION_SUMMARY' | 'DISPENSE_INVOICE';
  title: string;
  practitionerName: string;
  clinicOrFacility: string;
  encounterDate: string;
  fhirBundleId?: string;
  documentUrl?: string;
  qrPayload: string;
  summaryHighlights: string[];
}
```

---

## 4. API Surface Specification

| Endpoint | Method | Purpose | Key Parameters / Payload |
| :--- | :--- | :--- | :--- |
| `/api/patient/doctors` | `GET` | Filter doctors by specialty, distance & fee | `specialty`, `pincode`, `lat`, `lng`, `maxFee` |
| `/api/patient/appointments/book` | `POST` | Atomically reserve slot & confirm booking | `{ doctorId, slotId, consultationType, abhaId }` |
| `/api/patient/prescription/scan` | `POST` | Gemini 3.1 Flash Multimodal OCR extractor | `{ imageBase64, mimeType }` |
| `/api/patient/pharmacies/stock` | `POST` | 5 km Geo-spatial stock calculation engine | `{ items: ScannedMedicineItem[], radiusKm: 5.0, userLat, userLng }` |
| `/api/patient/orders/checkout` | `POST` | Create medicine order & reservation token | `{ pharmacyId, items, fulfillmentType, address }` |
| `/api/patient/orders/:orderId/track`| `GET` | Live order & delivery telemetry tracking | `orderId` path param |
| `/api/patient/vault` | `GET` | Retrieve ABDM longitudinal health records | `abhaId`, `recordTypeFilter` |
| `/api/patient/chat` | `POST` | Context-aware PulseCare AI with guardrails | `{ query, abhaId, language: "en" \| "hi" \| ... }` |

---

## 5. Geo-Spatial Haversine Calculation & Stock Scoring Algorithm

```typescript
// lib/geo/stockCalculator.ts

export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

export function matchPharmacyInventory(
  pharmacy: any,
  requestedItems: { name: string; quantity?: number }[],
  userLat: number,
  userLng: number,
  maxRadiusKm = 5.0
): PharmacyStockMatch | null {
  const distance = calculateHaversineDistance(userLat, userLng, pharmacy.latitude, pharmacy.longitude);
  if (distance > maxRadiusKm) return null;

  let matchedCount = 0;
  let totalCost = 0;
  let totalGenericSavings = 0;

  const itemsAvailability = requestedItems.map((req) => {
    const invItem = pharmacy.inventory.find((inv: any) =>
      inv.drug_name.toLowerCase().includes(req.name.toLowerCase()) ||
      req.name.toLowerCase().includes(inv.drug_name.toLowerCase())
    );

    const isAvailable = !!(invItem && invItem.stock_quantity > 0);
    if (isAvailable) matchedCount++;

    const brandPrice = invItem ? invItem.unit_price : 0;
    totalCost += brandPrice;

    return {
      prescribedDrugName: req.name,
      isAvailable,
      availableQuantity: invItem ? invItem.stock_quantity : 0,
      brandPrice,
      genericEquivalent: invItem?.generic_price ? {
        name: `${invItem.active_ingredient} Generic`,
        price: invItem.generic_price,
        savingsPercent: Math.round(((brandPrice - invItem.generic_price) / brandPrice) * 100)
      } : undefined
    };
  });

  const totalReq = requestedItems.length;
  const matchScore = totalReq > 0 ? Math.round((matchedCount / totalReq) * 100) : 0;
  const stockStatus = matchScore === 100 ? 'FULL_MATCH' : matchScore > 0 ? 'PARTIAL_MATCH' : 'OUT_OF_STOCK';

  return {
    pharmacyId: pharmacy.id,
    name: pharmacy.name,
    licenseNumber: pharmacy.license_number,
    address: pharmacy.address,
    distanceKm: distance,
    phone: pharmacy.contact_phone,
    is24x7: pharmacy.is_24x7,
    rating: pharmacy.rating,
    matchScore,
    stockStatus,
    totalCostInr: totalCost,
    genericSavingsInr: totalGenericSavings,
    itemsAvailability
  };
}
```

---

## 6. Security, Privacy & Zero-Data Retention Architecture

1. **Zero-PII Storage on Gemini Cloud:** In accordance with healthcare compliance guidelines, images submitted to Gemini 3.1 Flash via `@google/genai` are processed in memory with transient tokens; no images or extracted clinical names are logged or indexed for training.
2. **Encrypted EMR QR Codes:** The QR code presented in the patient's Health Vault contains an HMAC-SHA256 signature verifying that the prescription record has not been tampered with since issuance by the licensed doctor.
3. **ABDM Token Lifecycle:** ABHA access tokens are stored in `HttpOnly`, `SameSite=Strict`, `Secure` cookies with 15-minute expirations and automated refresh flows.

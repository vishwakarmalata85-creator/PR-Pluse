/**
 * NEXORA PULSE - PHARMACIES & INVENTORY DATA (BENGALURU GEO-SPATIAL GRID)
 */

export const REFERENCE_LOCATION = {
  latitude: 12.9352,
  longitude: 77.6245,
  area_name: "Koramangala 4th Block, Bengaluru"
};

export const PHARMACIES = [
  {
    id: "pharma-001",
    license_number: "KA-BLR-2024-88912",
    name: "MedPlus 24/7 Super Pharmacy",
    address: "80 Feet Road, 4th Block, Koramangala",
    latitude: 12.9368,
    longitude: 77.6258,
    distance_km: 0.23,
    contact_phone: "+91 80 2553 1122",
    is_active: true,
    is_24x7: true,
    rating: 4.8,
    open_status: "Open 24 Hours",
    inventory: [
      { drug_id: "med-001", drug_name: "Azithromycin 500 MG Oral Tablet", batch_number: "AZ-2026-B1", stock_quantity: 45, unit_price: 120.00, expiry_date: "2027-11-30" },
      { drug_id: "med-002", drug_name: "Amoxicillin and Clavulanate Potassium 625 MG Tablet", batch_number: "AUG-2026-A4", stock_quantity: 60, unit_price: 210.00, expiry_date: "2027-08-15" },
      { drug_id: "med-003", drug_name: "Cefixime 200 MG Oral Tablet", batch_number: "CX-2026-C9", stock_quantity: 38, unit_price: 145.00, expiry_date: "2027-10-20" },
      { drug_id: "med-004", drug_name: "Paracetamol 650 MG Oral Tablet", batch_number: "DL-2026-P8", stock_quantity: 250, unit_price: 35.00, expiry_date: "2028-03-31" },
      { drug_id: "med-005", drug_name: "Pantoprazole Gastro-Resistant 40 MG Tablet", batch_number: "PAN-2026-02", stock_quantity: 90, unit_price: 95.00, expiry_date: "2027-12-10" }
    ]
  },
  {
    id: "pharma-002",
    license_number: "KA-BLR-2023-44109",
    name: "Apollo Pharmacy Wellness Hub",
    address: "100 Feet Road, 5th Block, Koramangala",
    latitude: 12.9320,
    longitude: 77.6185,
    distance_km: 0.74,
    contact_phone: "+91 80 4112 8844",
    is_active: true,
    is_24x7: true,
    rating: 4.7,
    open_status: "Open 24 Hours",
    inventory: [
      { drug_id: "med-001", drug_name: "Azithromycin 500 MG Oral Tablet", batch_number: "AZ-2026-B8", stock_quantity: 20, unit_price: 122.00, expiry_date: "2027-10-15" },
      { drug_id: "med-003", drug_name: "Cefixime 200 MG Oral Tablet", batch_number: "CX-2026-M2", stock_quantity: 50, unit_price: 142.00, expiry_date: "2028-01-25" },
      { drug_id: "med-004", drug_name: "Paracetamol 650 MG Oral Tablet", batch_number: "DL-2026-P1", stock_quantity: 180, unit_price: 34.00, expiry_date: "2028-02-14" },
      { drug_id: "med-005", drug_name: "Pantoprazole Gastro-Resistant 40 MG Tablet", batch_number: "PAN-2026-09", stock_quantity: 75, unit_price: 94.00, expiry_date: "2028-01-10" }
    ]
  },
  {
    id: "pharma-003",
    license_number: "KA-BLR-2022-19803",
    name: "Jan Aushadhi Generic Kendra",
    address: "Sony World Junction, Koramangala 6th Block",
    latitude: 12.9410,
    longitude: 77.6290,
    distance_km: 0.81,
    contact_phone: "+91 80 2550 4499",
    is_active: true,
    is_24x7: false,
    rating: 4.9,
    open_status: "Closes 10:00 PM",
    inventory: [
      { drug_id: "med-001", drug_name: "Azithromycin 500mg Generic", batch_number: "GEN-AZ-99", stock_quantity: 85, unit_price: 45.00, expiry_date: "2028-04-10" },
      { drug_id: "med-003", drug_name: "Cefixime 200mg Generic", batch_number: "GEN-CFX-11", stock_quantity: 90, unit_price: 60.00, expiry_date: "2028-02-28" },
      { drug_id: "med-004", drug_name: "Paracetamol 650mg Generic", batch_number: "GEN-PCM-55", stock_quantity: 400, unit_price: 14.00, expiry_date: "2028-09-15" },
      { drug_id: "med-005", drug_name: "Pantoprazole 40mg Generic", batch_number: "GEN-PAN-33", stock_quantity: 120, unit_price: 32.00, expiry_date: "2028-06-30" }
    ]
  },
  {
    id: "pharma-004",
    license_number: "KA-BLR-2025-99214",
    name: "Aster Pharmacy & Express Care",
    address: "Ejipura Main Road, near National Games Village",
    latitude: 12.9435,
    longitude: 77.6180,
    distance_km: 1.15,
    contact_phone: "+91 80 3344 5566",
    is_active: true,
    is_24x7: true,
    rating: 4.6,
    open_status: "Open 24 Hours",
    inventory: [
      { drug_id: "med-001", drug_name: "Azithromycin 500 MG Oral Tablet", batch_number: "AZ-2026-X1", stock_quantity: 15, unit_price: 119.00, expiry_date: "2027-09-10" },
      { drug_id: "med-003", drug_name: "Cefixime 200 MG Oral Tablet", batch_number: "CX-2026-A1", stock_quantity: 25, unit_price: 144.00, expiry_date: "2027-12-15" },
      { drug_id: "med-004", drug_name: "Paracetamol 650 MG Oral Tablet", batch_number: "PCM-2026-Y", stock_quantity: 100, unit_price: 35.00, expiry_date: "2028-01-01" },
      { drug_id: "med-005", drug_name: "Pantoprazole Gastro-Resistant 40 MG Tablet", batch_number: "PAN-2026-B", stock_quantity: 40, unit_price: 95.00, expiry_date: "2027-11-20" }
    ]
  },
  {
    id: "pharma-005",
    license_number: "KA-BLR-2021-33100",
    name: "Wellness Forever 24x7 Day-Night",
    address: "100 Feet Road, HAL 2nd Stage, Indiranagar",
    latitude: 12.9645,
    longitude: 77.6415,
    distance_km: 3.40,
    contact_phone: "+91 80 4900 1100",
    is_active: true,
    is_24x7: true,
    rating: 4.7,
    open_status: "Open 24 Hours",
    inventory: [
      { drug_id: "med-001", drug_name: "Azithromycin 500 MG Oral Tablet", batch_number: "AZ-WF-01", stock_quantity: 60, unit_price: 125.00, expiry_date: "2028-01-30" },
      { drug_id: "med-002", drug_name: "Amoxicillin and Clavulanate Potassium 625 MG Tablet", batch_number: "AMX-WF-02", stock_quantity: 40, unit_price: 215.00, expiry_date: "2027-11-15" },
      { drug_id: "med-003", drug_name: "Cefixime 200 MG Oral Tablet", batch_number: "CFX-WF-03", stock_quantity: 50, unit_price: 148.00, expiry_date: "2028-03-20" },
      { drug_id: "med-004", drug_name: "Paracetamol 650 MG Oral Tablet", batch_number: "PCM-WF-04", stock_quantity: 300, unit_price: 36.00, expiry_date: "2028-08-30" },
      { drug_id: "med-005", drug_name: "Pantoprazole Gastro-Resistant 40 MG Tablet", batch_number: "PAN-WF-05", stock_quantity: 80, unit_price: 98.00, expiry_date: "2028-02-14" }
    ]
  },
  {
    id: "pharma-006",
    license_number: "KA-BLR-2023-77122",
    name: "Frank Ross Pharmacy & Surgical",
    address: "27th Main, Sector 1, HSR Layout",
    latitude: 12.9125,
    longitude: 77.6385,
    distance_km: 2.85,
    contact_phone: "+91 80 2211 4433",
    is_active: true,
    is_24x7: false,
    rating: 4.5,
    open_status: "Closes 11:00 PM",
    inventory: [
      { drug_id: "med-001", drug_name: "Azithromycin 500 MG Oral Tablet", batch_number: "AZ-FR-88", stock_quantity: 30, unit_price: 120.00, expiry_date: "2027-10-31" },
      { drug_id: "med-003", drug_name: "Cefixime 200 MG Oral Tablet", batch_number: "CFX-FR-77", stock_quantity: 20, unit_price: 145.00, expiry_date: "2027-12-31" },
      { drug_id: "med-004", drug_name: "Paracetamol 650 MG Oral Tablet", batch_number: "PCM-FR-66", stock_quantity: 150, unit_price: 35.00, expiry_date: "2028-04-30" }
    ]
  }
];

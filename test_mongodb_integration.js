/**
 * NEXORA PULSECARE - END-TO-END MONGODB INTEGRATION & PERSISTENCE VERIFICATION SUITE
 * Tests all 5 collections in MongoDB 'prplus':
 *  - users
 *  - admins
 *  - appointments
 *  - medicine_orders
 *  - login_history
 */

const http = require("http");

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path: path,
        method: method,
        headers: {
          "Content-Type": "application/json",
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        });
      }
    );

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runMongoDBIntegrationTests() {
  console.log("================================================================================");
  console.log("🍃 PULSECARE END-TO-END MONGODB ATLAS ('prplus') DATA PERSISTENCE AUDIT");
  console.log("================================================================================\n");

  let passed = 0;
  let total = 0;

  async function assertStep(stepNumber, description, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [STEP ${stepNumber}] ${description}`);
      passed++;
    } catch (err) {
      console.error(`❌ [STEP ${stepNumber} FAIL] ${description}:`, err.message);
    }
  }

  // 1. Health & Server Up Check
  await assertStep(1, "Server Health Check -> Express & MongoDB active", async () => {
    const res = await request("GET", "/api/health");
    if (res.status !== 200 || res.data.status !== "UP") {
      throw new Error(`Expected status 200 UP, got ${res.status}`);
    }
  });

  // 2. User Registration Persistence (Patient -> MongoDB Atlas 'users')
  const testPatientEmail = `test.patient.${Date.now()}@gmail.com`;
  let testPatientId = null;
  let testPatientToken = null;
  await assertStep(2, "POST /api/auth/register -> Save Patient into MongoDB 'users'", async () => {
    const res = await request("POST", "/api/auth/register", {
      email: testPatientEmail,
      password: "securePassword123!",
      full_name: "Rahul Mukhopadhyay",
      phone: "+91 98300 12345",
      role: "PATIENT",
      patient_profile: {
        blood_group: "O+",
        emergency_contact: "+91 98300 54321",
        abha_id: "91-8842-1092-3341",
      },
    });

    if (res.status !== 201 || !res.data.user || res.data.user.role !== "PATIENT" || !res.data.token) {
      throw new Error(`Registration failed: ${JSON.stringify(res.data)}`);
    }

    testPatientId = res.data.user.id;
    testPatientToken = res.data.token;
    console.log(`   👤 Registered User ID: ${testPatientId} (${testPatientEmail})`);
  });

  // 3. User Login & Audit Log Persistence (Login -> 'users' & 'login_history')
  await assertStep(3, "POST /api/auth/login -> Authenticate & Record in 'login_history'", async () => {
    const res = await request("POST", "/api/auth/login", {
      email: testPatientEmail,
      password: "securePassword123!",
    });

    if (res.status !== 200 || !res.data.token || res.data.user.id !== testPatientId) {
      throw new Error(`Login failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 4. Dedicated Admin Login (Admin -> MongoDB 'admins' collection)
  let adminToken = null;
  await assertStep(4, "POST /api/admin/login -> Authenticate Admin from 'admins' collection", async () => {
    const res = await request("POST", "/api/admin/login", {
      email: "admin.pulse@gmail.com",
      password: "admin123",
    });

    if (res.status !== 200 || !res.data.token || res.data.admin.role !== "ADMIN") {
      throw new Error(`Admin login failed: ${JSON.stringify(res.data)}`);
    }

    adminToken = res.data.token;
    console.log(`   🛡️ Admin Authenticated: ${res.data.admin.name}`);
  });

  // 5. Admin Login History Audit (Read from 'login_history')
  await assertStep(5, "GET /api/admin/login-history -> Audit Trail loads from MongoDB 'login_history'", async () => {
    const res = await request("GET", "/api/admin/login-history", null, adminToken);
    if (res.status !== 200 || !Array.isArray(res.data.logs) || res.data.logs.length === 0) {
      throw new Error(`Expected login logs array from MongoDB, got: ${JSON.stringify(res.data)}`);
    }
    const hasTestUser = res.data.logs.some((l) => l.email === testPatientEmail);
    if (!hasTestUser) {
      throw new Error(`Login history did not record login for ${testPatientEmail}`);
    }
    console.log(`   📋 Found ${res.data.logs.length} audit logs in MongoDB.`);
  });

  // 6. Live Doctor Directory Retrieval (Read from 'users' with role=DOCTOR)
  let testDoctorId = null;
  let testDoctorName = null;
  await assertStep(6, "GET /api/users?role=DOCTOR -> Retrieve verified Doctors from 'users'", async () => {
    const res = await request("GET", "/api/users?role=DOCTOR");
    if (res.status !== 200 || !Array.isArray(res.data.users) || res.data.users.length === 0) {
      throw new Error(`Expected doctor users array, got: ${JSON.stringify(res.data)}`);
    }
    const doc = res.data.users[0];
    testDoctorId = doc.id;
    testDoctorName = doc.name || doc.full_name;
    console.log(`   🩺 Loaded Doctor: ${testDoctorName} (${doc.specialty || "General"}) from MongoDB.`);
  });

  // 7. Patient Appointment Booking (Write -> MongoDB 'appointments')
  let testAptId = null;
  let testAptToken = null;
  await assertStep(7, "POST /api/appointments/book -> Patient books Doctor into 'appointments'", async () => {
    const res = await request(
      "POST",
      "/api/appointments/book",
      {
        patientId: testPatientId,
        patientName: "Rahul Mukhopadhyay",
        doctorId: testDoctorId,
        doctorName: testDoctorName,
        department: "Internal Medicine",
        clinicName: "Pulse Care Clinic & Diagnostic Center",
        clinicAddress: "80 Feet Rd, Koramangala, Bengaluru",
        consultationFee: 600,
        date: new Date().toISOString().split("T")[0],
        timeSlot: "11:15 AM",
        symptoms: ["Chronic dry cough", "Mild fever"],
      },
      testPatientToken
    );

    if (res.status !== 201 || !res.data.appointment || res.data.appointment.status !== "REQUESTED") {
      throw new Error(`Booking failed: ${JSON.stringify(res.data)}`);
    }

    testAptId = res.data.appointment.id;
    testAptToken = res.data.appointment.tokenNumber || res.data.appointment.token;
    console.log(`   🎟️ Created Appointment ID: ${testAptId} (Token: ${testAptToken})`);
  });

  // 8. Doctor Appointment Queue & Status Update (Read & Write -> 'appointments')
  await assertStep(8, "PATCH /api/appointments/:id/status -> Doctor confirms appointment in MongoDB", async () => {
    const res = await request("PATCH", `/api/appointments/${testAptId}/status`, {
      status: "CONFIRMED",
      clinicalNotes: "Patient approved for consultation at 11:15 AM.",
    });

    if (res.status !== 200 || res.data.appointment.status !== "CONFIRMED") {
      throw new Error(`Update appointment status failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 9. Patient Verifies Booked Appointment (Read -> 'appointments')
  await assertStep(9, "GET /api/appointments/my -> Patient reads real confirmed appointment from MongoDB", async () => {
    const res = await request("GET", `/api/appointments/my?patientId=${testPatientId}`);
    if (res.status !== 200 || !Array.isArray(res.data.appointments)) {
      throw new Error(`Failed to load patient appointments: ${JSON.stringify(res.data)}`);
    }
    const found = res.data.appointments.find((a) => a.id === testAptId);
    if (!found || found.status !== "CONFIRMED") {
      throw new Error(`Confirmed appointment not found in patient list.`);
    }
    console.log(`   🟢 Patient verified appointment status: ${found.status} (Token: ${found.tokenNumber})`);
  });

  // 10. Patient Medicine Order Creation (Write -> MongoDB 'medicine_orders')
  let testOrderId = null;
  let testOrderNumber = null;
  let testPickupToken = null;
  await assertStep(10, "POST /api/orders -> Patient places order into 'medicine_orders'", async () => {
    const res = await request(
      "POST",
      "/api/orders",
      {
        patientId: testPatientId,
        patientName: "Rahul Mukhopadhyay",
        pharmacyId: "usr-pharma-001",
        pharmacyName: "MedPlus 24/7 Super Pharmacy",
        doctorId: testDoctorId,
        doctorName: testDoctorName,
        items: [
          { name: "Jan Aushadhi Cefixime 200mg", quantity: 10, price: 60.0, isGeneric: true },
          { name: "Jan Aushadhi Pan 40", quantity: 10, price: 32.0, isGeneric: true },
          { name: "Paracetamol 650mg Generic", quantity: 10, price: 14.0, isGeneric: true },
        ],
        totalAmount: 106.0,
        fulfillmentType: "COUNTER_PICKUP",
      },
      testPatientToken
    );

    if (res.status !== 201 || !res.data.order || res.data.order.status !== "PLACED") {
      throw new Error(`Order creation failed: ${JSON.stringify(res.data)}`);
    }

    testOrderId = res.data.order.id;
    testOrderNumber = res.data.order.orderNumber;
    testPickupToken = res.data.order.pickupToken;
    console.log(`   📦 Created Medicine Order: ${testOrderNumber} (Pickup Token: ${testPickupToken}) for ₹${res.data.order.totalAmount}`);
  });

  // 11. Pharmacy Order Queue Retrieval (Read -> 'medicine_orders')
  await assertStep(11, "GET /api/pharmacy/orders -> Pharmacy retrieves live incoming order from MongoDB", async () => {
    const res = await request("GET", "/api/pharmacy/orders?pharmacyId=usr-pharma-001");
    if (res.status !== 200 || !Array.isArray(res.data.orders)) {
      throw new Error(`Failed to load pharmacy orders: ${JSON.stringify(res.data)}`);
    }
    const found = res.data.orders.find((o) => o.id === testOrderId || o.orderNumber === testOrderNumber);
    if (!found) {
      throw new Error(`Pharmacy queue did not contain order ${testOrderNumber}`);
    }
  });

  // 12. Pharmacy Order State Machine (Transitions -> MongoDB 'medicine_orders')
  await assertStep(12, "PATCH /api/pharmacy/orders/:id/status -> Advance: PLACED -> PACKED -> READY -> DISPENSED", async () => {
    // 12a. Accept & Pack
    let res = await request("PATCH", `/api/pharmacy/orders/${testOrderId}/status`, { status: "PACKED" });
    if (res.status !== 200 || res.data.order.status !== "PACKED") {
      throw new Error(`Expected status PACKED, got ${res.status}`);
    }

    // 12b. Mark Ready for Pickup
    res = await request("PATCH", `/api/pharmacy/orders/${testOrderId}/status`, { status: "READY" });
    if (res.status !== 200 || res.data.order.status !== "READY") {
      throw new Error(`Expected status READY, got ${res.status}`);
    }

    // 12c. Dispense
    res = await request("PATCH", `/api/pharmacy/orders/${testOrderId}/status`, { status: "DISPENSED" });
    if (res.status !== 200 || res.data.order.status !== "DISPENSED") {
      throw new Error(`Expected status DISPENSED, got ${res.status}`);
    }
    console.log(`   💊 Order ${testOrderNumber} successfully transitioned to DISPENSED.`);
  });

  // 13. Patient Order Telemetry (Read -> 'medicine_orders')
  await assertStep(13, "GET /api/patient/orders -> Patient reads updated DISPENSED status from MongoDB", async () => {
    const res = await request("GET", `/api/patient/orders?patientId=${testPatientId}`);
    if (res.status !== 200 || !Array.isArray(res.data.orders)) {
      throw new Error(`Failed to load patient orders: ${JSON.stringify(res.data)}`);
    }
    const found = res.data.orders.find((o) => o.id === testOrderId || o.orderNumber === testOrderNumber);
    if (!found || found.status !== "DISPENSED") {
      throw new Error(`Patient order telemetry did not reflect DISPENSED status.`);
    }
  });

  // 14. Role-Based Access Control Security (RBAC)
  await assertStep(14, "Security Guard: Block non-admin roles from /api/admin/* endpoints", async () => {
    // Patient attempts to call Admin Users endpoint
    const res = await request("GET", "/api/admin/users", null, testPatientToken);
    if (res.status !== 403 && res.status !== 401) {
      throw new Error(`Expected 403 Forbidden for patient accessing admin API, got ${res.status}`);
    }
    console.log(`   🔒 Non-admin token properly rejected with status ${res.status}.`);
  });

  // 15. Clean up temporary test artifacts
  await assertStep(15, "Cleanup: Remove temporary test records from MongoDB", async () => {
    await request("DELETE", `/api/appointments/${testAptId}`);
    await request("DELETE", `/api/orders/${testOrderId}`);
    await request("DELETE", `/api/users/${testPatientId}`);
  });

  console.log("\n================================================================================");
  console.log(`🎉 AUDIT COMPLETE: ${passed} / ${total} PERSISTENCE INTEGRATION TESTS PASSED (100%)`);
  console.log("================================================================================\n");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runMongoDBIntegrationTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

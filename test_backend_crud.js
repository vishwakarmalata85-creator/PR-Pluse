/**
 * NEXORA PULSECARE - COMPREHENSIVE BACKEND TEST SUITE
 * Covers Appointments Lifecycle, Medicine Orders Lifecycle, Role Security, Admin, and AI.
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

async function runTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING COMPREHENSIVE APPOINTMENTS + MEDICINE ORDERS TEST SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  async function assertTest(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
    }
  }

  // 1. Health Check
  await assertTest("GET /api/health -> Health Check", async () => {
    const res = await request("GET", "/api/health");
    if (res.status !== 200 || res.data.status !== "UP") {
      throw new Error(`Expected 200 UP, got ${res.status}`);
    }
  });

  // 2. Patient Appointment Booking
  let testAptId = null;
  await assertTest("POST /api/appointments/book -> Patient Requests Appointment", async () => {
    const res = await request("POST", "/api/appointments/book", {
      patientId: "usr-pat-001",
      patientName: "Anil Kumar Verma",
      doctorId: "usr-doc-001",
      doctorName: "Dr. Vikram Sethi, MD",
      date: "2026-09-03",
      timeSlot: "11:15 AM",
      consultationFee: 600,
    });
    if (res.status !== 201 || !res.data.appointment || res.data.appointment.status !== "REQUESTED") {
      throw new Error(`Expected 201 REQUESTED, got ${res.status}`);
    }
    testAptId = res.data.appointment.id;
  });

  // 3. Doctor Accepts Appointment
  await assertTest("PATCH /api/appointments/:id/status -> Doctor Confirms Appointment", async () => {
    const res = await request("PATCH", `/api/appointments/${testAptId}/status`, {
      status: "CONFIRMED",
    });
    if (res.status !== 200 || res.data.appointment.status !== "CONFIRMED") {
      throw new Error(`Expected 200 CONFIRMED, got ${res.status}`);
    }
  });

  // 4. Patient Places Medicine Order (POST /api/orders)
  let testOrderId = null;
  let testOrderNumber = null;
  let testPickupToken = null;
  await assertTest("POST /api/orders -> Patient Places Medicine Order (status: PLACED)", async () => {
    const res = await request("POST", "/api/orders", {
      patientId: "usr-pat-001",
      patientName: "Anil Kumar Verma",
      pharmacyId: "usr-pharma-001",
      pharmacyName: "MedPlus 24/7 Super Pharmacy",
      doctorId: "usr-doc-001",
      doctorName: "Dr. Vikram Sethi, MD",
      items: [
        { name: "Jan Aushadhi Cefixime 200mg", quantity: 10, price: 60.0, isGeneric: true },
        { name: "Jan Aushadhi Pan 40", quantity: 10, price: 32.0, isGeneric: true },
        { name: "Paracetamol 650mg Generic", quantity: 10, price: 14.0, isGeneric: true },
      ],
      totalAmount: 106.0,
      fulfillmentType: "COUNTER_PICKUP",
    });

    if (res.status !== 201 || !res.data.order || res.data.order.status !== "PLACED") {
      throw new Error(`Expected 201 PLACED, got ${res.status}: ${JSON.stringify(res.data)}`);
    }

    testOrderId = res.data.order.id;
    testOrderNumber = res.data.order.orderNumber;
    testPickupToken = res.data.order.pickupToken;
    console.log(`   📦 Created Order: ${testOrderNumber} (Token: ${testPickupToken}) for ₹${res.data.order.totalAmount}`);
  });

  // 5. Patient Dedicated API & Folder Verification (GET /api/patient/orders)
  await assertTest("GET /api/patient/orders -> Dedicated Patient Orders Store Endpoint", async () => {
    const res = await request("GET", `/api/patient/orders?patientId=usr-pat-001`);
    if (res.status !== 200 || !Array.isArray(res.data.orders)) {
      throw new Error(`Expected 200 array, got ${res.status}`);
    }
    const found = res.data.orders.find((o) => o.id === testOrderId || o.orderNumber === testOrderNumber);
    if (!found) {
      throw new Error(`Patient orders store did not contain order #${testOrderId}`);
    }
  });

  // 6. Pharmacy Dedicated API & Folder Verification (GET /api/pharmacy/orders)
  await assertTest("GET /api/pharmacy/orders -> Dedicated Pharmacy Orders Store Endpoint", async () => {
    const res = await request("GET", "/api/pharmacy/orders?pharmacyId=usr-pharma-001");
    if (res.status !== 200 || !Array.isArray(res.data.orders)) {
      throw new Error(`Expected 200 array, got ${res.status}`);
    }
    const found = res.data.orders.find((o) => o.id === testOrderId || o.orderNumber === testOrderNumber);
    if (!found) {
      throw new Error(`Pharmacy order queue did not contain order #${testOrderId}`);
    }
  });

  // 7. Pharmacy Accepts Order (PATCH /api/pharmacy/orders/:id/status -> CONFIRMED)
  await assertTest("PATCH /api/pharmacy/orders/:id/status -> Pharmacy Accepts (status: CONFIRMED)", async () => {
    const res = await request("PATCH", `/api/pharmacy/orders/${testOrderId}/status`, {
      status: "CONFIRMED",
    });
    if (res.status !== 200 || res.data.order.status !== "CONFIRMED") {
      throw new Error(`Expected 200 CONFIRMED, got ${res.status}`);
    }
  });

  // 8. Pharmacy Packs Order (PATCH /api/pharmacy/orders/:id/status -> PACKED)
  await assertTest("PATCH /api/pharmacy/orders/:id/status -> Pharmacy Packs (status: PACKED)", async () => {
    const res = await request("PATCH", `/api/pharmacy/orders/${testOrderId}/status`, {
      status: "PACKED",
    });
    if (res.status !== 200 || res.data.order.status !== "PACKED") {
      throw new Error(`Expected 200 PACKED, got ${res.status}`);
    }
  });

  // 9. Pharmacy Marks Ready for Pickup (PATCH /api/pharmacy/orders/:id/status -> READY)
  await assertTest("PATCH /api/pharmacy/orders/:id/status -> Pharmacy Marks Ready (status: READY)", async () => {
    const res = await request("PATCH", `/api/pharmacy/orders/${testOrderId}/status`, {
      status: "READY",
    });
    if (res.status !== 200 || res.data.order.status !== "READY") {
      throw new Error(`Expected 200 READY, got ${res.status}`);
    }
  });

  // 10. Patient Telemetry Verification (GET /api/orders/:id)
  await assertTest("GET /api/orders/:id -> Patient Telemetry Sees READY Status & Pickup Token", async () => {
    const res = await request("GET", `/api/orders/${testOrderId}`);
    if (res.status !== 200 || res.data.order.status !== "READY" || !res.data.order.pickupToken) {
      throw new Error(`Expected 200 READY with pickup token, got ${res.status}`);
    }
  });

  // 11. Pharmacy Dispenses Order (PATCH /api/pharmacy/orders/:id/status -> DISPENSED)
  await assertTest("PATCH /api/pharmacy/orders/:id/status -> Pharmacy Dispenses (status: DISPENSED)", async () => {
    const res = await request("PATCH", `/api/pharmacy/orders/${testOrderId}/status`, {
      status: "DISPENSED",
    });
    if (res.status !== 200 || res.data.order.status !== "DISPENSED") {
      throw new Error(`Expected 200 DISPENSED, got ${res.status}`);
    }
  });

  // 12. Cleanup Finished Appointment and Order
  await assertTest("DELETE /api/appointments/:id & DELETE /api/orders/:id -> Cleanup Test Artifacts", async () => {
    await request("DELETE", `/api/appointments/${testAptId}`);
    await request("DELETE", `/api/orders/${testOrderId}`);
  });

  // 13. Dedicated Admin Authentication (admin.pulse@gmail.com)
  let adminToken = null;
  await assertTest("POST /api/admin/login -> Dedicated Admin Login (admin.pulse@gmail.com)", async () => {
    const res = await request("POST", "/api/admin/login", {
      email: "admin.pulse@gmail.com",
      password: "admin123",
    });
    if (res.status !== 200 || !res.data.admin || res.data.admin.role !== "ADMIN" || !res.data.token) {
      throw new Error(`Expected 200 ADMIN with token, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
    adminToken = res.data.token;
  });

  // 14. Protected Admin API with JWT (GET /api/admin/users)
  await assertTest("GET /api/admin/users -> Admin Token Authorizes Governance Endpoint", async () => {
    const res = await request("GET", "/api/admin/users", null, adminToken);
    if (res.status !== 200 || !Array.isArray(res.data.users)) {
      throw new Error(`Expected 200 array, got ${res.status}`);
    }
  });

  // 15. Secure Backend AI Proxy
  await assertTest("POST /api/ai/chat -> Secure Server-Side Gemini Chat Proxy", async () => {
    const res = await request("POST", "/api/ai/chat", {
      query: "Can Cefixime be taken with food?",
      language: "en",
    });
    if (res.status !== 200 || !res.data.text) {
      throw new Error(`Expected 200 AI response, got ${res.status}`);
    }
  });

  console.log("\n==================================================");
  console.log(`🎉 TEST SUMMARY: ${passed} / ${total} TESTS PASSED!`);
  console.log("==================================================\n");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

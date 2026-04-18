
import { updateEmployee } from "../src/controllers/managerEmployeeController.js";
import { pool } from "../src/config/db.js";

// Mock req and res with the problematic "null" strings
const req = {
  params: { employee_id: "1001" },
  body: {
    department_id: "null", // Should become null
    first_name: "null",    // Should become "null" (as a string, which is fine for varchar)
    last_name: "null",
    nic: "123456789X",     // Use a valid unique NIC to avoid duplication error
    email: "null@test.com",
    phone: "null",
    status: "ACTIVE",
    salary_configuration: {
      salary_type: "null", // Should become "MONTHLY" (fallback)
      basic_rate: "null",  // Should become 0 (fallback)
      is_epf_eligible: 0,
      effective_date: "null" // Should become today's date (fallback)
    }
  }
};

const res = {
  status: function(s) { this.statusCode = s; return this; },
  json: function(j) { console.log("Response Status:", this.statusCode || 200); console.log("Response Body:", JSON.stringify(j, null, 2)); }
};

async function test() {
  try {
    await updateEmployee(req, res);
  } catch (err) {
    console.error("Test Script Error:", err);
  } finally {
    process.exit();
  }
}

test();

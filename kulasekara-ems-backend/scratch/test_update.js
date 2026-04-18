
import { updateEmployee } from "../src/controllers/managerEmployeeController.js";
import { pool } from "../src/config/db.js";

// Mock req and res
const req = {
  params: { employee_id: "1001" },
  body: {
    department_id: "1",
    first_name: "Test",
    last_name: "User",
    nic: "123456789V",
    email: "test@example.com",
    phone: "0112233445",
    status: "RESIGNED", // Testing status update
    salary_configuration: {
      salary_type: "MONTHLY",
      basic_rate: "50000",
      is_epf_eligible: 1,
      effective_date: "2026-01-01"
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


import { updateEmployee } from "../src/controllers/managerEmployeeController.js";
import { pool } from "../src/config/db.js";

// Mock req and res with NULL values in salary configuration
const req = {
  params: { employee_id: "1001" },
  body: {
    department_id: "1",
    first_name: "Test",
    last_name: "User",
    nic: "123456789V",
    email: "test@example.com",
    phone: "0112233445",
    status: "ACTIVE",
    salary_configuration: {
      salary_type: "null", // From String(null)
      basic_rate: 0,       // From Number(null)
      is_epf_eligible: 0,
      effective_date: "null" // From String(null)
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


import { updateEmployee } from "../src/controllers/managerEmployeeController.js";
import { pool } from "../src/config/db.js";

// Mock req and res with empty salary configuration
const req = {
  params: { employee_id: "1005" },
  body: {
    status: "ACTIVE",
    salary_configuration: {} // Empty object
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

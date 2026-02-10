// src/pages/manager/employees/EmployeeManagement.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import {
  createEmployeeApi,
  deactivateEmployeeApi,
  getDepartmentsApi,
  getEmployeesApi,
  updateEmployeeApi,
} from "../../../services/managerEmployeeService";

/**
 * ✅ Employee table:
 * employee(employee_id, department_id, first_name, last_name, nic, email, phone, status, created_at)
 *
 * ✅ Salary configurations table:
 * salary_configurations(config_id, employee_id, salary_type, basic_rate, is_epf_eligible, effective_date)
 */





function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);

  // eslint-disable-next-line no-unused-vars
  const [departments, setDepartments] = useState([]);

  const [selectedEmpId, setSelectedEmpId] = useState(
    null
  );

  const [search, setSearch] = useState("");

  // View/Edit/Add modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  // Remove modal
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removeReason, setRemoveReason] = useState("");

  // Credentials modal
  const [credsOpen, setCredsOpen] = useState(false);
  const [newCreds, setNewCreds] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await getDepartmentsApi();
        setDepartments(Array.isArray(d) ? d : d.departments || []);
      } catch (e) {
        setDepartments([]);
      }

      try {
        const emps = await getEmployeesApi();
        setEmployees(Array.isArray(emps) ? emps : emps.employees || []);
      } catch (e) { }
    })();
  }, []);

  const deptMap = useMemo(() => {
    const m = new Map();
    (departments || []).forEach((d) => m.set(Number(d.id), d));
    return m;
  }, [departments]);

  const getDeptName = useCallback(
    (department_id) => {
      const d = deptMap.get(Number(department_id));
      return d?.name || "-";
    },
    [deptMap]
  );

  const fullName = (e) => {
    const fn = (e?.first_name || "").trim();
    const ln = (e?.last_name || "").trim();
    const n = `${fn} ${ln}`.trim();
    return n || "-";
  };

  const selectedEmployee = useMemo(() => {
    return (
      employees.find((e) => String(e.employee_id) === String(selectedEmpId)) ||
      employees[0] ||
      null
    );
  }, [employees, selectedEmpId]);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;

    return employees.filter((e) => {
      return (
        String(e.employee_id || "").toLowerCase().includes(q) ||
        String(e.department_id || "").toLowerCase().includes(q) ||
        getDeptName(e.department_id).toLowerCase().includes(q) ||
        (e.first_name || "").toLowerCase().includes(q) ||
        (e.last_name || "").toLowerCase().includes(q) ||
        fullName(e).toLowerCase().includes(q) ||
        (e.status || "").toLowerCase().includes(q) ||
        (e.email || "").toLowerCase().includes(q) ||
        (e.phone || "").toLowerCase().includes(q) ||
        (e.nic || "").toLowerCase().includes(q)
      );
    });
  }, [employees, search, getDeptName]);

  const openModal = (emp, edit = false) => {
    setFormData({ ...emp });
    setIsEditMode(edit);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    const todayISO = new Date().toISOString().slice(0, 10);
    const initial = {
      employee_id: "",
      department_id: departments?.[0]?.id || 1,
      first_name: "",
      last_name: "-",
      nic: "",
      email: "",
      phone: "",
      status: "ACTIVE",
      created_at: new Date().toISOString().slice(0, 19).replace("T", " "),

      // ✅ Salary config defaults
      salary_type: "MONTHLY", // MONTHLY | DAILY
      basic_rate: "",
      is_epf_eligible: 1, // 1/0
      effective_date: todayISO,
    };

    setFormData(initial);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setFormData({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // ✅ checkbox support
    if (type === "checkbox") {
      setFormData((p) => ({ ...p, [name]: checked ? 1 : 0 }));
      return;
    }

    setFormData((p) => ({ ...p, [name]: value }));
  };

  const closeCreds = () => {
    setCredsOpen(false);
    setNewCreds(null);
  };

  const moneyText = (v) => {
    if (v === null || v === undefined || v === "") return "-";
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // ✅ Save (create or UI-edit)
  const handleSave = async () => {
    const isExisting = employees.some(
      (emp) => String(emp.employee_id) === String(formData.employee_id)
    );

    // ---- basic validation (employee) ----
    // ---- basic validation (employee) ----
    if (!String(formData.employee_id || "").trim()) return alert("Please fill Employee ID.");
    if (!String(formData.department_id || "").trim()) return alert("Please select Department.");
    if (!formData.first_name?.trim()) return alert("Please fill First Name.");
    if (!formData.last_name?.trim()) return alert("Please fill Last Name (use '-' if not available).");

    // Validations
    const nicRegex = /^([0-9]{9}[x|X|v|V]|[0-9]{12})$/;
    const phoneRegex = /^0[0-9]{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.nic?.trim()) return alert("Please fill NIC.");
    if (!nicRegex.test(formData.nic.trim())) return alert("Invalid NIC format (Format: 9 digits + V/X or 12 digits).");

    if (!formData.email?.trim()) return alert("Please fill Email.");
    if (!emailRegex.test(formData.email.trim())) return alert("Invalid Email address.");

    if (!formData.phone?.trim()) return alert("Please fill Phone.");
    if (!phoneRegex.test(formData.phone.trim())) return alert("Invalid Phone number (Must be 10 digits starting with 0).");

    // ---- validation (salary configuration) ----
    if (!String(formData.salary_type || "").trim()) return alert("Please select Salary Type.");
    if (formData.basic_rate === "" || formData.basic_rate === null || formData.basic_rate === undefined)
      return alert("Please fill Basic Rate.");
    if (Number.isNaN(Number(formData.basic_rate)) || Number(formData.basic_rate) <= 0)
      return alert("Basic Rate must be a valid number greater than 0.");
    if (!String(formData.effective_date || "").trim())
      return alert("Please select Effective Date.");

    // ✅ If you don’t have update API yet, keep edit as UI-only
    if (isExisting) {
      try {
        const payload = {
          department_id: Number(formData.department_id),
          first_name: String(formData.first_name).trim(),
          last_name: String(formData.last_name || "-").trim(),
          nic: String(formData.nic).trim(),
          email: String(formData.email).trim(),
          phone: String(formData.phone).trim(),
          status: String(formData.status || "ACTIVE").trim(),
          salary_configuration: {
            salary_type: String(formData.salary_type).trim(),
            basic_rate: Number(formData.basic_rate),
            is_epf_eligible: Number(formData.is_epf_eligible) ? 1 : 0,
            effective_date: String(formData.effective_date).trim(),
          },
        };

        const updatedData = await updateEmployeeApi(formData.employee_id, payload);
        const updatedEmp = updatedData.employee;

        // Merge helper for updating list
        setEmployees((prev) =>
          prev.map((emp) =>
            String(emp.employee_id) === String(formData.employee_id)
              ? {
                ...emp,
                ...updatedEmp,
                salary_type: payload.salary_configuration.salary_type,
                basic_rate: payload.salary_configuration.basic_rate,
                is_epf_eligible: payload.salary_configuration.is_epf_eligible,
                effective_date: payload.salary_configuration.effective_date,
              }
              : emp
          )
        );
        setSelectedEmpId(formData.employee_id);
        closeModal();
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err.message ||
          "Failed to update employee";
        alert(msg);
      }
      return;
    }

    // ✅ CREATE via backend (employee + salary configuration)
    const payload = {
      employee_id: String(formData.employee_id).trim(),
      department_id: Number(formData.department_id),
      first_name: String(formData.first_name).trim(),
      last_name: String(formData.last_name || "-").trim(),
      nic: String(formData.nic).trim(),
      email: String(formData.email).trim(),
      phone: String(formData.phone).trim(),
      status: String(formData.status || "ACTIVE").trim(),

      // ✅ salary_configurations table fields (nested)
      salary_configuration: {
        salary_type: String(formData.salary_type).trim(), // MONTHLY | DAILY
        basic_rate: Number(formData.basic_rate),
        is_epf_eligible: Number(formData.is_epf_eligible) ? 1 : 0,
        effective_date: String(formData.effective_date).trim(), // YYYY-MM-DD
      },
    };

    try {
      const data = await createEmployeeApi(payload);

      // ✅ Accept either {employee: {...}, salary_configuration: {...}, credentials: {...}} OR direct employee
      const createdEmp = data?.employee || data;
      const createdSal = data?.salary_configuration || data?.salary_configuration || null;

      const newEmp = {
        employee_id: createdEmp.employee_id ?? payload.employee_id,
        department_id: createdEmp.department_id ?? payload.department_id,
        first_name: createdEmp.first_name ?? payload.first_name,
        last_name: createdEmp.last_name ?? payload.last_name,
        nic: createdEmp.nic ?? payload.nic,
        email: createdEmp.email ?? payload.email,
        phone: createdEmp.phone ?? payload.phone,
        status: createdEmp.status ?? payload.status,
        created_at: createdEmp.created_at ?? formData.created_at,

        // ✅ store salary config on UI object too
        salary_type: createdSal?.salary_type ?? payload.salary_configuration.salary_type,
        basic_rate: createdSal?.basic_rate ?? payload.salary_configuration.basic_rate,
        is_epf_eligible: createdSal?.is_epf_eligible ?? payload.salary_configuration.is_epf_eligible,
        effective_date: createdSal?.effective_date ?? payload.salary_configuration.effective_date,
      };

      setEmployees((prev) => [...prev, newEmp]);
      setSelectedEmpId(newEmp.employee_id);

      // ✅ show credentials if backend returns them
      if (data?.credentials?.username && data?.credentials?.tempPassword) {
        setNewCreds({
          employee_id: newEmp.employee_id,
          username: data.credentials.username,
          tempPassword: data.credentials.tempPassword,
        });
        setCredsOpen(true);
      }

      closeModal();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Failed to create employee";
      alert(msg);
    }
  };

  const openRemoveModal = (emp) => {
    setRemoveTarget(emp);
    setRemoveReason("");
    setIsRemoveOpen(true);
  };

  const closeRemoveModal = () => {
    setIsRemoveOpen(false);
    setRemoveTarget(null);
    setRemoveReason("");
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;

    const reason = removeReason.trim();
    if (!reason) return alert("Please enter the reason.");

    try {
      await deactivateEmployeeApi(removeTarget.employee_id);

      setEmployees((prev) =>
        prev.map((e) =>
          String(e.employee_id) === String(removeTarget.employee_id)
            ? { ...e, status: "INACTIVE" }
            : e
        )
      );

      closeRemoveModal();
      if (
        isModalOpen &&
        String(formData?.employee_id) === String(removeTarget.employee_id)
      ) {
        closeModal();
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Failed to deactivate employee";
      alert(msg);
    }
  };

  return (
    <AppLayout>
      <div style={styles.page}>
        <div style={styles.pageHeader}>
          <div>
            <h2 style={styles.heading}>Employee Management</h2>
            <p style={styles.subheading}>Employee management add or remove</p>
          </div>

          <div style={styles.headerActions}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, name, department, status..."
              style={styles.search}
            />
            <button style={styles.btnPrimary} onClick={openAddModal}>
              + Add Employee
            </button>
          </div>
        </div>

        {/* TOP PROFILE CARD */}
        {selectedEmployee ? (
          <div style={styles.profileCard}>
            <div style={styles.profileLeft}>
              <div style={styles.avatarBlock}>
                {String(selectedEmployee.first_name || "")
                  .trim()
                  .slice(0, 1)
                  .toUpperCase() || "E"}
              </div>

              <div style={{ flex: 1 }}>
                <div style={styles.profileTopRow}>
                  <div>
                    <div style={styles.profileName}>{fullName(selectedEmployee)}</div>
                    <div style={styles.profileMeta}>
                      Department: <strong>{getDeptName(selectedEmployee.department_id)}</strong>
                    </div>
                  </div>

                  <span
                    style={{
                      ...styles.statusPill,
                      ...(selectedEmployee.status === "ACTIVE"
                        ? styles.statusActive
                        : styles.statusInactive),
                    }}
                  >
                    {selectedEmployee.status}
                  </span>
                </div>

                <div style={styles.profileGrid}>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Employee ID</div>
                    <div style={styles.infoValue}>{selectedEmployee.employee_id}</div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>NIC</div>
                    <div style={styles.infoValue}>{selectedEmployee.nic || "-"}</div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Email</div>
                    <div style={styles.infoValue}>{selectedEmployee.email || "-"}</div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Phone</div>
                    <div style={styles.infoValue}>{selectedEmployee.phone || "-"}</div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Created At</div>
                    <div style={styles.infoValue}>{selectedEmployee.created_at || "-"}</div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Department ID</div>
                    <div style={styles.infoValue}>{selectedEmployee.department_id ?? "-"}</div>
                  </div>

                  {/* ✅ Salary config display */}
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Salary Type</div>
                    <div style={styles.infoValue}>{selectedEmployee.salary_type || "-"}</div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Basic Rate</div>
                    <div style={styles.infoValue}>{moneyText(selectedEmployee.basic_rate)}</div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>EPF Eligible</div>
                    <div style={styles.infoValue}>
                      {Number(selectedEmployee.is_epf_eligible) ? "YES" : "NO"}
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Effective Date</div>
                    <div style={styles.infoValue}>{selectedEmployee.effective_date || "-"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.profileActions}>
              <button
                style={styles.btnSecondary}
                onClick={() => openModal(selectedEmployee, false)}
              >
                View
              </button>
              <button
                style={styles.btnPrimary}
                onClick={() => openModal(selectedEmployee, true)}
              >
                Edit
              </button>

              {selectedEmployee.status !== "INACTIVE" && (
                <button
                  style={styles.btnDanger}
                  onClick={() => openRemoveModal(selectedEmployee)}
                  title="Set employee status to INACTIVE"
                >
                  Deactivate
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={styles.emptyTop}>
            No employee selected. Click “Add Employee” to create one.
          </div>
        )}

        {/* LIST CARD */}
        <div style={styles.listCard}>
          <div style={styles.listHeader}>
            <h3 style={styles.listTitle}>Employee List</h3>
            <div style={styles.countPill}>{filteredEmployees.length} employees</div>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((emp) => {
                const isSelected = String(emp.employee_id) === String(selectedEmpId);

                return (
                  <tr
                    key={emp.employee_id}
                    style={{ ...styles.tr, ...(isSelected ? styles.trSelected : {}) }}
                    onClick={() => setSelectedEmpId(emp.employee_id)}
                    title="Click to show this profile on top"
                  >
                    <td style={styles.td}>{emp.employee_id}</td>

                    <td style={styles.tdName}>
                      <div style={styles.nameCell}>
                        <div style={styles.rowAvatar}>
                          {String(emp.first_name || "")
                            .trim()
                            .slice(0, 1)
                            .toUpperCase() || "E"}
                        </div>
                        <div>
                          <div style={styles.rowName}>{fullName(emp)}</div>
                          <div style={styles.rowSub}>{emp.email}</div>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>{getDeptName(emp.department_id)}</td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusSmall,
                          ...(emp.status === "ACTIVE"
                            ? { background: "#dcfce7" }
                            : { background: "#fee2e2" }),
                        }}
                      >
                        {emp.status}
                      </span>
                    </td>

                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <button
                        style={isSelected ? styles.selectBtnActive : styles.selectBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEmpId(emp.employee_id);
                        }}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </button>

                      <button
                        style={styles.smallBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(emp, true);
                        }}
                      >
                        Edit
                      </button>

                      {emp.status !== "INACTIVE" && (
                        <button
                          style={styles.smallBtnDanger}
                          onClick={(e) => {
                            e.stopPropagation();
                            openRemoveModal(emp);
                          }}
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td style={styles.empty} colSpan={5}>
                    No employees found for “{search}”
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* VIEW/EDIT MODAL */}
        {isModalOpen && (
          <div style={styles.modalOverlay} onClick={closeModal}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>
                  {isEditMode ? "Employee Form" : "Employee Details"}
                </h3>
                <button style={styles.iconBtn} onClick={closeModal}>
                  ✕
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.modalProfile}>
                  <div style={styles.bigAvatar}>
                    {String(formData.first_name || "")
                      .trim()
                      .slice(0, 1)
                      .toUpperCase() || "E"}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={styles.modalName}>
                      {fullName(formData)?.trim() !== "-" ? fullName(formData) : "New Employee"}
                    </div>
                    <div style={styles.modalSub}>
                      Department: {getDeptName(formData.department_id)}
                    </div>
                  </div>
                </div>

                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.label}>EMPLOYEE ID</label>
                    {isEditMode ? (
                      <input
                        name="employee_id"
                        value={formData.employee_id || ""}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    ) : (
                      <div style={styles.readValue}>{formData.employee_id || "-"}</div>
                    )}
                  </div>

                  <div>
                    <label style={styles.label}>DEPARTMENT</label>
                    {isEditMode ? (
                      <select
                        name="department_id"
                        value={formData.department_id ?? ""}
                        onChange={handleChange}
                        style={styles.select}
                      >
                        {(departments || []).map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div style={styles.readValue}>{getDeptName(formData.department_id)}</div>
                    )}
                  </div>

                  <div>
                    <label style={styles.label}>FIRST NAME</label>
                    {isEditMode ? (
                      <input
                        name="first_name"
                        value={formData.first_name || ""}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    ) : (
                      <div style={styles.readValue}>{formData.first_name || "-"}</div>
                    )}
                  </div>

                  <div>
                    <label style={styles.label}>LAST NAME</label>
                    {isEditMode ? (
                      <input
                        name="last_name"
                        value={formData.last_name || ""}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    ) : (
                      <div style={styles.readValue}>{formData.last_name || "-"}</div>
                    )}
                  </div>

                  <div>
                    <label style={styles.label}>NIC</label>
                    {isEditMode ? (
                      <input
                        name="nic"
                        value={formData.nic || ""}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    ) : (
                      <div style={styles.readValue}>{formData.nic || "-"}</div>
                    )}
                  </div>

                  <div>
                    <label style={styles.label}>EMAIL</label>
                    {isEditMode ? (
                      <input
                        name="email"
                        value={formData.email || ""}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    ) : (
                      <div style={styles.readValue}>{formData.email || "-"}</div>
                    )}
                  </div>

                  <div>
                    <label style={styles.label}>PHONE</label>
                    {isEditMode ? (
                      <input
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    ) : (
                      <div style={styles.readValue}>{formData.phone || "-"}</div>
                    )}
                  </div>

                  <div>
                    <label style={styles.label}>STATUS</label>
                    {isEditMode ? (
                      <select
                        name="status"
                        value={formData.status || "ACTIVE"}
                        onChange={handleChange}
                        style={styles.select}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="RESIGNED">RESIGNED</option>
                        <option value="TERMINATED">TERMINATED</option>
                      </select>
                    ) : (
                      <div style={styles.readValue}>{formData.status || "-"}</div>
                    )}
                  </div>

                  {/* ✅ NEW: SALARY TYPE */}
                  <div>
                    <label style={styles.label}>SALARY TYPE</label>
                    {isEditMode ? (
                      <select
                        name="salary_type"
                        value={formData.salary_type || "MONTHLY"}
                        onChange={handleChange}
                        style={styles.select}
                      >
                        <option value="MONTHLY">MONTHLY</option>
                        <option value="DAILY">DAILY</option>
                      </select>
                    ) : (
                      <div style={styles.readValue}>{formData.salary_type || "-"}</div>
                    )}
                  </div>

                  {/* ✅ NEW: BASIC RATE */}
                  <div>
                    <label style={styles.label}>BASIC RATE</label>
                    {isEditMode ? (
                      <input
                        name="basic_rate"
                        value={formData.basic_rate ?? ""}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="e.g., 75000 or 2500"
                        inputMode="decimal"
                      />
                    ) : (
                      <div style={styles.readValue}>{moneyText(formData.basic_rate)}</div>
                    )}
                  </div>

                  {/* ✅ NEW: EPF/ETF ELIGIBLE (YES/NO) */}
                  <div>
                    <label style={styles.label}>EPF/ETF ELIGIBLE</label>

                    {isEditMode ? (
                      <select
                        name="is_epf_eligible"
                        value={String(formData.is_epf_eligible ?? 1)}  // keep as "1" or "0"
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, is_epf_eligible: Number(e.target.value) }))
                        }
                        style={styles.select}
                      >
                        <option value="1">YES</option>
                        <option value="0">NO</option>
                      </select>
                    ) : (
                      <div style={styles.readValue}>
                        {Number(formData.is_epf_eligible) === 1 ? "YES" : "NO"}
                      </div>
                    )}
                  </div>


                  {/* ✅ NEW: EFFECTIVE DATE */}
                  <div>
                    <label style={styles.label}>EFFECTIVE DATE</label>
                    {isEditMode ? (
                      <input
                        type="date"
                        name="effective_date"
                        value={formData.effective_date || ""}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    ) : (
                      <div style={styles.readValue}>{formData.effective_date || "-"}</div>
                    )}
                  </div>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button style={styles.btnSecondary} onClick={closeModal}>
                  Close
                </button>
                {isEditMode && (
                  <button style={styles.btnPrimary} onClick={handleSave}>
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ✅ Credentials Modal */}
        {credsOpen && newCreds && (
          <div style={styles.modalOverlay} onClick={closeCreds}>
            <div style={styles.removeModal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>New Employee Credentials</h3>
                <button style={styles.iconBtn} onClick={closeCreds}>
                  ✕
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.removeWarnBox}>
                  Copy these credentials now. This password will not be shown again.
                </div>

                <div style={{ marginTop: "12px" }}>
                  <label style={styles.label}>USERNAME</label>
                  <div style={styles.readValue}>{newCreds.username}</div>
                </div>

                <div style={{ marginTop: "12px" }}>
                  <label style={styles.label}>TEMP PASSWORD</label>
                  <div style={styles.readValue}>{newCreds.tempPassword}</div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
                  <button
                    style={{ ...styles.btnSecondary, flex: 1 }}
                    onClick={() => {
                      navigator.clipboard.writeText(newCreds.username);
                      alert("Username copied!");
                    }}
                  >
                    Copy Username
                  </button>
                  <button
                    style={{ ...styles.btnPrimary, flex: 1 }}
                    onClick={() => {
                      navigator.clipboard.writeText(newCreds.tempPassword);
                      alert("Password copied!");
                    }}
                  >
                    Copy Password
                  </button>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button style={styles.btnPrimary} onClick={closeCreds}>
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ REMOVE CONFIRMATION MODAL */}
        {isRemoveOpen && removeTarget && (
          <div style={styles.modalOverlay} onClick={closeRemoveModal}>
            <div style={styles.removeModal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Deactivate Employee</h3>
                <button style={styles.iconBtn} onClick={closeRemoveModal}>
                  ✕
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.removeWarnBox}>
                  You are about to deactivate <strong>{fullName(removeTarget)}</strong> (ID:{" "}
                  <strong>{removeTarget.employee_id}</strong>). The login will be disabled.
                </div>

                <div style={{ marginTop: "12px" }}>
                  <label style={styles.label}>REASON (Required)</label>
                  <textarea
                    value={removeReason}
                    onChange={(e) => setRemoveReason(e.target.value)}
                    style={styles.textarea}
                    placeholder="Example: Left company / Duplicate account / Wrong registration..."
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button style={styles.btnSecondary} onClick={closeRemoveModal}>
                  Cancel
                </button>
                <button style={styles.btnDanger} onClick={confirmRemove}>
                  Confirm Deactivate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default EmployeeManagement;

/* ===========================
   CLEAN WHITE/GRAY DESIGN
   =========================== */
const styles = {
  page: { padding: "8px" },
  pageHeader: {
    padding: "24px 32px",
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(74, 124, 78, 0.1)",
    borderRadius: 20,
    boxShadow: "0 8px 24px rgba(74, 124, 78, 0.08)",
  },
  heading: { margin: 0, color: "#2c5530", fontSize: "28px", fontWeight: 700, letterSpacing: "-0.5px" },
  subheading: { margin: "6px 0 0 0", color: "#6b7280", fontSize: "14px", fontWeight: 500 },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    minWidth: "360px",
    justifyContent: "flex-end",
  },
  search: {
    width: "320px",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "2px solid rgba(229, 231, 235, 0.5)",
    outline: "none",
    background: "#f9fafb",
    fontSize: "14px",
    transition: "all 0.2s ease",
  },

  profileCard: {
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(74, 124, 78, 0.1)",
    borderRadius: "18px",
    padding: "24px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    boxShadow: "0 8px 24px rgba(74, 124, 78, 0.08)",
    marginBottom: "20px",
  },
  profileLeft: { display: "flex", gap: "14px", flex: 1 },
  avatarBlock: {
    width: "100px",
    height: "100px",
    borderRadius: "20px",
    border: "1px solid rgba(74, 124, 78, 0.1)",
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "32px",
    color: "#ffffff",
    boxShadow: "0 8px 24px rgba(74, 124, 78, 0.2)",
  },

  bigAvatar: {
    width: "64px",
    height: "64px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 1000,
    fontSize: "22px",
    color: "#0f172a",
  },

  profileTopRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "10px",
  },
  profileName: { fontSize: "16px", fontWeight: 900, color: "#0f172a" },
  profileMeta: { marginTop: "3px", color: "#64748b", fontSize: "13px" },

  statusPill: {
    fontSize: "12px",
    fontWeight: 800,
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },
  statusActive: { background: "#dcfce7", color: "#166534" },
  statusInactive: { background: "#fee2e2", color: "#991b1b" },

  profileGrid: {
    marginTop: "12px",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px",
  },
  infoItem: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "10px",
  },
  infoLabel: {
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  infoValue: { marginTop: "4px", color: "#0f172a", fontWeight: 800, fontSize: "13px" },

  profileActions: { display: "flex", gap: "10px", flexWrap: "wrap" },

  emptyTop: {
    background: "rgba(255, 255, 255, 0.8)",
    border: "1px dashed rgba(74, 124, 78, 0.3)",
    borderRadius: "14px",
    padding: "16px 20px",
    color: "#6b7280",
    marginBottom: "14px",
    textAlign: "center",
    fontWeight: 500,
  },

  listCard: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(74, 124, 78, 0.1)",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(74, 124, 78, 0.08)",
  },
  listHeader: {
    padding: "14px 16px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listTitle: { margin: 0, color: "#0f172a", fontSize: "15px", fontWeight: 900 },
  countPill: {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
    color: "#334155",
  },

  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "16px 20px",
    fontSize: "13px",
    color: "#4a7c4e",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    background: "rgba(74, 124, 78, 0.04)",
    borderBottom: "1px solid rgba(74, 124, 78, 0.1)",
  },
  tr: {
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  trSelected: { background: "rgba(74, 124, 78, 0.08)" },
  td: {
    padding: "16px 20px",
    borderBottom: "1px solid rgba(74, 124, 78, 0.1)",
    color: "#1f2937",
    fontSize: "14px",
    fontWeight: 500,
  },
  tdName: { padding: "16px 20px", borderBottom: "1px solid rgba(74, 124, 78, 0.1)" },
  nameCell: { display: "flex", alignItems: "center", gap: "10px" },
  rowAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "12px",
    border: "1px solid rgba(74, 124, 78, 0.1)",
    background: "rgba(74, 124, 78, 0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: "#2c5530",
  },
  rowName: { fontWeight: 700, color: "#1f2937", fontSize: "14px" },
  rowSub: { color: "#6b7280", fontSize: "13px", marginTop: "2px" },

  statusSmall: {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
    border: "1px solid rgba(74, 124, 78, 0.2)",
  },

  selectBtn: {
    background: "#ffffff",
    border: "1px solid rgba(74, 124, 78, 0.2)",
    borderRadius: "10px",
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: 600,
    color: "#2c5530",
    marginRight: "8px",
    transition: "all 0.2s ease",
  },
  selectBtnActive: {
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
    border: "none",
    borderRadius: "10px",
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: 600,
    color: "#ffffff",
    marginRight: "8px",
    boxShadow: "0 4px 12px rgba(74, 124, 78, 0.2)",
  },

  smallBtn: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 900,
    color: "#0f172a",
    marginRight: "8px",
  },
  smallBtnDanger: {
    background: "#fff",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 900,
    color: "#991b1b",
  },

  empty: { padding: "16px", color: "#64748b", textAlign: "center" },

  btnPrimary: {
    background: "linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%)",
    color: "#fff",
    border: "none",
    padding: "10px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 900,
    boxShadow: "0 4px 12px rgba(74, 124, 78, 0.2)",
  },
  btnSecondary: {
    background: "rgba(255, 255, 255, 0.8)",
    color: "#2c5530",
    border: "1px solid rgba(74, 124, 78, 0.2)",
    padding: "10px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 600,
    backdropFilter: "blur(4px)",
  },
  btnDanger: {
    background: "#fff",
    color: "#991b1b",
    border: "1px solid #fecaca",
    padding: "10px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 900,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.40)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    zIndex: 1000,
  },
  modal: {
    width: "min(820px, 100%)",
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid rgba(74, 124, 78, 0.2)",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(74, 124, 78, 0.18)",
  },

  removeModal: {
    width: "min(620px, 100%)",
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
  },

  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 24px",
    borderBottom: "1px solid rgba(74, 124, 78, 0.1)",
    background: "rgba(74, 124, 78, 0.04)",
  },
  modalTitle: { margin: 0, fontSize: "15px", fontWeight: 900, color: "#0f172a" },
  iconBtn: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 900,
  },
  modalBody: { padding: "16px" },

  modalProfile: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    padding: "16px",
    borderRadius: "14px",
    background: "rgba(74, 124, 78, 0.05)",
    border: "1px solid rgba(74, 124, 78, 0.1)",
    marginBottom: "20px",
  },
  modalName: { fontWeight: 700, color: "#2c5530", fontSize: "16px" },
  modalSub: { marginTop: "2px", color: "#6b7280", fontSize: "13px", fontWeight: 500 },

  removeWarnBox: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "12px",
    padding: "12px",
    color: "#92400e",
    fontWeight: 700,
    lineHeight: 1.5,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },

  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: 900,
    color: "#64748b",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(74, 124, 78, 0.2)",
    outline: "none",
    background: "#fff",
    transition: "border 0.2s ease",
    fontSize: "14px",
    color: "#2c5530",
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(74, 124, 78, 0.2)",
    outline: "none",
    background: "#fff",
    fontSize: "14px",
    color: "#2c5530",
  },
  readValue: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(74, 124, 78, 0.1)",
    background: "rgba(74, 124, 78, 0.04)",
    color: "#2c5530",
    fontWeight: 600,
    fontSize: "14px",
  },

  textarea: {
    width: "100%",
    minHeight: "110px",
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    background: "#fff",
  },

  modalActions: {
    padding: "18px 24px",
    borderTop: "1px solid rgba(74, 124, 78, 0.1)",
    background: "#ffffff",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
  },

  // ✅ EPF toggle row
  switchRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(74, 124, 78, 0.2)",
    background: "#fff",
  },
  switchText: { fontWeight: 700, color: "#2c5530" },
};

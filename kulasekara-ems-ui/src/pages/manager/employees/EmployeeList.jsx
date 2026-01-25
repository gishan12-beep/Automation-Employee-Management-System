// src/pages/manager/employees/EmployeeManagement.jsx
import React, { useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import {
  createEmployeeApi,
  deactivateEmployeeApi,
} from "../../../services/managerEmployeeService";

const dummyEmployees = [
  {
    id: 1,
    name: "Kamal Perera",
    role: "Employee",
    department: "Production",
    email: "kamalperera@gmail.com",
    phone: "0711234567",
    nic: "200012345678",
    status: "Active",
    joinDate: "2025-02-10",
    salaryType: "Monthly",
    image: "https://via.placeholder.com/140",
    removedReason: "",
    removedAt: "",
  },
  {
    id: 2,
    name: "Nimal Silva",
    role: "Accountant",
    department: "Accounts",
    email: "nimalsilva@gmail.com",
    phone: "0719876543",
    nic: "199912345678",
    status: "Active",
    joinDate: "2024-11-01",
    salaryType: "Monthly",
    image: "https://via.placeholder.com/140",
    removedReason: "",
    removedAt: "",
  },
];

function EmployeeManagement() {
  const [employees, setEmployees] = useState(dummyEmployees);
  const [selectedEmpId, setSelectedEmpId] = useState(dummyEmployees?.[0]?.id || null);

  const [search, setSearch] = useState("");

  // View/Edit/Add modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState("");

  // ✅ Remove modal (confirmation + reason)
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removeReason, setRemoveReason] = useState("");

  // ✅ Credentials modal (shows username + temp password ONCE)
  const [credsOpen, setCredsOpen] = useState(false);
  const [newCreds, setNewCreds] = useState(null); // { employee_id, username, tempPassword }

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === selectedEmpId) || employees[0],
    [employees, selectedEmpId]
  );

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;

    return employees.filter((e) => {
      return (
        String(e.id).includes(q) ||
        (e.name || "").toLowerCase().includes(q) ||
        (e.role || "").toLowerCase().includes(q) ||
        (e.department || "").toLowerCase().includes(q) ||
        (e.status || "").toLowerCase().includes(q) ||
        (e.salaryType || "").toLowerCase().includes(q) ||
        (e.email || "").toLowerCase().includes(q) ||
        (e.phone || "").toLowerCase().includes(q) ||
        (e.nic || "").toLowerCase().includes(q)
      );
    });
  }, [employees, search]);

  const openModal = (emp, edit = false) => {
    setFormData(emp);
    setImagePreview(emp?.image || "");
    setIsEditMode(edit);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    const nextId = employees.length > 0 ? Math.max(...employees.map((e) => Number(e.id))) + 1 : 1;

    const initial = {
      id: nextId,
      name: "",
      role: "",
      department: "",
      email: "",
      phone: "",
      nic: "",
      status: "Active",
      joinDate: "",
      salaryType: "Monthly",
      image: "",
      removedReason: "",
      removedAt: "",
    };

    setFormData(initial);
    setImagePreview("");
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setFormData({});
    setImagePreview("");
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setFormData((prev) => ({ ...prev, image: url }));
  };

  const closeCreds = () => {
    setCredsOpen(false);
    setNewCreds(null);
  };

  // ✅ Add Save -> CALL BACKEND (create employee + generate password)
  const handleSave = async () => {
    // CREATE only via API (edit updates UI only until you create update API)
    const isExisting = employees.some((emp) => emp.id === formData.id);

    if (!String(formData.id || "").trim()) {
      alert("Please fill Employee ID.");
      return;
    }
    if (!formData.name?.trim()) {
      alert("Please fill Name.");
      return;
    }
    if (!formData.nic?.trim()) {
      alert("Please fill NIC.");
      return;
    }
    if (!formData.email?.trim()) {
      alert("Please fill Email.");
      return;
    }
    if (!formData.phone?.trim()) {
      alert("Please fill Phone.");
      return;
    }

    if (isExisting) {
      setEmployees((prev) => prev.map((emp) => (emp.id === formData.id ? formData : emp)));
      setSelectedEmpId(formData.id);
      closeModal();
      return;
    }

    // backend expects: employee_id, first_name, last_name, nic, email, phone
    const parts = formData.name.trim().split(" ");
    const first_name = parts[0];
    const last_name = parts.slice(1).join(" ") || "-";

    const payload = {
      employee_id: String(formData.id).trim(),
      first_name,
      last_name,
      nic: String(formData.nic).trim(),
      email: formData.email.trim(),
      phone: String(formData.phone).trim(),
    };

    try {
      const data = await createEmployeeApi(payload);

      const newEmpUi = {
        id: data.employee.employee_id,
        name: `${data.employee.first_name} ${data.employee.last_name}`.trim(),
        role: formData.role || "Employee",
        department: formData.department || "Production",
        email: data.employee.email,
        phone: data.employee.phone,
        nic: data.employee.nic,
        status: "Active",
        joinDate: formData.joinDate || "",
        salaryType: formData.salaryType || "Monthly",
        image: formData.image || "https://via.placeholder.com/140",
        removedReason: "",
        removedAt: "",
      };

      setEmployees((prev) => [...prev, newEmpUi]);
      setSelectedEmpId(newEmpUi.id);

      setNewCreds({
        employee_id: data.employee.employee_id,
        username: data.credentials.username,
        tempPassword: data.credentials.tempPassword,
      });
      setCredsOpen(true);

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

  // ✅ Open remove modal
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

  // ✅ Confirm remove -> CALL BACKEND deactivate
  const confirmRemove = async () => {
    if (!removeTarget) return;

    const reason = removeReason.trim();
    if (!reason) {
      alert("Please enter the removal reason.");
      return;
    }

    try {
      await deactivateEmployeeApi(removeTarget.id);

      const removedAt = new Date().toISOString();

      setEmployees((prev) =>
        prev.map((e) =>
          e.id === removeTarget.id
            ? {
                ...e,
                status: "Removed",
                removedReason: reason,
                removedAt,
              }
            : e
        )
      );

      closeRemoveModal();
      if (isModalOpen && formData?.id === removeTarget.id) closeModal();
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
            <p style={styles.subheading}>
              Selected employee profile is shown at the top. Search and manage employees below.
            </p>
          </div>

          <div style={styles.headerActions}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, name, department, role, status..."
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
              <img src={selectedEmployee.image} alt="Employee" style={styles.profileImage} />
              <div style={{ flex: 1 }}>
                <div style={styles.profileTopRow}>
                  <div>
                    <div style={styles.profileName}>{selectedEmployee.name}</div>
                    <div style={styles.profileMeta}>
                      {selectedEmployee.role} • {selectedEmployee.department}
                    </div>
                  </div>

                  <span
                    style={{
                      ...styles.statusPill,
                      ...(selectedEmployee.status === "Active"
                        ? styles.statusActive
                        : selectedEmployee.status === "Removed"
                        ? styles.statusRemoved
                        : styles.statusInactive),
                    }}
                  >
                    {selectedEmployee.status}
                  </span>
                </div>

                <div style={styles.profileGrid}>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Employee ID</div>
                    <div style={styles.infoValue}>{selectedEmployee.id}</div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>NIC</div>
                    <div style={styles.infoValue}>{selectedEmployee.nic || "-"}</div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Salary Type</div>
                    <div style={styles.infoValue}>{selectedEmployee.salaryType}</div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Join Date</div>
                    <div style={styles.infoValue}>{selectedEmployee.joinDate || "-"}</div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Phone</div>
                    <div style={styles.infoValue}>{selectedEmployee.phone || "-"}</div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Email</div>
                    <div style={styles.infoValue}>{selectedEmployee.email || "-"}</div>
                  </div>
                </div>

                {selectedEmployee.status === "Removed" && (
                  <div style={styles.removedNote}>
                    <div style={styles.removedTitle}>Removed reason</div>
                    <div style={styles.removedText}>{selectedEmployee.removedReason || "-"}</div>
                  </div>
                )}
              </div>
            </div>

            <div style={styles.profileActions}>
              <button style={styles.btnSecondary} onClick={() => openModal(selectedEmployee, false)}>
                View
              </button>
              <button style={styles.btnPrimary} onClick={() => openModal(selectedEmployee, true)}>
                Edit
              </button>

              {selectedEmployee.status !== "Removed" && (
                <button
                  style={styles.btnDanger}
                  onClick={() => openRemoveModal(selectedEmployee)}
                  title="Remove employee"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={styles.emptyTop}>No employee selected. Click “Add Employee” to create one.</div>
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
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((emp) => {
                const isSelected = emp.id === selectedEmpId;

                return (
                  <tr
                    key={emp.id}
                    style={{ ...styles.tr, ...(isSelected ? styles.trSelected : {}) }}
                    onClick={() => setSelectedEmpId(emp.id)}
                    title="Click to show this profile on top"
                  >
                    <td style={styles.td}>{emp.id}</td>

                    <td style={styles.tdName}>
                      <div style={styles.nameCell}>
                        <img src={emp.image} alt="" style={styles.rowAvatar} />
                        <div>
                          <div style={styles.rowName}>{emp.name}</div>
                          <div style={styles.rowSub}>{emp.email}</div>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>{emp.role}</td>
                    <td style={styles.td}>{emp.department}</td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusSmall,
                          ...(emp.status === "Active"
                            ? { background: "#dcfce7" }
                            : emp.status === "Removed"
                            ? { background: "#fef3c7" }
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
                          setSelectedEmpId(emp.id);
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

                      {emp.status !== "Removed" && (
                        <button
                          style={styles.smallBtnDanger}
                          onClick={(e) => {
                            e.stopPropagation();
                            openRemoveModal(emp);
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td style={styles.empty} colSpan={6}>
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
                  <img
                    src={imagePreview || formData.image || "https://via.placeholder.com/140"}
                    alt="profile"
                    style={styles.modalImg}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={styles.modalName}>
                      {formData.name?.trim() ? formData.name : "New Employee"}
                    </div>
                    <div style={styles.modalSub}>
                      {(formData.role || "Role")} • {(formData.department || "Department")}
                    </div>

                    {isEditMode && (
                      <div style={{ marginTop: "10px" }}>
                        <label style={styles.label}>PROFILE IMAGE</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFile}
                          style={styles.fileInput}
                        />
                        <div style={styles.fileHint}>PNG / JPG recommended</div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.label}>EMPLOYEE ID</label>
                    {isEditMode ? (
                      <input
                        name="id"
                        value={formData.id || ""}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    ) : (
                      <div style={styles.readValue}>{formData.id || "-"}</div>
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
                    <label style={styles.label}>NAME</label>
                    {isEditMode ? (
                      <input
                        name="name"
                        value={formData.name || ""}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    ) : (
                      <div style={styles.readValue}>{formData.name || "-"}</div>
                    )}
                  </div>

                  <div>
                    <label style={styles.label}>ROLE</label>
                    {isEditMode ? (
                      <input
                        name="role"
                        value={formData.role || ""}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    ) : (
                      <div style={styles.readValue}>{formData.role || "-"}</div>
                    )}
                  </div>

                  <div>
                    <label style={styles.label}>DEPARTMENT</label>
                    {isEditMode ? (
                      <input
                        name="department"
                        value={formData.department || ""}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    ) : (
                      <div style={styles.readValue}>{formData.department || "-"}</div>
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
                        value={formData.status || "Active"}
                        onChange={handleChange}
                        style={styles.select}
                      >
                        <option value="Active">Active</option>
                        <option value="Resigned">Resigned</option>
                        <option value="Removed">Removed</option>
                      </select>
                    ) : (
                      <div style={styles.readValue}>{formData.status || "-"}</div>
                    )}
                  </div>

                  <div>
                    <label style={styles.label}>SALARY TYPE</label>
                    {isEditMode ? (
                      <select
                        name="salaryType"
                        value={formData.salaryType || "Monthly"}
                        onChange={handleChange}
                        style={styles.select}
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    ) : (
                      <div style={styles.readValue}>{formData.salaryType || "-"}</div>
                    )}
                  </div>

                  <div>
                    <label style={styles.label}>JOIN DATE</label>
                    {isEditMode ? (
                      <input
                        type="date"
                        name="joinDate"
                        value={formData.joinDate || ""}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    ) : (
                      <div style={styles.readValue}>{formData.joinDate || "-"}</div>
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
                    style={styles.btnSecondary}
                    onClick={() => navigator.clipboard.writeText(newCreds.username)}
                  >
                    Copy Username
                  </button>
                  <button
                    style={styles.btnPrimary}
                    onClick={() => navigator.clipboard.writeText(newCreds.tempPassword)}
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
                <h3 style={styles.modalTitle}>Remove Employee</h3>
                <button style={styles.iconBtn} onClick={closeRemoveModal}>
                  ✕
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.removeWarnBox}>
                  You are about to remove <strong>{removeTarget.name}</strong> (ID:{" "}
                  <strong>{removeTarget.id}</strong>). The employee login will be disabled.
                </div>

                <div style={{ marginTop: "12px" }}>
                  <label style={styles.label}>REMOVAL REASON (Required)</label>
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
                  Confirm Remove
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
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "14px",
    marginBottom: "14px",
  },
  heading: { margin: 0, color: "#0f172a", fontSize: "20px", fontWeight: 800 },
  subheading: { margin: "6px 0 0 0", color: "#64748b", fontSize: "13px" },

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
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    outline: "none",
    background: "#fff",
  },

  profileCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "16px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
    marginBottom: "14px",
  },
  profileLeft: { display: "flex", gap: "14px", flex: 1 },
  profileImage: {
    width: "92px",
    height: "92px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    objectFit: "cover",
    background: "#f8fafc",
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
  statusRemoved: { background: "#fef3c7", color: "#92400e" },

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

  removedNote: {
    marginTop: "12px",
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "12px",
    padding: "12px",
  },
  removedTitle: { fontWeight: 900, color: "#92400e", fontSize: "12px", textTransform: "uppercase" },
  removedText: { marginTop: "6px", color: "#92400e", fontWeight: 700, fontSize: "13px" },

  profileActions: { display: "flex", gap: "10px", flexWrap: "wrap" },

  emptyTop: {
    background: "#fff",
    border: "1px dashed #cbd5e1",
    borderRadius: "14px",
    padding: "14px 16px",
    color: "#64748b",
    marginBottom: "14px",
  },

  listCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
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
    padding: "12px 16px",
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  tr: { cursor: "pointer" },
  trSelected: { background: "#f1f5f9" },
  td: { padding: "12px 16px", borderBottom: "1px solid #e2e8f0", color: "#0f172a" },
  tdName: { padding: "12px 16px", borderBottom: "1px solid #e2e8f0" },
  nameCell: { display: "flex", alignItems: "center", gap: "10px" },
  rowAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    objectFit: "cover",
  },
  rowName: { fontWeight: 900, color: "#0f172a", fontSize: "13.5px" },
  rowSub: { color: "#64748b", fontSize: "12px", marginTop: "2px" },

  statusSmall: {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
    border: "1px solid #e2e8f0",
  },

  selectBtn: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 900,
    color: "#0f172a",
    marginRight: "8px",
  },
  selectBtnActive: {
    background: "#0f172a",
    border: "1px solid #0f172a",
    borderRadius: "10px",
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 900,
    color: "#ffffff",
    marginRight: "8px",
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
    background: "#0f172a",
    color: "#fff",
    border: "1px solid #0f172a",
    padding: "10px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 900,
  },
  btnSecondary: {
    background: "#f8fafc",
    color: "#0f172a",
    border: "1px solid #e2e8f0",
    padding: "10px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 900,
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
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
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
    padding: "14px 16px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
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
    gap: "12px",
    padding: "12px",
    borderRadius: "14px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    marginBottom: "14px",
  },
  modalImg: {
    width: "64px",
    height: "64px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    objectFit: "cover",
  },
  modalName: { fontWeight: 1000, color: "#0f172a" },
  modalSub: { marginTop: "2px", color: "#64748b", fontSize: "12.5px", fontWeight: 700 },

  removeWarnBox: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "12px",
    padding: "12px",
    color: "#92400e",
    fontWeight: 700,
    lineHeight: 1.5,
  },

  fileInput: {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "8px 10px",
    background: "#fff",
  },
  fileHint: { marginTop: "6px", color: "#64748b", fontSize: "12px" },

  formGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" },

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
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    outline: "none",
    background: "#fff",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    outline: "none",
    background: "#fff",
  },
  readValue: {
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#0f172a",
    fontWeight: 800,
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
    padding: "14px 16px",
    borderTop: "1px solid #e2e8f0",
    background: "#ffffff",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    flexWrap: "wrap",
  },
};

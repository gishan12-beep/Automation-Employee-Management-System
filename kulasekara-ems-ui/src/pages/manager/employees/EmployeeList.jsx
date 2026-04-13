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
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Eye, 
  Trash2, 
  MoreVertical,
  Briefcase,
  User,
  ShieldCheck,
  ChevronRight,
  Filter,
  X,
  Info
} from "lucide-react";

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

  const [selectedEmpId, setSelectedEmpId] = useState(null);
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

  // Dropdown state
  const [menuOpenId, setMenuOpenId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".action-dropdown-trigger") && !event.target.closest(".action-dropdown-menu")) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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
      salary_type: "MONTHLY",
      basic_rate: "",
      is_epf_eligible: 1,
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

  const handleSave = async () => {
    const isExisting = employees.some((emp) => String(emp.employee_id) === String(formData.employee_id));

    if (!String(formData.employee_id || "").trim()) return alert("Please fill Employee ID.");
    if (!String(formData.department_id || "").trim()) return alert("Please select Department.");
    if (!formData.first_name?.trim()) return alert("Please fill First Name.");
    if (!formData.last_name?.trim()) return alert("Please fill Last Name.");

    const nicRegex = /^([0-9]{9}[x|X|v|V]|[0-9]{12})$/;
    const phoneRegex = /^0[0-9]{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.nic?.trim() || !nicRegex.test(formData.nic.trim())) return alert("Invalid NIC format.");
    if (!formData.email?.trim() || !emailRegex.test(formData.email.trim())) return alert("Invalid Email address.");
    if (!formData.phone?.trim() || !phoneRegex.test(formData.phone.trim())) return alert("Invalid Phone number.");

    if (!String(formData.salary_type || "").trim()) return alert("Please select Salary Type.");
    if (formData.salary_type === "MONTHLY" && (Number(formData.basic_rate) <= 0 || !formData.basic_rate)) return alert("Invalid Basic Rate.");
    if (!String(formData.effective_date || "").trim()) return alert("Please select Effective Date.");

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
            basic_rate: formData.salary_type === "DAILY" ? 0 : Number(formData.basic_rate),
            is_epf_eligible: Number(formData.is_epf_eligible) ? 1 : 0,
            effective_date: String(formData.effective_date).trim(),
          },
        };

        const updatedData = await updateEmployeeApi(formData.employee_id, payload);
        const updatedEmp = updatedData.employee;

        setEmployees((prev) => prev.map((emp) => String(emp.employee_id) === String(formData.employee_id) ? { ...emp, ...updatedEmp, ...payload.salary_configuration } : emp));
        setSelectedEmpId(formData.employee_id);
        closeModal();
      } catch (err) { alert(err.message || "Update failed"); }
      return;
    }

    const payload = {
      employee_id: String(formData.employee_id).trim(),
      department_id: Number(formData.department_id),
      first_name: String(formData.first_name).trim(),
      last_name: String(formData.last_name || "-").trim(),
      nic: String(formData.nic).trim(),
      email: String(formData.email).trim(),
      phone: String(formData.phone).trim(),
      status: String(formData.status || "ACTIVE").trim(),
      salary_configuration: {
        salary_type: String(formData.salary_type).trim(),
        basic_rate: formData.salary_type === "DAILY" ? 0 : Number(formData.basic_rate),
        is_epf_eligible: Number(formData.is_epf_eligible) ? 1 : 0,
        effective_date: String(formData.effective_date).trim(),
      },
    };

    try {
      const data = await createEmployeeApi(payload);
      const createdEmp = data?.employee || data;
      const createdSal = data?.salary_configuration || null;

      const newEmp = {
        ...createdEmp,
        ...createdSal,
      };

      setEmployees((prev) => [...prev, newEmp]);
      setSelectedEmpId(newEmp.employee_id);

      if (data?.credentials?.username && data?.credentials?.tempPassword) {
        setNewCreds({
          employee_id: newEmp.employee_id,
          username: data.credentials.username,
          tempPassword: data.credentials.tempPassword,
        });
        setCredsOpen(true);
      }
      closeModal();
    } catch (err) { alert(err.message || "Create failed"); }
  };

  const openRemoveModal = (emp) => {
    setRemoveTarget(emp);
    setRemoveReason("");
    setIsRemoveOpen(true);
  };

  const closeRemoveModal = () => {
    setIsRemoveOpen(false);
    setRemoveTarget(null);
  };

  const confirmRemove = async () => {
    if (!removeTarget || !removeReason.trim()) return alert("Please enter the reason.");
    try {
      await deactivateEmployeeApi(removeTarget.employee_id);
      setEmployees((prev) => prev.map((e) => String(e.employee_id) === String(removeTarget.employee_id) ? { ...e, status: "INACTIVE" } : e));
      closeRemoveModal();
      if (isModalOpen && String(formData?.employee_id) === String(removeTarget.employee_id)) closeModal();
    } catch (err) { alert(err.message || "Deactivation failed"); }
  };

  return (
    <AppLayout>
      <div style={styles.page}>
        <style>{`
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .table-row:hover { background: rgba(44, 85, 48, 0.03) !important; transform: scale(1.002); }
        `}</style>

        <div style={styles.container}>
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.breadcrumb}>Manager / Employees</div>
              <h1 style={styles.pageTitle}>Employee Management</h1>
              <p style={styles.pageSubtitle}>Manage your team members and their employment details</p>
            </div>

            <div style={styles.headerActions}>
              <div style={styles.searchWrapper}>
                <Search size={18} style={styles.searchIcon} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search members..."
                  style={styles.searchInput}
                />
              </div>
              <button style={styles.btnPrimary} onClick={openAddModal}>
                <Plus size={18} />
                <span>Add Employee</span>
              </button>
            </div>
          </div>

          {selectedEmployee ? (
            <div className="fade-in" style={styles.profileCard}>
              <div style={styles.profileContent}>
                <div style={styles.avatarContainer}>
                  <div style={styles.avatarMain}>
                    {String(selectedEmployee.first_name || "").trim().slice(0, 1).toUpperCase() || "E"}
                  </div>
                  <div style={{ ...styles.statusIndicator, background: selectedEmployee.status === "ACTIVE" ? "#10b981" : "#ef4444" }}></div>
                </div>

                <div style={styles.profileInfo}>
                  <div style={styles.profileHeaderRow}>
                    <div>
                      <h2 style={styles.profileName}>{fullName(selectedEmployee)}</h2>
                      <div style={styles.profileMetaGroup}>
                        <div style={styles.metaBadge}>
                          <Briefcase size={14} />
                          <span>{getDeptName(selectedEmployee.department_id)}</span>
                        </div>
                        <div style={styles.metaBadge}>
                          <ShieldCheck size={14} />
                          <span>ID: {selectedEmployee.employee_id}</span>
                        </div>
                      </div>
                    </div>

                    <div style={styles.profileActions}>
                      <button style={styles.iconActionBtn} onClick={() => openModal(selectedEmployee, false)} title="View Details">
                        <Eye size={18} />
                      </button>
                      <button style={styles.iconActionBtn} onClick={() => openModal(selectedEmployee, true)} title="Edit Employee">
                        <Edit3 size={18} />
                      </button>
                      {selectedEmployee.status !== "INACTIVE" && (
                        <button style={{ ...styles.iconActionBtn, color: "#dc2626" }} onClick={() => openRemoveModal(selectedEmployee)} title="Deactivate">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={styles.contactGrid}>
                    <div style={styles.contactItem}><Mail size={16} color="#6b7280" /><span>{selectedEmployee.email || "No email"}</span></div>
                    <div style={styles.contactItem}><Phone size={16} color="#6b7280" /><span>{selectedEmployee.phone || "No phone"}</span></div>
                    <div style={styles.contactItem}><Calendar size={16} color="#6b7280" /><span>Joined {new Date(selectedEmployee.created_at).toLocaleDateString()}</span></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}><Users size={40} /></div>
              <p>No employee selected. Select from the list below or add a new team member.</p>
            </div>
          )}

          <div className="fade-in" style={styles.listCard}>
            <div style={styles.listHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={styles.listIconBox}><Users size={18} /></div>
                <h3 style={styles.listTitle}>All Employees</h3>
              </div>
              <div style={styles.countBadge}>{filteredEmployees.length} Total</div>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>EMPLOYEE</th>
                    <th style={styles.th}>DEPARTMENT</th>
                    <th style={styles.th}>STATUS</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => {
                    const isSelected = String(emp.employee_id) === String(selectedEmpId);
                    return (
                      <tr key={emp.employee_id} className="table-row" style={{ ...styles.tr, ...(isSelected ? styles.trSelected : {}) }} onClick={() => setSelectedEmpId(emp.employee_id)}>
                        <td style={styles.td}>
                          <div style={styles.userCell}>
                            <div style={{ ...styles.rowAvatar, background: isSelected ? "#2c5530" : "#f1f5f9", color: isSelected ? "#fff" : "#475569" }}>
                              {String(emp.first_name || "").slice(0,1).toUpperCase()}
                            </div>
                            <div>
                              <div style={styles.userName}>{fullName(emp)}</div>
                              <div style={styles.userSub}>{emp.employee_id} • {emp.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}><span style={styles.deptText}>{getDeptName(emp.department_id)}</span></td>
                        <td style={styles.td}>
                          <div style={{ ...styles.statusTag, background: emp.status === "ACTIVE" ? "#ecfdf5" : "#fef2f2", color: emp.status === "ACTIVE" ? "#059669" : "#dc2626" }}>
                            {emp.status}
                          </div>
                        </td>
                        <td style={{ ...styles.td, textAlign: "right" }}>
                          <div style={styles.actionRow}>
                            <button style={{ ...styles.selectBtn, background: isSelected ? "#2c5530" : "transparent", color: isSelected ? "#fff" : "#2c5530" }} onClick={(e) => { e.stopPropagation(); setSelectedEmpId(emp.employee_id); }}>
                              {isSelected ? "Current" : "Select"}
                            </button>
                            <div style={styles.dropdownWrapper}>
                              <button className="action-dropdown-trigger" style={styles.dotsBtn} onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === emp.employee_id ? null : emp.employee_id); }}>
                                <MoreVertical size={16} />
                              </button>
                              {menuOpenId === emp.employee_id && (
                                <div className="action-dropdown-menu" style={styles.dropdownMenu}>
                                  <button style={styles.dropdownItem} onClick={(e) => { e.stopPropagation(); openModal(emp, true); setMenuOpenId(null); }}>
                                    <Edit3 size={14} /> Edit
                                  </button>
                                  {emp.status !== "INACTIVE" && (
                                    <button style={styles.dropdownItemDanger} onClick={(e) => { e.stopPropagation(); openRemoveModal(emp); setMenuOpenId(null); }}>
                                      <Trash2 size={14} /> Deactivate
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredEmployees.length === 0 && (
                    <tr><td colSpan={4} style={styles.emptyTable}><div style={styles.emptyTableContent}><Search size={32} color="#cbd5e1" /><p>No employees found matching "{search}"</p></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {isModalOpen && (
          <div style={styles.modalOverlay} onClick={closeModal}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>{isEditMode ? "Employee Form" : "Employee Details"}</h3>
                <button style={styles.iconBtn} onClick={closeModal}>✕</button>
              </div>
              <div style={styles.modalBody}>
                <div style={styles.modalProfile}>
                  <div style={styles.bigAvatar}>{String(formData.first_name || "").slice(0, 1).toUpperCase() || "E"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.modalName}>{fullName(formData)?.trim() !== "-" ? fullName(formData) : "New Employee"}</div>
                    <div style={styles.modalSub}>Department: {getDeptName(formData.department_id)}</div>
                  </div>
                </div>

                <div style={styles.formGrid}>
                  <div><label style={styles.label}>EMPLOYEE ID</label>{isEditMode ? <input name="employee_id" value={formData.employee_id || ""} onChange={handleChange} style={styles.input} /> : <div style={styles.readValue}>{formData.employee_id || "-"}</div>}</div>
                  <div><label style={styles.label}>DEPARTMENT</label>{isEditMode ? <select name="department_id" value={formData.department_id ?? ""} onChange={handleChange} style={styles.select}>{(departments || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select> : <div style={styles.readValue}>{getDeptName(formData.department_id)}</div>}</div>
                  <div><label style={styles.label}>FIRST NAME</label>{isEditMode ? <input name="first_name" value={formData.first_name || ""} onChange={handleChange} style={styles.input} /> : <div style={styles.readValue}>{formData.first_name || "-"}</div>}</div>
                  <div><label style={styles.label}>LAST NAME</label>{isEditMode ? <input name="last_name" value={formData.last_name || ""} onChange={handleChange} style={styles.input} /> : <div style={styles.readValue}>{formData.last_name || "-"}</div>}</div>
                  <div><label style={styles.label}>NIC</label>{isEditMode ? <input name="nic" value={formData.nic || ""} onChange={handleChange} style={styles.input} /> : <div style={styles.readValue}>{formData.nic || "-"}</div>}</div>
                  <div><label style={styles.label}>EMAIL</label>{isEditMode ? <input name="email" value={formData.email || ""} onChange={handleChange} style={styles.input} /> : <div style={styles.readValue}>{formData.email || "-"}</div>}</div>
                  <div><label style={styles.label}>PHONE</label>{isEditMode ? <input name="phone" value={formData.phone || ""} onChange={handleChange} style={styles.input} /> : <div style={styles.readValue}>{formData.phone || "-"}</div>}</div>
                  <div><label style={styles.label}>STATUS</label>{isEditMode ? <select name="status" value={formData.status || "ACTIVE"} onChange={handleChange} style={styles.select}><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option><option value="RESIGNED">RESIGNED</option><option value="TERMINATED">TERMINATED</option></select> : <div style={styles.readValue}>{formData.status || "-"}</div>}</div>
                  <div><label style={styles.label}>SALARY TYPE</label>{isEditMode ? <select name="salary_type" value={formData.salary_type || "MONTHLY"} onChange={handleChange} style={styles.select}><option value="MONTHLY">MONTHLY</option><option value="DAILY">DAILY</option></select> : <div style={styles.readValue}>{formData.salary_type || "-"}</div>}</div>
                  {formData.salary_type === "MONTHLY" && (<div><label style={styles.label}>BASIC RATE</label>{isEditMode ? <input name="basic_rate" value={formData.basic_rate ?? ""} onChange={handleChange} style={styles.input} placeholder="e.g., 75000" /> : <div style={styles.readValue}>{moneyText(formData.basic_rate)}</div>}</div>)}
                  <div><label style={styles.label}>EPF/ETF ELIGIBLE</label>{isEditMode ? <select name="is_epf_eligible" value={String(formData.is_epf_eligible ?? 1)} onChange={(e) => setFormData((p) => ({ ...p, is_epf_eligible: Number(e.target.value) }))} style={styles.select}><option value="1">YES</option><option value="0">NO</option></select> : <div style={styles.readValue}>{Number(formData.is_epf_eligible) === 1 ? "YES" : "NO"}</div>}</div>
                  <div><label style={styles.label}>EFFECTIVE DATE</label>{isEditMode ? <input type="date" name="effective_date" value={formData.effective_date || ""} onChange={handleChange} style={styles.input} /> : <div style={styles.readValue}>{formData.effective_date || "-"}</div>}</div>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button style={styles.btnSecondary} onClick={closeModal}>Close</button>
                {isEditMode && <button style={styles.btnPrimary} onClick={handleSave}>Save</button>}
              </div>
            </div>
          </div>
        )}

        {credsOpen && newCreds && (
          <div style={styles.modalOverlay} onClick={closeCreds}>
            <div style={styles.removeModal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}><h3 style={styles.modalTitle}>Credentials</h3><button style={styles.iconBtn} onClick={closeCreds}>✕</button></div>
              <div style={styles.modalBody}>
                <div style={styles.removeWarnBox}>Copy these credentials now. Password will not be shown again.</div>
                <div style={{ marginTop: "12px" }}><label style={styles.label}>USERNAME</label><div style={styles.readValue}>{newCreds.username}</div></div>
                <div style={{ marginTop: "12px" }}><label style={styles.label}>TEMP PASSWORD</label><div style={styles.readValue}>{newCreds.tempPassword}</div></div>
                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                  <button style={{ ...styles.btnSecondary, flex: 1 }} onClick={() => { navigator.clipboard.writeText(newCreds.username); alert("Copied!"); }}>Copy User</button>
                  <button style={{ ...styles.btnPrimary, flex: 1 }} onClick={() => { navigator.clipboard.writeText(newCreds.tempPassword); alert("Copied!"); }}>Copy Pass</button>
                </div>
              </div>
              <div style={styles.modalActions}><button style={styles.btnPrimary} onClick={closeCreds}>Done</button></div>
            </div>
          </div>
        )}

        {isRemoveOpen && removeTarget && (
          <div style={styles.modalOverlay} onClick={closeRemoveModal}>
            <div style={styles.removeModal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}><h3 style={styles.modalTitle}>Deactivate</h3><button style={styles.iconBtn} onClick={closeRemoveModal}>✕</button></div>
              <div style={styles.modalBody}>
                <div style={styles.removeWarnBox}>Deactivating <strong>{fullName(removeTarget)}</strong>.</div>
                <div style={{ marginTop: "12px" }}><label style={styles.label}>REASON (Required)</label><textarea value={removeReason} onChange={(e) => setRemoveReason(e.target.value)} style={styles.textarea} /></div>
              </div>
              <div style={styles.modalActions}>
                <button style={styles.btnSecondary} onClick={closeRemoveModal}>Cancel</button>
                <button style={styles.btnDanger} onClick={confirmRemove}>Confirm</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

const styles = {
  page: { minHeight: "100%", background: "#f8fafc" },
  container: { padding: "32px", maxWidth: "1400px", margin: "0 auto" },
  breadcrumb: { fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", gap: "24px", flexWrap: "wrap" },
  pageTitle: { margin: 0, fontSize: "32px", fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em" },
  pageSubtitle: { margin: "4px 0 0 0", fontSize: "15px", color: "#64748b", fontWeight: 500 },
  headerActions: { display: "flex", alignItems: "center", gap: "16px" },
  searchWrapper: { position: "relative", display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: "14px", color: "#94a3b8" },
  searchInput: { padding: "12px 16px 12px 42px", borderRadius: "14px", border: "1px solid #e2e8f0", width: "280px", outline: "none", fontSize: "14px", fontWeight: 600 },
  btnPrimary: { display: "flex", alignItems: "center", gap: "8px", background: "#2c5530", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "14px", cursor: "pointer", fontWeight: 700, fontSize: "14px", boxShadow: "0 4px 12px rgba(44, 85, 48, 0.2)" },
  btnSecondary: { background: "#fff", color: "#2c5530", border: "1px solid #e2e8f0", padding: "12px 20px", borderRadius: "14px", cursor: "pointer", fontWeight: 700 },
  btnDanger: { background: "#dc2626", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "14px", cursor: "pointer", fontWeight: 700 },
  profileCard: { background: "#fff", borderRadius: "24px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9", marginBottom: "32px" },
  profileContent: { display: "flex", gap: "32px", alignItems: "flex-start" },
  avatarContainer: { position: "relative" },
  avatarMain: { width: "84px", height: "84px", borderRadius: "24px", background: "#2c5530", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: 900 },
  statusIndicator: { position: "absolute", bottom: "-4px", right: "-4px", width: "20px", height: "20px", borderRadius: "50%", border: "4px solid #fff" },
  profileInfo: { flex: 1 },
  profileHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
  profileName: { margin: 0, fontSize: "24px", fontWeight: 800, color: "#1e293b" },
  profileMetaGroup: { display: "flex", gap: "12px", marginTop: "8px" },
  metaBadge: { display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: "#f1f5f9", borderRadius: "10px", fontSize: "12px", fontWeight: 700, color: "#475569" },
  profileActions: { display: "flex", gap: "10px" },
  iconActionBtn: { width: "40px", height: "40px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569" },
  contactGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" },
  contactItem: { display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: 600, color: "#475569" },
  emptyState: { padding: "48px", textAlign: "center", background: "#fff", borderRadius: "24px", border: "1px dashed #cbd5e1", marginBottom: "32px" },
  emptyIcon: { color: "#cbd5e1", marginBottom: "16px", display: "inline-block" },
  listCard: { background: "#fff", borderRadius: "24px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9" },
  listHeader: { padding: "24px 32px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" },
  listIconBox: { width: "36px", height: "36px", borderRadius: "10px", background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" },
  listTitle: { margin: 0, fontSize: "18px", fontWeight: 800, color: "#1e293b" },
  countBadge: { padding: "6px 14px", borderRadius: "12px", background: "#f1f5f9", fontSize: "12px", fontWeight: 800, color: "#475569" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "16px 32px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", background: "#f8fafc" },
  tr: { borderBottom: "1px solid #f1f5f9", cursor: "pointer" },
  trSelected: { background: "rgba(44, 85, 48, 0.04)" },
  td: { padding: "20px 32px", fontSize: "14px", color: "#475569" },
  userCell: { display: "flex", alignItems: "center", gap: "14px" },
  rowAvatar: { width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "14px" },
  userName: { fontWeight: 700, color: "#1e293b" },
  userSub: { fontSize: "12px", color: "#94a3b8", marginTop: "2px" },
  deptText: { fontWeight: 600 },
  statusTag: { display: "inline-flex", padding: "6px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: 800, textTransform: "uppercase" },
  actionRow: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px" },
  selectBtn: { padding: "8px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", fontWeight: 700, cursor: "pointer" },
  dotsBtn: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  dropdownWrapper: { position: "relative" },
  dropdownMenu: { position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "8px", minWidth: "160px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", zIndex: 100 },
  dropdownItem: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", border: "none", background: "none", width: "100%", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#475569", cursor: "pointer" },
  dropdownItemDanger: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", border: "none", background: "none", width: "100%", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#dc2626", cursor: "pointer" },
  emptyTable: { padding: "64px 0", textAlign: "center" },
  emptyTableContent: { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", color: "#94a3b8" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", zIndex: 1000 },
  modal: { width: "min(840px, 100%)", background: "#fff", borderRadius: "28px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden" },
  modalHeader: { padding: "24px 32px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { margin: 0, fontSize: "20px", fontWeight: 800, color: "#1e293b" },
  iconBtn: { width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  modalBody: { padding: "32px", maxHeight: "70vh", overflowY: "auto" },
  modalProfile: { display: "flex", alignItems: "center", gap: "20px", padding: "24px", borderRadius: "20px", background: "#f8fafc", marginBottom: "24px", border: "1px solid #f1f5f9" },
  bigAvatar: { width: "64px", height: "64px", borderRadius: "18px", background: "#2c5530", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 800 },
  modalName: { fontSize: "18px", fontWeight: 800, color: "#1e293b" },
  modalSub: { fontSize: "14px", color: "#64748b", marginTop: "4px", fontWeight: 500 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" },
  label: { display: "block", fontSize: "12px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", marginLeft: "4px" },
  input: { width: "100%", padding: "12px 16px", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "14px", fontWeight: 600, color: "#1e293b", background: "#fff" },
  select: { width: "100%", padding: "12px 16px", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "14px", fontWeight: 600, color: "#1e293b", background: "#fff" },
  readValue: { padding: "12px 16px", borderRadius: "14px", border: "1px solid #f1f5f9", background: "#f8fafc", color: "#475569", fontWeight: 600, fontSize: "14px" },
  modalActions: { padding: "24px 32px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "12px", background: "#f8fafc" },
  removeModal: { width: "min(500px, 100%)", background: "#fff", borderRadius: "28px", overflow: "hidden" },
  removeWarnBox: { padding: "16px", background: "#fef2f2", borderRadius: "16px", border: "1px solid #fee2e2", marginBottom: "20px", color: "#991b1b", fontWeight: 600 },
  textarea: { width: "100%", minHeight: "100px", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px", fontWeight: 600, color: "#1e293b", background: "#fff", resize: "none" },
};

export default EmployeeManagement;

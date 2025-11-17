"use client";

import { useState } from "react";
import { Plus, ChevronDown, X } from "lucide-react";
import styles from './admin-page.module.css';

interface User {
  id: string;
  name: string;
  role: string;
}

const ROLE_OPTIONS = ["Senator", "Admin", "Coordinator", "Attorney"];

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([
    { id: "1", name: "Brad Pitt", role: "Senator" },
    { id: "2", name: "Will Smith", role: "Senator" },
    { id: "3", name: "Margot Robbie", role: "Senator" },
    { id: "4", name: "Rushit Dave", role: "Senator" },
    { id: "5", name: "Mansi Bhavsar", role: "Senator" },
  ]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    fullName: "",
    email: "",
    position: "",
    role: "Student"
  });

  const handleAddUser = () => {
    setShowAddUserModal(true);
  };

  const handleCloseModal = () => {
    setShowAddUserModal(false);
    setNewUserForm({
      fullName: "",
      email: "",
      position: "",
      role: "Student"
    });
  };

  const handleSubmitNewUser = () => {
    // Handle form submission
    console.log("New user data:", newUserForm);
    handleCloseModal();
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    setOpenDropdownId(null);
  };

  const toggleDropdown = (userId: string) => {
    setOpenDropdownId(openDropdownId === userId ? null : userId);
  };

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          {/* Title and Add User Button */}
          <div className={styles.headerSection}>
            <h1 className={styles.pageTitle}>
              Users List
            </h1>
            <button
              onClick={handleAddUser}
              className={styles.addUserButton}
            >
              <Plus className={styles.addUserButtonIcon} />
              Add User
            </button>
          </div>

          {/* Users List */}
          <div className={styles.usersList}>
            {users.map((user) => (
              <div
                key={user.id}
                className={styles.userCard}
              >
                <h2 className={styles.userName}>
                  {user.name}
                </h2>
                <div className={styles.roleDropdownContainer}>
                  <button
                    onClick={() => toggleDropdown(user.id)}
                    className={styles.roleDropdownButton}
                  >
                    {user.role}
                    <ChevronDown className={styles.roleDropdownIcon} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {openDropdownId === user.id && (
                    <div className={styles.roleDropdownMenu}>
                      {ROLE_OPTIONS.map((role) => (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(user.id, role)}
                          className={`${styles.roleDropdownOption} ${
                            user.role === role 
                              ? styles.roleDropdownOptionActive
                              : styles.roleDropdownOptionInactive
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className={styles.modalOverlay}>
          {/* Backdrop with blur */}
          <div 
            className={styles.modalBackdrop}
            onClick={handleCloseModal}
          />
          
          {/* Modal Content */}
          <div className={styles.modalContent}>
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className={styles.modalCloseButton}
            >
              <X className={styles.modalCloseIcon} />
            </button>

            {/* Title */}
            <h2 className={styles.modalTitle}>
              Add User
            </h2>

            {/* Form Fields */}
            <div className={styles.formFields}>
              {/* Full Name */}
              <input
                type="text"
                placeholder="Full Name"
                value={newUserForm.fullName}
                onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                className={styles.formInput}
              />

              {/* Email */}
              <input
                type="email"
                placeholder="Email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                className={styles.formInput}
              />

              {/* Position */}
              <input
                type="text"
                placeholder="Position"
                value={newUserForm.position}
                onChange={(e) => setNewUserForm({ ...newUserForm, position: e.target.value })}
                className={styles.formInput}
              />

              {/* Role Dropdown */}
              <select
                value={newUserForm.role}
                onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                className={styles.formSelect}
              >
                <option value="Student">Student</option>
                <option value="Senator">Senator</option>
                <option value="Admin">Admin</option>
                <option value="Coordinator">Coordinator</option>
                <option value="Attorney">Attorney</option>
              </select>

              {/* Add User Button */}
              <button
                onClick={handleSubmitNewUser}
                className={styles.formSubmitButton}
              >
                Add User
              </button>

              {/* View Users Link */}
              <button
                onClick={handleCloseModal}
                className={styles.formCancelButton}
              >
                View Users
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


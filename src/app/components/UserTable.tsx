"use client";

import { useState, useMemo } from "react";
import styles from "../admin/dashboard/admin.module.css";
import SearchBar from "./searchBar/SearchBar";
import DropDownOptions from "./dropDown/dropDown";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface UserTableProps {
  users: User[];
}

const roles = ["admin", "senator", "coordinator", "attorney"];

export default function UserTable({ users }: UserTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("Name");
  const [roleFilter, setRoleFilter] = useState("All");
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>(
    {}
  );
  const [isSaving, setIsSaving] = useState(false);

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(
      (user) =>
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter by role if not "All"
    if (roleFilter !== "All") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Sort users
    if (sortOption === "Name") {
      filtered.sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        )
      );
    } else if (sortOption === "Email") {
      filtered.sort((a, b) => a.email.localeCompare(b.email));
    } else if (sortOption === "Role") {
      filtered.sort((a, b) => a.role.localeCompare(b.role));
    }

    return filtered;
  }, [users, searchQuery, sortOption, roleFilter]);

  const handleRoleChange = (userId: string, newRole: string) => {
    setPendingChanges((prev) => ({
      ...prev,
      [userId]: newRole,
    }));
  };

  const handleSaveChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      alert("No changes to save.");
      return;
    }

    const confirmed = confirm(
      `Save ${Object.keys(pendingChanges).length} role change(s)?\n\n` +
        `This will update roles in both Clerk and the database.\n` +
        `Users will need to log out and log back in to see changes.`
    );
    if (!confirmed) return;

    setIsSaving(true);

    try {
      const updates = Object.entries(pendingChanges).map(([userId, role]) => ({
        userId,
        role,
      }));

      const response = await fetch("/api/batch-update-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Successfully updated ${data.results.length} user role(s)!`);
        setPendingChanges({});
        location.reload();
      } else {
        alert(`Failed to update roles: ${data.error}`);
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("An error occurred while saving changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelChanges = () => {
    if (Object.keys(pendingChanges).length === 0) return;

    const confirmed = confirm("Discard all unsaved changes?");
    if (confirmed) {
      setPendingChanges({});
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    const confirmed = confirm(
      `Are you sure you want to delete ${userName}?\n\n` +
        `This will permanently delete:\n` +
        `- User account from Clerk\n` +
        `- User record from database\n` +
        `- All related events and hours\n\n` +
        `This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("User deleted successfully.");
        location.reload();
      } else {
        alert(`Failed to delete user: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An error occurred while deleting the user.");
    }
  };

  const hasChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className={styles['admin-main-container']}>
      <div className={styles['admin-top-bar']}>
        <div className={styles['admin-search-sort-container']}>
          <SearchBar onSearch={(query) => setSearchQuery(query)} />
          <DropDownOptions
            options={[
              { id: 0, optionText: "Name" },
              { id: 1, optionText: "Email" },
              { id: 2, optionText: "Role" },
            ]}
            setSelectedOption={(option) => setSortOption(option.optionText)}
            text="Sort By"
          />
          <DropDownOptions
            options={[
              { id: 0, optionText: "All" },
              { id: 1, optionText: "admin" },
              { id: 2, optionText: "senator" },
              { id: 3, optionText: "coordinator" },
              { id: 4, optionText: "attorney" },
            ]}
            setSelectedOption={(option) => setRoleFilter(option.optionText)}
            text="Filter by Role"
          />
        </div>
        {hasChanges && (
          <div style={{ display: "flex", gap: "0.5rem", marginLeft: "auto" }}>
            <button
              onClick={handleCancelChanges}
              disabled={isSaving}
              className="transition-all duration-300 hover:bg-gray-100 hover:border-[#febd11]"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                border: "1px solid #ddd",
                backgroundColor: "white",
                cursor: isSaving ? "not-allowed" : "pointer",
                fontSize: "0.9rem",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="transition-all duration-300 hover:bg-[#febd11] hover:shadow-lg"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#7c3aed",
                color: "white",
                fontWeight: "600",
                cursor: isSaving ? "wait" : "pointer",
                fontSize: "0.9rem",
              }}
            >
              {isSaving
                ? "Saving..."
                : `Save Changes (${Object.keys(pendingChanges).length})`}
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#f9fafb",
          borderRadius: "4px",
          marginBottom: "1rem",
          fontSize: "0.9rem",
          color: "#6b7280",
        }}
      >
        Showing {filteredUsers.length} of {users.length} users
      </div>

      <div className={styles['admin-labels-row']}>
        <label>Name</label>
        <div className={styles['admin-right-labels']}>
          <label>Role</label>
          <label>Actions</label>
        </div>
      </div>

      <div className={styles['admin-scroll-area']}>
        {filteredUsers.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "0.95rem",
            }}
          >
            {users.length === 0
              ? "No users found in the system."
              : "No users match your search or filter criteria."}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className={styles['admin-user-row']}>
              <div className={styles['admin-user-info']}>
                <div className={styles['admin-user-name']}>
                  {user.firstName} {user.lastName}
                </div>
                <div className={styles['admin-user-email']}>{user.email}</div>
              </div>
              <div className={styles['admin-user-actions']}>
                <div className={styles['admin-actions']}>
                  <select
                    value={pendingChanges[user.id] || user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    style={{
                      padding: "0.4rem 0.6rem",
                      borderRadius: "4px",
                      border: pendingChanges[user.id]
                        ? "2px solid #7c3aed"
                        : "1px solid #ddd",
                      backgroundColor: pendingChanges[user.id]
                        ? "#f5f3ff"
                        : "white",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: pendingChanges[user.id] ? "600" : "normal",
                    }}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      handleDelete(
                        user.id,
                        `${user.firstName} ${user.lastName}`
                      )
                    }
                    className={styles['admin-delete-button']}
                    title="Delete this user permanently"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

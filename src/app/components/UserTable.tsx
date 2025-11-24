"use client";

import { useState, useMemo, useEffect } from "react";
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
  onPendingChangesChange?: (hasChanges: boolean) => void;
}

const roles = ["admin", "senator", "coordinator", "attorney"];

export default function UserTable({ users, onPendingChangesChange }: UserTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("Name");
  const [roleFilter, setRoleFilter] = useState("All");
  const [pendingRoleChanges, setPendingRoleChanges] = useState<Record<string, string>>(
    {}
  );
  const [pendingDeletions, setPendingDeletions] = useState<Set<string>>(
    new Set()
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
  }, [users, searchQuery, sortOption, roleFilter, pendingDeletions]);

  // Notify parent of pending changes
  useEffect(() => {
    const hasChanges = Object.keys(pendingRoleChanges).length > 0 || pendingDeletions.size > 0;
    onPendingChangesChange?.(hasChanges);
  }, [pendingRoleChanges, pendingDeletions, onPendingChangesChange]);

  const handleRoleChange = (userId: string, newRole: string) => {
    // If user is marked for deletion, don't allow role changes
    if (pendingDeletions.has(userId)) {
      return;
    }
    setPendingRoleChanges((prev) => ({
      ...prev,
      [userId]: newRole,
    }));
  };

  const handleSaveChanges = async () => {
    const roleChangeCount = Object.keys(pendingRoleChanges).length;
    const deletionCount = pendingDeletions.size;
    
    if (roleChangeCount === 0 && deletionCount === 0) {
      alert("No changes to save.");
      return;
    }

    let confirmMessage = "Save the following changes?\n\n";
    if (roleChangeCount > 0) {
      confirmMessage += `- ${roleChangeCount} role change(s)\n`;
    }
    if (deletionCount > 0) {
      confirmMessage += `- ${deletionCount} user deletion(s)\n`;
    }
    confirmMessage += "\nThis will update both Clerk and the database.\n";
    if (roleChangeCount > 0) {
      confirmMessage += "Users will need to log out and log back in to see role changes.\n";
    }
    if (deletionCount > 0) {
      confirmMessage += "Deletions cannot be undone.\n";
    }

    const confirmed = confirm(confirmMessage);
    if (!confirmed) return;

    setIsSaving(true);

    try {
      const errors: string[] = [];

      // Process role changes
      if (roleChangeCount > 0) {
        const updates = Object.entries(pendingRoleChanges)
          .filter(([userId]) => !pendingDeletions.has(userId))
          .map(([userId, role]) => ({
            userId,
            role,
          }));

        if (updates.length > 0) {
          const response = await fetch("/api/batch-update-roles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ updates }),
          });

          const data = await response.json();

          if (response.ok) {
            console.log(`Successfully updated ${data.results.length} user role(s)!`);
          } else {
            errors.push(`Failed to update roles: ${data.error}`);
          }
        }
      }

      // Process deletions
      if (deletionCount > 0) {
        const deletePromises = Array.from(pendingDeletions).map(async (userId) => {
          try {
            const res = await fetch("/api/delete-user", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId }),
            });

            const data = await res.json();

            if (!res.ok) {
              errors.push(`Failed to delete user ${userId}: ${data.error || "Unknown error"}`);
            }
          } catch (error) {
            console.error(`Error deleting user ${userId}:`, error);
            errors.push(`Error deleting user ${userId}`);
          }
        });

        await Promise.all(deletePromises);
      }

      if (errors.length > 0) {
        alert(`Some operations failed:\n${errors.join("\n")}`);
      } else {
        const successMessages = [];
        if (roleChangeCount > 0) {
          successMessages.push(`${roleChangeCount} role change(s)`);
        }
        if (deletionCount > 0) {
          successMessages.push(`${deletionCount} deletion(s)`);
        }
        alert(`Successfully saved ${successMessages.join(" and ")}!`);
        // Clear pending changes and notify parent before reload
        setPendingRoleChanges({});
        setPendingDeletions(new Set());
        onPendingChangesChange?.(false);
        // Small delay to ensure state updates propagate before reload
        setTimeout(() => {
          location.reload();
        }, 100);
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("An error occurred while saving changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelChanges = () => {
    const hasChanges = Object.keys(pendingRoleChanges).length > 0 || pendingDeletions.size > 0;
    if (!hasChanges) return;

    const confirmed = confirm("Discard all unsaved changes?");
    if (confirmed) {
      setPendingRoleChanges({});
      setPendingDeletions(new Set());
    }
  };

  const handleDelete = (userId: string, userName: string) => {
    // If already marked for deletion, remove it (undo)
    if (pendingDeletions.has(userId)) {
      setPendingDeletions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      // Also remove any pending role changes for this user
      setPendingRoleChanges((prev) => {
        const newChanges = { ...prev };
        delete newChanges[userId];
        return newChanges;
      });
      return;
    }

    // Mark for deletion
    setPendingDeletions((prev) => new Set(prev).add(userId));
    // Remove any pending role changes for this user
    setPendingRoleChanges((prev) => {
      const newChanges = { ...prev };
      delete newChanges[userId];
      return newChanges;
    });
  };

  const hasChanges = Object.keys(pendingRoleChanges).length > 0 || pendingDeletions.size > 0;

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
                : `Save Changes (${Object.keys(pendingRoleChanges).length + pendingDeletions.size})`}
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
          filteredUsers.map((user) => {
            const isMarkedForDeletion = pendingDeletions.has(user.id);
            return (
            <div 
              key={user.id} 
              className={styles['admin-user-row']}
              style={{
                opacity: isMarkedForDeletion ? 0.6 : 1,
                backgroundColor: isMarkedForDeletion ? "#fee2e2" : undefined,
                borderLeft: isMarkedForDeletion ? "4px solid #dc2626" : undefined,
              }}
            >
              <div className={styles['admin-user-info']}>
                <div className={styles['admin-user-name']}>
                  {user.firstName} {user.lastName}
                  {isMarkedForDeletion && (
                    <span style={{ 
                      marginLeft: "0.5rem", 
                      color: "#dc2626", 
                      fontSize: "0.85rem",
                      fontWeight: "600"
                    }}>
                      (Marked for deletion)
                    </span>
                  )}
                </div>
                <div className={styles['admin-user-email']}>{user.email}</div>
              </div>
              <div className={styles['admin-user-actions']}>
                <div className={styles['admin-actions']}>
                  <select
                    value={pendingRoleChanges[user.id] || user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={pendingDeletions.has(user.id)}
                    style={{
                      padding: "0.4rem 0.6rem",
                      borderRadius: "4px",
                      border: pendingRoleChanges[user.id]
                        ? "2px solid #7c3aed"
                        : "1px solid #ddd",
                      backgroundColor: pendingDeletions.has(user.id)
                        ? "#fee2e2"
                        : pendingRoleChanges[user.id]
                        ? "#f5f3ff"
                        : "white",
                      cursor: pendingDeletions.has(user.id) ? "not-allowed" : "pointer",
                      fontSize: "0.9rem",
                      fontWeight: pendingRoleChanges[user.id] ? "600" : "normal",
                      opacity: pendingDeletions.has(user.id) ? 0.6 : 1,
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
                    title={pendingDeletions.has(user.id) ? "Undo deletion" : "Mark for deletion"}
                    style={{
                      backgroundColor: pendingDeletions.has(user.id) ? "#dc2626" : undefined,
                    }}
                  >
                    {pendingDeletions.has(user.id) ? "Undo Delete" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          );
          })
        )}
      </div>
    </div>
  );
}

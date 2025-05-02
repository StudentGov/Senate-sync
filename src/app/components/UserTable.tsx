'use client';

import { useState, useMemo } from "react";
import styles from "../admin/dashboard/admin.module.css";
import SearchBar from "./searchBar/SearchBar";
import DropDownOptions from "./dropDown/dropDown";
import RoleDropdown from "./RoleDropdown";

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

export default function UserTable({ users }: UserTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("Name");

  const filteredUsers = useMemo(() => {
    const filtered = users.filter(user =>
      (`${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (sortOption === "Name") {
      filtered.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
    } else if (sortOption === "Email") {
      filtered.sort((a, b) => a.email.localeCompare(b.email));
    }

    return filtered;
  }, [users, searchQuery, sortOption]);

  const handleDelete = async (userId: string) => {
    const confirmed = confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        alert("User deleted successfully.");
        location.reload();
      } else {
        alert("Failed to delete user.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An error occurred while deleting the user.");
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.topBar}>

        <div className={styles.searchSortContainer}>
          <SearchBar onSearch={(query) => setSearchQuery(query)} />
          <DropDownOptions
            options={[{ id: 0, optionText: "Name" }, { id: 1, optionText: "Email" }]}
            setSelectedOption={(option) => setSortOption(option.optionText)}
            text="Sort"
          />
        </div>
      </div>

      <div className={styles.labelsRow}>
        <label>Name</label>
        <div className={styles.rightLabels}>
          <label>Role</label>
          <label>Actions</label>
        </div>
      </div>

      <div className={styles.scrollArea}>
        {filteredUsers.map((user) => (
          <div key={user.id} className={styles.userRow}>
            <div className={styles.userInfo}>
              <div className={styles.name}>{user.firstName} {user.lastName}</div>
              <div className={styles.email}>{user.email}</div>
            </div>
            <div className={styles.userActions}>
              <div className={styles.role}>
                {user.role}
              </div>
              <div className={styles.actions}>
                <RoleDropdown userId={user.id} currentRole={user.role} />
                <button
                  onClick={() => handleDelete(user.id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

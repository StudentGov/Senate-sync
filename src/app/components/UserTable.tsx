import styles from "../admin/dashboard/admin.module.css";
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

/**
 * UserTable displays a list of users in a table format with the ability to change roles
 * and delete users. Super_admins are excluded from the list.
 */
export default function UserTable({ users }: UserTableProps) {
  // Exclude super_admins from role changes and deletion
  const filteredUsers = users.filter(user => user.role !== "super_admin");

  const handleDelete = async (userId: string) => {
    const confirmed = confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/delete-user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        alert("User deleted successfully.");
        window.location.reload(); // Or use router.refresh() if using Next App Router
      } else {
        alert("Failed to delete user.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An error occurred while deleting the user.");
    }
  };

  return (
    <div className={styles.tableContainer}>
      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{`${user.firstName} ${user.lastName}`}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <RoleDropdown userId={user.id} currentRole={user.role} />
                  <button
                    onClick={() => handleDelete(user.id)}
                    style={{
                      backgroundColor: "#e74c3c",
                      color: "#fff",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

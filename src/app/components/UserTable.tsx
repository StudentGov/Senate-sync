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
 * UserTable displays a list of users in a table format with the ability to change roles.
 * The RoleDropdown component allows role changes, except for super_admin users.
 */
export default function UserTable({ users }: UserTableProps) {
  /**
   * Filter out super_admin users
   * This prevents accidental role changes for super_admins to maintain system integrity.
   */
  const filteredUsers = users.filter(user => user.role !== "super_admin");

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
                <RoleDropdown userId={user.id} currentRole={user.role} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

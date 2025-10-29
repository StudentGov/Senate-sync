"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown, X } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const ROLE_OPTIONS = ["senator", "admin", "coordinator", "attorney"];

/**
 * Admin Dashboard Component
 * Displays a list of all users and allows admins to create new users.
 * Only users with the 'admin' role can access this page.
 * Redirects unauthorized users to the /unauthorized page.
 */
export default function AdminDashboard() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [newUserForm, setNewUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "senator",
    password: ""
  });

  /**
   * Function to fetch all users from the backend API.
   */
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/get-all-users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  /**
   * useEffect to check user authorization and fetch all users.
   * Only admins can access the dashboard.
   */
  useEffect(() => {
    // Don't do anything until user data is loaded
    if (!isSignedIn) return;
    if (!user) return;
    
    const userRole = user?.publicMetadata?.role as string;
    console.log("Admin Dashboard - User Role:", userRole); // Debug log
    
    // Check if the user has admin access
    if (userRole !== "admin") {
      console.log("Access denied - redirecting to unauthorized"); // Debug log
      router.push("/unauthorized");
      return;
    }

    // Fetch users if the admin is signed in
    console.log("Admin access granted - fetching users"); // Debug log
    fetchUsers();
  }, [isSignedIn, user, router]);

  // Filter users based on search and role filter
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user =>
      (`${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (roleFilter !== "All") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    return filtered;
  }, [users, searchQuery, roleFilter]);

  const handleAddUser = () => {
    setShowAddUserModal(true);
  };

  const handleCloseModal = () => {
    setShowAddUserModal(false);
    setNewUserForm({
      firstName: "",
      lastName: "",
      email: "",
      role: "senator",
      password: ""
    });
  };

  const handleSubmitNewUser = async () => {
    try {
      const response = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserForm),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`User created successfully! Email: ${data.user.email}`);
        handleCloseModal();
        fetchUsers(); // Refresh the user list
      } else {
        alert(data.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("An error occurred while creating the user");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const confirmed = confirm(
      `Update user role to ${newRole}?\n\n` +
      `This will update the role in both Clerk and the database.\n` +
      `The user will need to log out and log back in to see changes.`
    );
    if (!confirmed) return;

    try {
      const response = await fetch("/api/batch-update-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: [{ userId, role: newRole }] }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Role updated successfully!");
        setOpenDropdownId(null);
        fetchUsers(); // Refresh the user list
      } else {
        alert(`Failed to update role: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("An error occurred while updating the role.");
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
        fetchUsers(); // Refresh the user list
      } else {
        alert(`Failed to delete user: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An error occurred while deleting the user.");
    }
  };

  const toggleDropdown = (userId: string) => {
    setOpenDropdownId(openDropdownId === userId ? null : userId);
  };

  // Show loading state while user data is being fetched
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-[#49306e] font-kanit">Loading...</p>
      </div>
    );
  }

  // Show message if not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-[#49306e] font-kanit">Please sign in to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Title and Add User Button */}
          <div className="flex items-center justify-center mb-8 relative">
            <h1 className="font-bold text-3xl md:text-4xl text-[#49306e] font-kanit">
              Users List
            </h1>
            <button
              onClick={handleAddUser}
              className="absolute right-0 bg-[#febd11] hover:bg-[#febd11]/90 text-[#49306e] font-semibold px-6 py-2 rounded-md flex items-center gap-2 transition-colors font-kanit"
            >
              <Plus className="w-5 h-5" />
              Add User
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="max-w-3xl mx-auto mb-6 flex gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#49306e] font-kanit"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#49306e] font-kanit bg-white"
            >
              <option value="All">All Roles</option>
              <option value="admin">Admin</option>
              <option value="senator">Senator</option>
              <option value="coordinator">Coordinator</option>
              <option value="attorney">Attorney</option>
            </select>
          </div>

          {/* User Count */}
          <div className="max-w-3xl mx-auto mb-4">
            <p className="text-sm text-gray-600 font-kanit">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>

          {/* Users List */}
          <div className="max-w-3xl mx-auto space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500 font-kanit">
                  {users.length === 0 ? "No users found in the system." : "No users match your search or filter criteria."}
                </p>
              </div>
            ) : (
              filteredUsers.map((currentUser) => (
                <div
                  key={currentUser.id}
                  className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold text-[#49306e] font-kanit">
                      {currentUser.firstName} {currentUser.lastName}
                    </h2>
                    <p className="text-sm text-gray-600 font-kanit">{currentUser.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(currentUser.id)}
                        className="bg-[#febd11] hover:bg-[#febd11]/90 text-[#49306e] font-semibold px-6 py-2 rounded-md flex items-center gap-2 transition-colors min-w-[140px] justify-center font-kanit"
                      >
                        {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {openDropdownId === currentUser.id && (
                        <div className="absolute right-0 mt-2 w-[140px] bg-white rounded-md shadow-lg border border-gray-200 z-10">
                          {ROLE_OPTIONS.map((role) => (
                            <button
                              key={role}
                              onClick={() => handleRoleChange(currentUser.id, role)}
                              className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors first:rounded-t-md last:rounded-b-md font-kanit ${
                                currentUser.role === role 
                                  ? "bg-[#febd11]/20 font-semibold text-[#49306e]" 
                                  : "text-gray-700"
                              }`}
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md transition-colors font-kanit"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-[#49306e] rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Title */}
            <h2 className="text-[#febd11] font-bold text-4xl text-center mb-8 font-kanit">
              Add User
            </h2>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* First Name */}
              <input
                type="text"
                placeholder="First Name"
                value={newUserForm.firstName}
                onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#febd11] font-kanit"
              />

              {/* Last Name */}
              <input
                type="text"
                placeholder="Last Name"
                value={newUserForm.lastName}
                onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#febd11] font-kanit"
              />

              {/* Email */}
              <input
                type="email"
                placeholder="Email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#febd11] font-kanit"
              />

              {/* Password */}
              <input
                type="password"
                placeholder="Password (optional)"
                value={newUserForm.password}
                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#febd11] font-kanit"
              />

              {/* Role Dropdown */}
              <select
                value={newUserForm.role}
                onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#febd11] appearance-none cursor-pointer font-kanit"
              >
                <option value="senator">Senator</option>
                <option value="admin">Admin</option>
                <option value="coordinator">Coordinator</option>
                <option value="attorney">Attorney</option>
              </select>

              {/* Add User Button */}
              <button
                onClick={handleSubmitNewUser}
                className="w-full bg-[#febd11] hover:bg-[#febd11]/90 text-[#49306e] font-bold text-xl py-3 rounded-lg transition-colors mt-6 font-kanit"
              >
                Add User
              </button>

              {/* Cancel Link */}
              <button
                onClick={handleCloseModal}
                className="w-full text-white font-semibold text-lg pt-4 hover:text-[#febd11] transition-colors font-kanit"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


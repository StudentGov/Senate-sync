"use client";

import { useState } from "react";
import Footer from "../components/footer/Footer";
import { Plus, ChevronDown, X } from "lucide-react";

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
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Title and Add User Button */}
          <div className="flex items-center justify-center mb-12 relative">
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

          {/* Users List */}
          <div className="max-w-3xl mx-auto space-y-6">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold text-[#49306e] font-kanit">
                  {user.name}
                </h2>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown(user.id)}
                    className="bg-[#febd11] hover:bg-[#febd11]/90 text-[#49306e] font-semibold px-6 py-2 rounded-md flex items-center gap-2 transition-colors min-w-[140px] justify-center font-kanit"
                  >
                    {user.role}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {openDropdownId === user.id && (
                    <div className="absolute right-0 mt-2 w-[140px] bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      {ROLE_OPTIONS.map((role) => (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(user.id, role)}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors first:rounded-t-md last:rounded-b-md font-kanit ${
                            user.role === role 
                              ? "bg-[#febd11]/20 font-semibold text-[#49306e]" 
                              : "text-gray-700"
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

      <Footer />

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
              {/* Full Name */}
              <input
                type="text"
                placeholder="Full Name"
                value={newUserForm.fullName}
                onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
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

              {/* Position */}
              <input
                type="text"
                placeholder="Position"
                value={newUserForm.position}
                onChange={(e) => setNewUserForm({ ...newUserForm, position: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#febd11] font-kanit"
              />

              {/* Role Dropdown */}
              <select
                value={newUserForm.role}
                onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#febd11] appearance-none cursor-pointer font-kanit"
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
                className="w-full bg-[#febd11] hover:bg-[#febd11]/90 text-[#49306e] font-bold text-xl py-3 rounded-lg transition-colors mt-6 font-kanit"
              >
                Add User
              </button>

              {/* View Users Link */}
              <button
                onClick={handleCloseModal}
                className="w-full text-white font-semibold text-lg pt-4 hover:text-[#febd11] transition-colors font-kanit"
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


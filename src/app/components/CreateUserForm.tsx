'use client';

import { useState } from "react";
import styles from "./CreateUserForm.module.css";

interface CreateUserFormProps {
  onUserCreated?: () => void;
}

export default function CreateUserForm({ onUserCreated }: CreateUserFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "senator",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`User created successfully! Email: ${data.user.email}`);
        // Reset form
        setFormData({
          email: "",
          firstName: "",
          lastName: "",
          role: "senator",
          password: "",
        });
        
        // Notify parent component
        if (onUserCreated) {
          onUserCreated();
        }
      } else {
        setError(data.error || "Failed to create user");
      }
    } catch (err) {
      setError("An error occurred while creating the user");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className={styles.formContainer}>
      <h2>Create New User</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.input}
            placeholder="user@mnsu.edu"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="role">Role *</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className={styles.select}
          >
            <option value="senator">Senator</option>
            <option value="coordinator">Coordinator</option>
            <option value="attorney">Attorney</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">
            Password
            <span className={styles.optional}> (optional - user will be prompted to set password on first login if left empty)</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={styles.input}
            placeholder="Leave empty to require password reset"
            minLength={8}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>

      <div className={styles.infoBox}>
        <h3>Important Notes:</h3>
        <ul>
          <li>Users created will receive an email notification from Clerk</li>
          <li>If no password is set, users will be prompted to create one on first login</li>
          <li>You can change user roles later from the user management table</li>
          <li>All accounts are created through Clerk and automatically synced to the database</li>
        </ul>
      </div>
    </div>
  );
}


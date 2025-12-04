"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./TeamMemberEditor.module.css";

interface TeamMember {
  name: string;
  image: string;
  role: string;
  description: string;
}

interface TeamMembers {
  president: TeamMember;
  vicePresident: TeamMember;
  speaker: TeamMember;
}

export default function TeamMemberEditor() {
  const [teamMembers, setTeamMembers] = useState<TeamMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const [editedMembers, setEditedMembers] = useState({
    president: { name: "", image: "" },
    vicePresident: { name: "", image: "" },
    speaker: { name: "", image: "" }
  });

  // File input refs for each position
  const fileInputRefs = {
    president: useRef<HTMLInputElement>(null),
    vicePresident: useRef<HTMLInputElement>(null),
    speaker: useRef<HTMLInputElement>(null)
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/get-team-members");
      const data = await response.json();
      setTeamMembers(data);
      setEditedMembers({
        president: { name: data.president.name, image: data.president.image },
        vicePresident: { name: data.vicePresident.name, image: data.vicePresident.image },
        speaker: { name: data.speaker.name, image: data.speaker.image }
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching team members:", error);
      setMessage("Error loading team members");
      setLoading(false);
    }
  };

  const handleUpdate = async (position: "president" | "vicePresident" | "speaker") => {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/update-team-members", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          position,
          name: editedMembers[position].name,
          image: editedMembers[position].image
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✓ ${teamMembers?.[position].role} updated successfully!`);
        setTeamMembers(data.teamMembers);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`✗ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating team member:", error);
      setMessage("✗ Failed to update team member");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    position: "president" | "vicePresident" | "speaker",
    field: "name" | "image",
    value: string
  ) => {
    setEditedMembers(prev => ({
      ...prev,
      [position]: {
        ...prev[position],
        [field]: value
      }
    }));
  };

  const handleFileSelect = async (
    position: "president" | "vicePresident" | "speaker",
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMessage("✗ Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage("✗ File size must be less than 5MB");
      return;
    }

    setUploading(true);
    setMessage("Uploading image...");

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('position', position);

      const response = await fetch('/api/upload-team-image', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        // Update the image path for this position
        setEditedMembers(prev => ({
          ...prev,
          [position]: {
            ...prev[position],
            image: data.imagePath
          }
        }));
        setMessage("✓ Image uploaded successfully! Click 'Update' to save changes.");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`✗ Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage("✗ Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = (position: "president" | "vicePresident" | "speaker") => {
    fileInputRefs[position].current?.click();
  };

  if (loading) {
    return <div className={styles.loading}>Loading team members...</div>;
  }

  if (!teamMembers) {
    return <div className={styles.error}>Failed to load team members</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Edit Team Members</h2>
      <p className={styles.subtitle}>
        Update the names and images for the team section on the home page. 
        Role descriptions cannot be changed.
      </p>

      {message && (
        <div className={`${styles.message} ${message.startsWith("✓") ? styles.success : styles.error}`}>
          {message}
        </div>
      )}

      <div className={styles.teamGrid}>
        {/* President */}
        <div className={styles.teamCard}>
          <div className={styles.cardHeader}>
            <h3>{teamMembers.president.role}</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.previewSection}>
              <img 
                src={editedMembers.president.image} 
                alt={editedMembers.president.name}
                className={styles.previewImage}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                type="text"
                value={editedMembers.president.name}
                onChange={(e) => handleInputChange("president", "name", e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Profile Image</label>
              <input
                ref={fileInputRefs.president}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => handleFileSelect("president", e)}
                className={styles.fileInput}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => triggerFileInput("president")}
                disabled={uploading}
                className={styles.uploadButton}
              >
                {uploading ? "Uploading..." : "Choose Image"}
              </button>
              <small className={styles.hint}>
                Click to select an image from your device (JPEG, PNG, or WebP, max 5MB)
              </small>
            </div>
            <div className={styles.descriptionBox}>
              <label>Description (Read-only)</label>
              <p>{teamMembers.president.description}</p>
            </div>
            <button
              onClick={() => handleUpdate("president")}
              disabled={saving || uploading}
              className={styles.updateButton}
            >
              {saving ? "Saving..." : "Update President"}
            </button>
          </div>
        </div>

        {/* Vice President */}
        <div className={styles.teamCard}>
          <div className={styles.cardHeader}>
            <h3>{teamMembers.vicePresident.role}</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.previewSection}>
              <img 
                src={editedMembers.vicePresident.image} 
                alt={editedMembers.vicePresident.name}
                className={styles.previewImage}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                type="text"
                value={editedMembers.vicePresident.name}
                onChange={(e) => handleInputChange("vicePresident", "name", e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Profile Image</label>
              <input
                ref={fileInputRefs.vicePresident}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => handleFileSelect("vicePresident", e)}
                className={styles.fileInput}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => triggerFileInput("vicePresident")}
                disabled={uploading}
                className={styles.uploadButton}
              >
                {uploading ? "Uploading..." : "Choose Image"}
              </button>
              <small className={styles.hint}>
                Click to select an image from your device (JPEG, PNG, or WebP, max 5MB)
              </small>
            </div>
            <div className={styles.descriptionBox}>
              <label>Description (Read-only)</label>
              <p>{teamMembers.vicePresident.description}</p>
            </div>
            <button
              onClick={() => handleUpdate("vicePresident")}
              disabled={saving || uploading}
              className={styles.updateButton}
            >
              {saving ? "Saving..." : "Update Vice President"}
            </button>
          </div>
        </div>

        {/* Speaker */}
        <div className={styles.teamCard}>
          <div className={styles.cardHeader}>
            <h3>{teamMembers.speaker.role}</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.previewSection}>
              <img 
                src={editedMembers.speaker.image} 
                alt={editedMembers.speaker.name}
                className={styles.previewImage}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                type="text"
                value={editedMembers.speaker.name}
                onChange={(e) => handleInputChange("speaker", "name", e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Profile Image</label>
              <input
                ref={fileInputRefs.speaker}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => handleFileSelect("speaker", e)}
                className={styles.fileInput}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => triggerFileInput("speaker")}
                disabled={uploading}
                className={styles.uploadButton}
              >
                {uploading ? "Uploading..." : "Choose Image"}
              </button>
              <small className={styles.hint}>
                Click to select an image from your device (JPEG, PNG, or WebP, max 5MB)
              </small>
            </div>
            <div className={styles.descriptionBox}>
              <label>Description (Read-only)</label>
              <p>{teamMembers.speaker.description}</p>
            </div>
            <button
              onClick={() => handleUpdate("speaker")}
              disabled={saving || uploading}
              className={styles.updateButton}
            >
              {saving ? "Saving..." : "Update Speaker"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

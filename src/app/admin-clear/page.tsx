"use client";

import { useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";

export default function AdminClearPage() {
  const { user } = useUser();
  const { sessionClaims } = useAuth();
  const [isClearing, setIsClearing] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleClearAll = async () => {
    if (!confirm("⚠️ WARNING: This will delete ALL archives and resources from the database. Are you absolutely sure?")) {
      return;
    }

    if (!confirm("This action CANNOT be undone. Type 'DELETE ALL' in your mind and click OK to proceed.")) {
      return;
    }

    setIsClearing(true);
    setResult("");

    try {
      const response = await fetch("/api/admin/clear-all-content", {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Success! Deleted ${data.archivesDeleted} archives and ${data.resourcesDeleted} resources.`);
      } else {
        setResult(`❌ Error: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsClearing(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h1>Please sign in</h1>
      </div>
    );
  }

  if (sessionClaims?.role !== "admin") {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h1>Access Denied</h1>
        <p>Only admins can access this page.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ color: "#dc2626", marginBottom: "20px" }}>⚠️ Admin: Clear All Content</h1>
      
      <div style={{ 
        background: "#fef2f2", 
        border: "2px solid #dc2626", 
        padding: "20px", 
        borderRadius: "8px",
        marginBottom: "20px"
      }}>
        <h2 style={{ color: "#dc2626", marginTop: 0 }}>Danger Zone</h2>
        <p>This will permanently delete:</p>
        <ul>
          <li>All archives from the database</li>
          <li>All resources from the database</li>
        </ul>
        <p><strong>This action CANNOT be undone!</strong></p>
      </div>

      <button
        onClick={handleClearAll}
        disabled={isClearing}
        style={{
          background: "#dc2626",
          color: "white",
          padding: "12px 24px",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: isClearing ? "not-allowed" : "pointer",
          opacity: isClearing ? 0.5 : 1,
          width: "100%",
        }}
      >
        {isClearing ? "Clearing..." : "🗑️ Delete All Archives & Resources"}
      </button>

      {result && (
        <div style={{
          marginTop: "20px",
          padding: "15px",
          background: result.startsWith("✅") ? "#f0fdf4" : "#fef2f2",
          border: `2px solid ${result.startsWith("✅") ? "#22c55e" : "#dc2626"}`,
          borderRadius: "6px",
          fontSize: "16px",
        }}>
          {result}
        </div>
      )}

      <div style={{ marginTop: "40px", padding: "20px", background: "#f3f4f6", borderRadius: "8px" }}>
        <h3>After clearing:</h3>
        <ol>
          <li>Go to the Archives page and verify it's empty</li>
          <li>Go to the Resources page and verify it's empty</li>
          <li>Add a new test archive</li>
          <li>Try to delete it and verify it actually gets deleted</li>
        </ol>
      </div>
    </div>
  );
}


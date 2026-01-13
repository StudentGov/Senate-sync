"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, ExternalLink, X, Check, Edit, Trash2, BookOpen } from "lucide-react";
import { useUser, useAuth } from "@clerk/nextjs";
import FeedbackSection from "../components/FeedbackSection/FeedbackSection";
import styles from './resources-page.module.css';

interface Resource {
  id: number;
  created_by: string;
  title: string;
  description: string | null;
  link: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  creator_username: string | null;
}

export default function ResourcesPage() {
  const { user } = useUser();
  const { sessionClaims } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [descriptionPopup, setDescriptionPopup] = useState<{id: number, title: string, description: string} | null>(null);

  const itemsPerPage = 12;

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/get-resources`, {
        cache: 'no-store', // Don't cache to ensure fresh data after deletions
      });
      if (response.ok) {
        const data = await response.json();
        setResources(data.resources);
      } else {
        console.error("Failed to fetch resources");
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddResource = () => {
    setEditingResource(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setTitle(resource.title);
    setLink(resource.link);
    setDescription(resource.description || "");
    setImageUrl(resource.image_url || "");
    setIsModalOpen(true);
  };

  const handleDeleteResource = async (resourceId: number) => {
    if (!confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    try {
      const response = await fetch(`/api/delete-resource?id=${resourceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Resource deleted successfully!");
        fetchResources();
      } else {
        const error = await response.json();
        alert(`Failed to delete resource: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
      alert("Failed to delete resource. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
    setEditingResource(null);
  };

  const resetForm = () => {
    setTitle("");
    setLink("");
    setDescription("");
    setImageUrl("");
  };

  const handleConfirm = async () => {
    if (!title || !link) {
      alert("Please fill in all required fields (Title and Link)");
      return;
    }

    try {
      const payload = {
        title,
        link,
        description,
        image_url: imageUrl,
      };

      let response;
      if (editingResource) {
        response = await fetch("/api/update-resource", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingResource.id }),
        });
      } else {
        response = await fetch("/api/add-resource", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        alert(`Resource ${editingResource ? "updated" : "added"} successfully!`);
        handleCloseModal();
        fetchResources();
      } else {
        const error = await response.json();
        alert(`Failed to ${editingResource ? "update" : "add"} resource: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error saving resource:", error);
      alert("Failed to save resource. Please try again.");
    }
  };

  const totalPages = Math.ceil(resources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResources = resources.slice(startIndex, endIndex);

  const formatUrl = (url: string) => {
    // If URL already has protocol, use it as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Add https:// to URLs without protocol
    return `https://${url}`;
  };

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          {/* Title and Description */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              Student Government Resources
            </h1>
            <p className={styles.pageDescription}>
              Helpful guides, tools, and resources to support students at Minnesota State University.
            </p>
          </div>

          {/* Add Resource Button */}
          <div className={styles.addResourceSection}>
            {user && (
              <button
                onClick={handleAddResource}
                className={styles.addResourceButton}
              >
                <Plus className={styles.addResourceButtonIcon} />
                Add Resource
              </button>
            )}
          </div>

          {/* Pagination Top */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                <ChevronLeft className={styles.paginationButtonIcon} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`${styles.paginationPageButton} ${
                      currentPage === pageNum
                        ? styles.paginationPageButtonActive
                        : styles.paginationPageButtonInactive
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                <ChevronRight className={styles.paginationButtonIcon} />
              </button>
            </div>
          )}

          {/* Resource Items Grid */}
          {isLoading ? (
            <div className={styles.loadingState}>
              <p className={styles.loadingText}>Loading resources...</p>
            </div>
          ) : currentResources.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>No resources found.</p>
            </div>
          ) : (
            <div className={styles.resourcesGrid}>
              {currentResources.map((item) => (
                <div
                  key={item.id}
                  className={styles.resourceCard}
                  onMouseEnter={() => setHoveredCard(item.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => window.open(formatUrl(item.link), "_blank")}
                >
                  {/* Edit/Delete Buttons */}
                  {user && (sessionClaims?.role === "admin" || sessionClaims?.role === "coordinator" || user.id === item.created_by) && hoveredCard === item.id && (
                    <div className={styles.cardActions}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditResource(item);
                        }}
                        className={styles.cardActionButton}
                      >
                        <Edit className={`${styles.cardActionIcon} ${styles.cardActionIconEdit}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteResource(item.id);
                        }}
                        className={`${styles.cardActionButton} ${styles.cardActionButtonDelete}`}
                      >
                        <Trash2 className={`${styles.cardActionIcon} ${styles.cardActionIconDelete}`} />
                      </button>
                    </div>
                  )}

                  {/* Thumbnail/Preview */}
                  <div className={styles.cardThumbnail}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className={styles.cardThumbnailImage} />
                    ) : (
                      <BookOpen className={styles.cardThumbnailIcon} />
                    )}
                    {/* External Link Badge */}
                    <div className={styles.cardThumbnailBadge}>
                      <ExternalLink className={styles.cardThumbnailBadgeIcon} />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>
                      {item.title}
                    </h3>
                    <div className={styles.cardDescriptionContainer}>
                      {item.description && (
                        <>
                          <p className={styles.cardDescription}>
                            {item.description}
                          </p>
                          {item.description.length > 120 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDescriptionPopup({
                                  id: item.id,
                                  title: item.title,
                                  description: item.description || ''
                                });
                              }}
                              className={styles.cardReadMoreButton}
                            >
                              Read more
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Bottom */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                <ChevronLeft className={styles.paginationButtonIcon} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`${styles.paginationPageButton} ${
                      currentPage === pageNum
                        ? styles.paginationPageButtonActive
                        : styles.paginationPageButtonInactive
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                <ChevronRight className={styles.paginationButtonIcon} />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Description Popup */}
      {descriptionPopup && (
        <div className={styles.descriptionPopup}>
          <div 
            className={styles.modalBackdrop}
            onClick={() => setDescriptionPopup(null)}
          />
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>
              {descriptionPopup.title}
            </h3>
            <p className={styles.modalDescription}>
              {descriptionPopup.description}
            </p>
            <button
              onClick={() => setDescriptionPopup(null)}
              className={styles.modalCloseButton}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Resource Modal */}
      {isModalOpen && (
        <div className={styles.resourceModal}>
          {/* Backdrop with blur */}
          <div 
            className={styles.modalBackdrop}
            onClick={handleCloseModal}
          />
          
          {/* Modal */}
          <div className={styles.largeModalContent}>
            <h2 className={styles.modalFormTitle}>
              {editingResource ? "Edit Resource" : "Add Resource"}
            </h2>
            
            {/* Form Fields */}
            <div className={styles.formFields}>
              {/* Title */}
              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  Title <span className={styles.formRequired}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter resource title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              {/* Link */}
              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  Link <span className={styles.formRequired}>*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              {/* Image URL */}
              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              {/* Description */}
              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  Description
                </label>
                <textarea
                  placeholder="Provide details about this resource..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className={styles.formTextarea}
                />
                <p className={styles.formHelperText}>Maximum 500 characters</p>
              </div>

              {/* Buttons */}
              <div className={styles.formButtons}>
                <button
                  onClick={handleCloseModal}
                  className={`${styles.formButton} ${styles.formButtonCancel}`}
                >
                  <X className={styles.formButtonIcon} />
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className={`${styles.formButton} ${styles.formButtonSubmit}`}
                >
                  <Check className={styles.formButtonIcon} />
                  {editingResource ? "Update" : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Section */}
      <FeedbackSection />
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Plus, Play, ChevronLeft, ChevronRight, FileText, X, Check, Edit, Trash2, ClipboardList, FolderOpen } from "lucide-react";
import { useUser, useAuth } from "@clerk/nextjs";
import FeedbackSection from "../components/FeedbackSection/FeedbackSection";
import styles from './archives-page.module.css';

interface Archive {
  id: number;
  created_by: string;
  title: string;
  description: string | null;
  link: string;
  image_url: string | null;
  archive_type: string;
  created_at: string;
  updated_at: string;
  creator_username: string | null;
}

const ARCHIVE_TYPES = [
  { id: "all", label: "All Archives" },
  { id: "video", label: "Videos" },
  { id: "meeting_minutes", label: "Meeting Minutes" },
  { id: "document", label: "Documents" },
  { id: "misc", label: "Misc" },
];

export default function ArchivesPage() {
  const { user } = useUser();
  const { sessionClaims } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [archiveType, setArchiveType] = useState("document");
  const [allArchives, setAllArchives] = useState<Archive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingArchive, setEditingArchive] = useState<Archive | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [descriptionPopup, setDescriptionPopup] = useState<{id: number, title: string, description: string} | null>(null);

  const itemsPerPage = 12;

  // Fetch all archives once on mount - cache in state, filter client-side
  const fetchArchives = useCallback(async () => {
    try {
      const response = await fetch(`/api/get-archives?archive_type=all`, {
        cache: 'default', // Use browser cache
      });
      if (response.ok) {
        const data = await response.json();
        setAllArchives(data.archives);
      } else {
        console.error("Failed to fetch archives");
      }
    } catch (error) {
      console.error("Error fetching archives:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  // Filter archives client-side based on activeTab - no refetch needed!
  const archives = useMemo(() => {
    if (activeTab === "all") {
      return allArchives;
    }
    return allArchives.filter((archive) => archive.archive_type === activeTab);
  }, [allArchives, activeTab]);

  const handleAddFile = () => {
    setEditingArchive(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditArchive = (archive: Archive) => {
    setEditingArchive(archive);
    setTitle(archive.title);
    setLink(archive.link);
    setDescription(archive.description || "");
    setImageUrl(archive.image_url || "");
    setArchiveType(archive.archive_type);
    setIsModalOpen(true);
  };

  const handleDeleteArchive = async (archiveId: number) => {
    if (!confirm("Are you sure you want to delete this archive?")) {
      return;
    }

    // Optimistic update - remove from UI immediately
    const previousArchives = [...allArchives];
    setAllArchives((prev) => prev.filter((archive) => archive.id !== archiveId));

    try {
      const response = await fetch(`/api/delete-archive?id=${archiveId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Archive deleted successfully!");
        // Optionally refetch to ensure consistency, but UI already updated
        fetchArchives();
      } else {
        // Rollback on error
        setAllArchives(previousArchives);
        const error = await response.json();
        alert(`Failed to delete archive: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      // Rollback on error
      setAllArchives(previousArchives);
      console.error("Error deleting archive:", error);
      alert("Failed to delete archive. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
    setEditingArchive(null);
  };

  const resetForm = () => {
    setTitle("");
    setLink("");
    setDescription("");
    setImageUrl("");
    setArchiveType("document");
  };

  const handleConfirm = async () => {
    if (!title || !link || !archiveType) {
      alert("Please fill in all required fields (Title, Link, and Type)");
      return;
    }

    const payload = {
      title,
      link,
      description,
      image_url: imageUrl,
      archive_type: archiveType,
    };

    const isEdit = !!editingArchive;
    const previousArchives = [...allArchives];

    // Optimistic update
    if (isEdit && editingArchive) {
      setAllArchives((prev) =>
        prev.map((archive) =>
          archive.id === editingArchive.id
            ? {
                ...archive,
                title: payload.title,
                link: payload.link,
                description: payload.description,
                image_url: payload.image_url,
                archive_type: payload.archive_type,
              }
            : archive
        )
      );
    } else {
      // Optimistic add
      const tempArchive: Archive = {
        id: Date.now(), // Temporary ID
        created_by: user?.id || "",
        title: payload.title,
        link: payload.link,
        description: payload.description,
        image_url: payload.image_url,
        archive_type: payload.archive_type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        creator_username: null,
      };
      setAllArchives((prev) => [tempArchive, ...prev]);
    }

    try {
      const response = await fetch(isEdit ? "/api/update-archive" : "/api/add-archive", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { ...payload, id: editingArchive!.id } : payload),
      });

      if (response.ok) {
        alert(`Archive ${isEdit ? "updated" : "added"} successfully!`);
        handleCloseModal();
        // Refetch to get server data (with proper IDs, timestamps, etc.)
        fetchArchives();
      } else {
        // Rollback on error
        setAllArchives(previousArchives);
        const error = await response.json();
        alert(`Failed to ${isEdit ? "update" : "add"} archive: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      // Rollback on error
      setAllArchives(previousArchives);
      console.error("Error saving archive:", error);
      alert("Failed to save archive. Please try again.");
    }
  };

  const filteredArchives = archives.filter((archive) =>
    archive.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (archive.description && archive.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredArchives.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArchives = filteredArchives.slice(startIndex, endIndex);

  const formatUrl = (url: string) => {
    // If URL already has protocol, use it as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Add https:// to URLs without protocol
    return `https://${url}`;
  };

  const getYouTubeThumbnail = (url: string) => {
    try {
      const formattedUrl = formatUrl(url);
      const urlObj = new URL(formattedUrl);
      let videoId = null;

      // Handle different YouTube URL formats
      if (urlObj.hostname.includes('youtube.com')) {
        videoId = urlObj.searchParams.get('v');
      } else if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1);
      }

      if (videoId) {
        // Use hqdefault.jpg which is always available (480x360)
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const getImageUrl = (item: Archive) => {
    if (item.image_url) return item.image_url;
    
    // Try to get YouTube thumbnail if it's a video type
    if (item.archive_type === 'video') {
      const ytThumbnail = getYouTubeThumbnail(item.link);
      if (ytThumbnail) return ytThumbnail;
    }
    
    return null;
  };

  const getCounts = () => {
    const counts: Record<string, number> = { all: allArchives.length };
    allArchives.forEach((archive) => {
      counts[archive.archive_type] = (counts[archive.archive_type] || 0) + 1;
    });
    return counts;
  };

  const counts = getCounts();

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          {/* Title and Description */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              Student Government Archives
            </h1>
            <p className={styles.pageDescription}>
              Access historical documents, meeting recordings, and important resources from
              Minnesota State University Student Government.
            </p>
          </div>

          {/* Search Bar */}
          <div className={styles.searchSection}>
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search through our archives..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={styles.searchInput}
                // Debounce is handled by React's state batching, but we could add a debounce hook if needed
              />
            </div>
          </div>

          {/* Tabs and Add File Button */}
          <div className={styles.tabsAndAddSection}>
            <div className={styles.tabsContainer}>
              {ARCHIVE_TYPES.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`${styles.tabButton} ${
                    activeTab === tab.id
                      ? styles.tabButtonActive
                      : styles.tabButtonInactive
                  }`}
                >
                  {tab.label}{" "}
                  <span
                    className={`${styles.tabBadge} ${
                      activeTab === tab.id
                        ? styles.tabBadgeActive
                        : styles.tabBadgeInactive
                    }`}
                  >
                    {counts[tab.id] || 0}
                  </span>
                </button>
              ))}
            </div>
            {user && (
              <button
                onClick={handleAddFile}
                className={styles.addArchiveButton}
              >
                <Plus className={styles.addArchiveButtonIcon} />
                Add Archive
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

          {/* Archive Items Grid */}
          {isLoading ? (
            <div className={styles.loadingState}>
              <p className={styles.loadingText}>Loading archives...</p>
            </div>
          ) : currentArchives.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>No archives found.</p>
            </div>
          ) : (
            <div className={styles.archivesGrid}>
              {currentArchives.map((item) => (
                <div
                  key={item.id}
                  className={styles.archiveCard}
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
                          handleEditArchive(item);
                        }}
                        className={styles.cardActionButton}
                      >
                        <Edit className={`${styles.cardActionIcon} ${styles.cardActionIconEdit}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteArchive(item.id);
                        }}
                        className={`${styles.cardActionButton} ${styles.cardActionButtonDelete}`}
                      >
                        <Trash2 className={`${styles.cardActionIcon} ${styles.cardActionIconDelete}`} />
                      </button>
                    </div>
                  )}

                  {/* Thumbnail/Preview */}
                  <div className={styles.cardThumbnail}>
                    {getImageUrl(item) ? (
                      <img src={getImageUrl(item)!} alt={item.title} className={styles.cardThumbnailImage} />
                    ) : item.archive_type === "video" ? (
                      <div className={styles.cardThumbnailIconVideo}>
                        <Play className={styles.cardThumbnailIcon} fill="currentColor" />
                      </div>
                    ) : item.archive_type === "meeting_minutes" ? (
                      <ClipboardList className={`${styles.cardThumbnailIcon} ${styles.cardThumbnailIconDefault}`} />
                    ) : item.archive_type === "document" ? (
                      <FileText className={`${styles.cardThumbnailIcon} ${styles.cardThumbnailIconDefault}`} />
                    ) : (
                      <FolderOpen className={`${styles.cardThumbnailIcon} ${styles.cardThumbnailIconDefault}`} />
                    )}
                    {/* Type Badge */}
                    <div className={styles.cardThumbnailTypeBadge}>
                      {item.archive_type.charAt(0).toUpperCase() + item.archive_type.slice(1).replace('_', ' ')}
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
                          {item.description.length > 100 && (
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
                    <p className={styles.cardDate}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
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

      {/* Add/Edit Archive Modal */}
      {isModalOpen && (
        <div className={styles.archiveModal}>
          {/* Backdrop with blur */}
          <div 
            className={styles.modalBackdrop}
            onClick={handleCloseModal}
          />
          
          {/* Modal */}
          <div className={styles.largeModalContent}>
            <h2 className={styles.modalFormTitle}>
              {editingArchive ? "Edit Archive" : "Add Archive"}
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
                  placeholder="Enter archive title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              {/* Archive Type */}
              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  Archive Type <span className={styles.formRequired}>*</span>
                </label>
                <select
                  value={archiveType}
                  onChange={(e) => setArchiveType(e.target.value)}
                  className={styles.formSelect}
                >
                  {ARCHIVE_TYPES.filter(type => type.id !== "all").map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Link */}
              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  Link <span className={styles.formRequired}>*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/document.pdf"
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
                  placeholder="Provide details about this archive..."
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
                  {editingArchive ? "Update" : "Confirm"}
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

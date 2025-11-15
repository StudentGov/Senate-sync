"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Play, ChevronLeft, ChevronRight, FileText, X, Check, Edit, Trash2, ClipboardList, FolderOpen } from "lucide-react";
import { useUser } from "@clerk/nextjs";

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
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [archiveType, setArchiveType] = useState("document");
  const [archives, setArchives] = useState<Archive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingArchive, setEditingArchive] = useState<Archive | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [descriptionPopup, setDescriptionPopup] = useState<{id: number, title: string, description: string} | null>(null);

  const itemsPerPage = 12;

  useEffect(() => {
    fetchArchives();
  }, [activeTab]);

  const fetchArchives = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/get-archives?archive_type=${activeTab}`);
      if (response.ok) {
        const data = await response.json();
        setArchives(data.archives);
      } else {
        console.error("Failed to fetch archives");
      }
    } catch (error) {
      console.error("Error fetching archives:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

    try {
      const response = await fetch(`/api/delete-archive?id=${archiveId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Archive deleted successfully!");
        fetchArchives();
      } else {
        const error = await response.json();
        alert(`Failed to delete archive: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
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

    try {
      const payload = {
        title,
        link,
        description,
        image_url: imageUrl,
        archive_type: archiveType,
      };

      let response;
      if (editingArchive) {
        response = await fetch("/api/update-archive", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingArchive.id }),
        });
      } else {
        response = await fetch("/api/add-archive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        alert(`Archive ${editingArchive ? "updated" : "added"} successfully!`);
        handleCloseModal();
        fetchArchives();
      } else {
        const error = await response.json();
        alert(`Failed to ${editingArchive ? "update" : "add"} archive: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
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
    const counts: Record<string, number> = { all: archives.length };
    archives.forEach((archive) => {
      counts[archive.archive_type] = (counts[archive.archive_type] || 0) + 1;
    });
    return counts;
  };

  const counts = getCounts();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Title and Description */}
          <div className="text-center mb-8">
            <h1 className="font-bold text-3xl md:text-4xl text-[#49306e] mb-4 font-kanit">
              Student Government Archives
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto font-kanit">
              Access historical documents, meeting recordings, and important resources from
              Minnesota State University Student Government.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search through our archives..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49306e] focus:border-transparent font-kanit"
              />
            </div>
          </div>

          {/* Tabs and Add File Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
              {ARCHIVE_TYPES.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-md font-medium transition-colors font-kanit text-sm sm:text-base ${
                    activeTab === tab.id
                      ? "bg-[#49306e] text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}{" "}
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs sm:text-sm ${
                      activeTab === tab.id
                        ? "bg-white/20"
                        : "bg-gray-300"
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
                className="bg-[#49306e] hover:bg-[#49306e]/90 text-white font-semibold px-6 py-2 rounded-md flex items-center gap-2 transition-colors font-kanit"
              >
                <Plus className="w-5 h-5" />
                Add Archive
              </button>
            )}
          </div>

          {/* Pagination Top */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mb-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
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
                    className={`w-10 h-10 rounded-md font-medium transition-colors font-kanit ${
                      currentPage === pageNum
                        ? "bg-[#49306e] text-white"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}

          {/* Archive Items Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-kanit">Loading archives...</p>
            </div>
          ) : currentArchives.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-kanit">No archives found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {currentArchives.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
                  onMouseEnter={() => setHoveredCard(item.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => window.open(formatUrl(item.link), "_blank")}
                >
                  {/* Edit/Delete Buttons */}
                  {user && user.id === item.created_by && hoveredCard === item.id && (
                    <div className="absolute top-2 right-2 flex gap-2 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditArchive(item);
                        }}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        <Edit className="w-4 h-4 text-[#49306e]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteArchive(item.id);
                        }}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  )}

                  {/* Thumbnail/Preview */}
                  <div className="relative aspect-video bg-[#8b6ba8] flex items-center justify-center">
                    {getImageUrl(item) ? (
                      <img src={getImageUrl(item)!} alt={item.title} className="w-full h-full object-cover" />
                    ) : item.archive_type === "video" ? (
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-[#49306e] ml-1" fill="currentColor" />
                      </div>
                    ) : item.archive_type === "meeting_minutes" ? (
                      <ClipboardList className="w-16 h-16 text-[#febd11] opacity-80" />
                    ) : item.archive_type === "document" ? (
                      <FileText className="w-16 h-16 text-[#febd11] opacity-80" />
                    ) : (
                      <FolderOpen className="w-16 h-16 text-[#febd11] opacity-80" />
                    )}
                    {/* Type Badge */}
                    <div className="absolute top-3 right-3 bg-[#febd11] text-[#49306e] font-semibold px-2 py-1 rounded text-xs font-kanit">
                      {item.archive_type.charAt(0).toUpperCase() + item.archive_type.slice(1).replace('_', ' ')}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="bg-[#febd11] p-4 h-[160px] flex flex-col">
                    <h3 className="font-semibold text-[#49306e] mb-1 line-clamp-2 font-kanit">
                      {item.title}
                    </h3>
                    <div className="flex-1 mb-2">
                      {item.description && (
                        <>
                          <p className="text-sm text-[#49306e]/70 font-kanit line-clamp-2">
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
                              className="text-xs text-[#49306e] font-semibold hover:underline mt-1 font-kanit"
                            >
                              Read more
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    <p className="text-xs text-[#49306e]/60 font-kanit mt-auto">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Bottom */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
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
                    className={`w-10 h-10 rounded-md font-medium transition-colors font-kanit ${
                      currentPage === pageNum
                        ? "bg-[#49306e] text-white"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Description Popup */}
      {descriptionPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setDescriptionPopup(null)}
          />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-xl font-bold text-[#49306e] mb-3 font-kanit">
              {descriptionPopup.title}
            </h3>
            <p className="text-gray-700 font-kanit whitespace-pre-wrap">
              {descriptionPopup.description}
            </p>
            <button
              onClick={() => setDescriptionPopup(null)}
              className="mt-4 px-4 py-2 bg-[#49306e] hover:bg-[#49306e]/90 text-white rounded-lg font-kanit"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Archive Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#49306e] mb-6 font-kanit">
              {editingArchive ? "Edit Archive" : "Add Archive"}
            </h2>
            
            {/* Form Fields */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 font-kanit">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter archive title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49306e] focus:border-transparent font-kanit"
                />
              </div>

              {/* Archive Type */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 font-kanit">
                  Archive Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={archiveType}
                  onChange={(e) => setArchiveType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49306e] focus:border-transparent font-kanit"
                >
                  {ARCHIVE_TYPES.filter(type => type.id !== "all").map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Link */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 font-kanit">
                  Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/document.pdf"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49306e] focus:border-transparent font-kanit"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 font-kanit">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49306e] focus:border-transparent font-kanit"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 font-kanit">
                  Description
                </label>
                <textarea
                  placeholder="Provide details about this archive..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49306e] focus:border-transparent resize-none font-kanit"
                />
                <p className="text-sm text-gray-500 mt-2 font-kanit">Maximum 500 characters</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-kanit"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-6 py-3 bg-[#49306e] hover:bg-[#49306e]/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 font-kanit"
                >
                  <Check className="w-4 h-4" />
                  {editingArchive ? "Update" : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

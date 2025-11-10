"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, ExternalLink, X, Check, Edit, Trash2, BookOpen } from "lucide-react";
import { useUser } from "@clerk/nextjs";

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
      const response = await fetch(`/api/get-resources`);
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
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Title and Description */}
          <div className="text-center mb-8">
            <h1 className="font-bold text-3xl md:text-4xl text-[#49306e] mb-4 font-kanit">
              Student Government Resources
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto font-kanit">
              Helpful guides, tools, and resources to support students at Minnesota State University.
            </p>
          </div>

          {/* Add Resource Button */}
          <div className="flex justify-end mb-8">
            {user && (
              <button
                onClick={handleAddResource}
                className="bg-[#49306e] hover:bg-[#49306e]/90 text-white font-semibold px-6 py-2 rounded-md flex items-center gap-2 transition-colors font-kanit"
              >
                <Plus className="w-5 h-5" />
                Add Resource
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

          {/* Resource Items Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-kanit">Loading resources...</p>
            </div>
          ) : currentResources.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-kanit">No resources found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {currentResources.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative group"
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
                          handleEditResource(item);
                        }}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        <Edit className="w-4 h-4 text-[#49306e]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteResource(item.id);
                        }}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  )}

                  {/* Thumbnail/Preview */}
                  <div className="relative h-40 bg-gradient-to-br from-[#49306e] to-[#8b6ba8] flex items-center justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-12 h-12 text-white/90" />
                    )}
                    {/* External Link Badge */}
                    <div className="absolute top-3 right-3 bg-[#febd11] p-1.5 rounded-full">
                      <ExternalLink className="w-3 h-3 text-[#49306e]" />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 h-[160px] flex flex-col">
                    <h3 className="font-semibold text-[#49306e] mb-2 line-clamp-2 font-kanit">
                      {item.title}
                    </h3>
                    <div className="flex-1">
                      {item.description && (
                        <>
                          <p className="text-sm text-gray-600 font-kanit line-clamp-3">
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
                              className="text-xs text-[#49306e] font-semibold hover:underline mt-1 font-kanit"
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

      {/* Add/Edit Resource Modal */}
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
              {editingResource ? "Edit Resource" : "Add Resource"}
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
                  placeholder="Enter resource title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49306e] focus:border-transparent font-kanit"
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 font-kanit">
                  Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
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
                  placeholder="Provide details about this resource..."
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
                  {editingResource ? "Update" : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

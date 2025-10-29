"use client";

import { useState } from "react";
import { Search, Filter, Plus, Play, ChevronLeft, ChevronRight, FileText, X, Check } from "lucide-react";

interface ArchiveItem {
  id: string;
  title: string;
  date: string;
  type: "video" | "document";
  duration?: string;
  fileSize?: string;
  thumbnail?: string;
}

const ARCHIVE_ITEMS: ArchiveItem[] = [
  { id: "1", title: "Student Senate Meeting - Fall 2023", date: "October 15, 2023", type: "video", duration: "12:34", thumbnail: "meeting" },
  { id: "2", title: "Budget Proposal 2024", date: "September 22, 2023", type: "document", fileSize: "PDF • 2.4 MB" },
  { id: "3", title: "Campus Town Hall Discussion", date: "September 28, 2023", type: "video", duration: "8:42", thumbnail: "townhall" },
  { id: "4", title: "Meeting Minutes - September", date: "September 30, 2023", type: "document", fileSize: "DOCX • 156 KB" },
  { id: "5", title: "Student Fee Breakdown", date: "September 10, 2023", type: "document", fileSize: "XLSX • 892 KB" },
  { id: "6", title: "Student Senate Meeting - Fall 2023", date: "October 1, 2023", type: "video", duration: "12:34", thumbnail: "meeting" },
  { id: "7", title: "Orientation Presentation", date: "August 25, 2023", type: "document", fileSize: "PPTX • 3.8 MB" },
  { id: "8", title: "Constitution Amendment", date: "August 12, 2023", type: "document", fileSize: "PDF • 1.2 MB" },
  { id: "9", title: "Campus Town Hall Discussion", date: "September 28, 2023", type: "video", duration: "8:42", thumbnail: "townhall" },
  { id: "10", title: "Policy Recommendations", date: "July 15, 2023", type: "document", fileSize: "DOCX • 2.24 KB" },
  { id: "11", title: "Annual Report 2023", date: "June 30, 2023", type: "document", fileSize: "PDF • 3.7 MB" },
  { id: "12", title: "Campus Town Hall Discussion", date: "September 28, 2023", type: "video", duration: "8:42", thumbnail: "townhall" },
  { id: "13", title: "Student Senate Meeting - Fall 2023", date: "October 15, 2023", type: "video", duration: "12:34", thumbnail: "meeting" },
  { id: "14", title: "Budget Proposal 2024", date: "September 22, 2023", type: "document", fileSize: "PDF • 2.4 MB" },
  { id: "15", title: "Campus Town Hall Discussion", date: "September 28, 2023", type: "video", duration: "8:42", thumbnail: "townhall" },
  { id: "16", title: "Meeting Minutes - September", date: "September 30, 2023", type: "document", fileSize: "DOCX • 156 KB" },
];

const TABS = [
  { id: "all", label: "All Archives", count: 241 },
  { id: "videos", label: "Videos", count: 142 },
  { id: "documents", label: "Documents", count: 106 },
];

export default function ArchivesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [insertUrl, setInsertUrl] = useState("");
  const [fileDescription, setFileDescription] = useState("");

  const handleAddFile = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFileName("");
    setInsertUrl("");
    setFileDescription("");
  };

  const handleConfirm = () => {
    console.log("File added:", { fileName, insertUrl, fileDescription });
    handleCloseModal();
  };

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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49306e] focus:border-transparent font-kanit"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs and Add File Button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-4">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors font-kanit ${
                    activeTab === tab.id
                      ? "bg-[#49306e] text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}{" "}
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-sm ${
                      activeTab === tab.id
                        ? "bg-white/20"
                        : "bg-gray-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={handleAddFile}
              className="bg-[#49306e] hover:bg-[#49306e]/90 text-white font-semibold px-6 py-2 rounded-md flex items-center gap-2 transition-colors font-kanit"
            >
              <Plus className="w-5 h-5" />
              Add File
            </button>
          </div>

          {/* Pagination Top */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <button className="p-2 hover:bg-gray-200 rounded-md transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-md font-medium transition-colors font-kanit ${
                  currentPage === page
                    ? "bg-[#49306e] text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {page}
              </button>
            ))}
            <span className="px-2 text-gray-500">...</span>
            <button
              onClick={() => setCurrentPage(12)}
              className={`w-10 h-10 rounded-md font-medium transition-colors font-kanit ${
                currentPage === 12
                  ? "bg-[#49306e] text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              12
            </button>
            <button className="p-2 hover:bg-gray-200 rounded-md transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Archive Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {ARCHIVE_ITEMS.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Thumbnail/Preview */}
                <div className="relative aspect-video bg-[#8b6ba8] flex items-center justify-center">
                  {item.type === "video" ? (
                    <>
                      {/* Video Preview Placeholder */}
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-[#49306e] ml-1" fill="currentColor" />
                      </div>
                      {/* Duration Badge */}
                      <div className="absolute top-3 right-3 bg-[#febd11] text-[#49306e] font-semibold px-2 py-1 rounded text-sm font-kanit">
                        {item.duration}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Document Icon */}
                      <FileText className="w-16 h-16 text-[#febd11] opacity-80" />
                    </>
                  )}
                </div>

                {/* Card Content */}
                <div className="bg-[#febd11] p-4">
                  <h3 className="font-semibold text-[#49306e] mb-1 line-clamp-2 font-kanit">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#49306e]/70 font-kanit">
                    {item.type === "video" ? item.date : item.fileSize}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Bottom */}
          <div className="flex items-center justify-center gap-2">
            <button className="p-2 hover:bg-gray-200 rounded-md transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-md font-medium transition-colors font-kanit ${
                  currentPage === page
                    ? "bg-[#49306e] text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {page}
              </button>
            ))}
            <span className="px-2 text-gray-500">...</span>
            <button
              onClick={() => setCurrentPage(12)}
              className={`w-10 h-10 rounded-md font-medium transition-colors font-kanit ${
                currentPage === 12
                  ? "bg-[#49306e] text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              12
            </button>
            <button className="p-2 hover:bg-gray-200 rounded-md transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </main>

      {/* Add File Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-8">
            {/* Form Fields */}
            <div className="space-y-6">
              {/* File Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 font-kanit">
                  File Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter file name"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49306e] focus:border-transparent font-kanit"
                />
              </div>

              {/* Insert URL */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 font-kanit">
                  Insert Url <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Choose File From"
                  value={insertUrl}
                  onChange={(e) => setInsertUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49306e] focus:border-transparent font-kanit"
                />
              </div>

              {/* File Description */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 font-kanit">
                  File Description
                </label>
                <textarea
                  placeholder="Provide details about the file, including agenda, requirements, or special instructions..."
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  maxLength={100}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49306e] focus:border-transparent resize-none font-kanit"
                />
                <p className="text-sm text-gray-500 mt-2 font-kanit">Maximum 100 characters</p>
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
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


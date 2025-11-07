"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import Image from "next/image";

interface ResourceItem {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
}

const RESOURCES: ResourceItem[] = [
  {
    id: "1",
    title: "Student Senate Meeting - Fall 2023",
    date: "October 15, 2023",
    imageUrl: "/images/kic.png"
  },
  {
    id: "2",
    title: "Student Senate Meeting - Fall 2023",
    date: "October 15, 2023",
    imageUrl: "/images/kic.png"
  },
  {
    id: "3",
    title: "Student Senate Meeting - Fall 2023",
    date: "October 15, 2023",
    imageUrl: "/images/kic.png"
  },
  {
    id: "4",
    title: "Student Senate Meeting - Fall 2023",
    date: "October 15, 2023",
    imageUrl: "/images/kic.png"
  },
];

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="flex-1 bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Title and Description */}
        <div className="text-center mb-8">
          <h1 className="font-bold text-3xl md:text-4xl text-[#49306e] mb-4">
            Student Government Resources
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Access historical documents, meeting recordings, and important resources from
            Minnesota State University Student Government.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search through our resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49306e] focus:border-transparent"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resources Grid - 2x2 */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {RESOURCES.map((resource) => (
              <div
                key={resource.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
                style={{ width: '604px', height: '728px' }}
              >
                {/* Image Section */}
                <div className="relative bg-white flex items-center justify-center p-8" style={{ height: '500px' }}>
                  <Image
                    src={resource.imageUrl}
                    alt={resource.title}
                    width={400}
                    height={300}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Card Footer - Yellow Section */}
                <div className="bg-[#FFCC33] p-6 mt-auto">
                  <h3 
                    className="text-black mb-2 line-clamp-2"
                    style={{ 
                      fontFamily: 'Kanit, sans-serif',
                      fontWeight: 600,
                      fontSize: '20px',
                      lineHeight: '1.3'
                    }}
                  >
                    {resource.title}
                  </h3>
                  <p 
                    className="text-[#6B7280]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '12px'
                    }}
                  >
                    {resource.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}


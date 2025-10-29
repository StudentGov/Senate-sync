"use client";

import { useState } from "react";

interface UserFormProps {
  onSubmit: (data: any) => void;
}

export const UserForm = ({ onSubmit }: UserFormProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    techId: "",
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-bold text-xl text-gray-900 mb-6">Your Information</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:border-[#49306e] focus:outline-none"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:border-[#49306e] focus:outline-none"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label htmlFor="techId" className="block font-medium text-gray-700 mb-2">
            Tech ID *
          </label>
          <input
            type="text"
            id="techId"
            name="techId"
            required
            value={formData.techId}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:border-[#49306e] focus:outline-none"
            placeholder="Enter your Tech ID"
          />
        </div>

        <div>
          <label htmlFor="reason" className="block font-medium text-gray-700 mb-2">
            Reason for Appointment *
          </label>
          <textarea
            id="reason"
            name="reason"
            required
            value={formData.reason}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:border-[#49306e] focus:outline-none resize-none"
            placeholder="Briefly describe your legal concern..."
          />
        </div>
      </form>
    </div>
  );
};


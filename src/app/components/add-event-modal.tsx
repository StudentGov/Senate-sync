"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { getAllEventTypes } from "@/lib/eventTypes";
import { CreateEventRequest } from "@/types/calendar";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventAdded?: () => void;
}

export default function AddEventModal({ isOpen, onClose, onEventAdded }: AddEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventType, setEventType] = useState<string>("misc");
  const [isAllDay, setIsAllDay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventTypes = getAllEventTypes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !startDate || !eventType) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time for start_time
      const start_time = isAllDay 
        ? `${startDate}T00:00:00`
        : `${startDate}T${startTime || "09:00"}:00`;

      // Combine date and time for end_time if provided
      let end_time = undefined;
      if (endDate) {
        end_time = isAllDay 
          ? `${endDate}T23:59:59`
          : `${endDate}T${endTime || "17:00"}:00`;
      }

      const payload: CreateEventRequest = {
        title,
        description: description || undefined,
        location: location || undefined,
        start_time,
        end_time,
        is_all_day: isAllDay,
        event_type: eventType as any,
      };

      const response = await fetch("/api/add-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Event added successfully!");
        
        // Reset form
        setTitle("");
        setDescription("");
        setLocation("");
        setStartDate("");
        setStartTime("");
        setEndDate("");
        setEndTime("");
        setEventType("misc");
        setIsAllDay(false);
        
        // Notify parent and close
        onEventAdded?.();
        onClose();
      } else {
        const error = await response.json();
        alert(`Failed to add event: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Failed to add event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mt-[5vh] w-[90vw] max-w-lg max-h-[80vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Event</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              required
            />
          </div>

          {/* Event Type */}
          <div className="grid gap-2">
            <Label htmlFor="event-type">
              Event Type <span className="text-red-500">*</span>
            </Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger id="event-type">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter event description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Location */}
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter event location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={255}
            />
          </div>

          {/* All Day Event Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="all-day"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="all-day" className="cursor-pointer">
              All-day event
            </Label>
          </div>

          {/* Start Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start-date">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            {!isAllDay && (
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* End Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
            {!isAllDay && (
              <div className="grid gap-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-[#63439a] hover:bg-[#8257cb]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding Event..." : "Add Event"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}


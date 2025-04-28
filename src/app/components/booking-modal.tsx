"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon, Clock, Info, Loader2 } from "lucide-react";
// 🛠️ Import Clerk hook to get current user ID
import { useUser } from "@clerk/nextjs";

interface Slot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | undefined;
  timeSlot: Slot | null;
}

export default function BookingModal({ isOpen, onClose, date, timeSlot }: BookingModalProps) {
  const { user } = useUser(); // 🛠️ get current user
  const userId = user?.id; // 🛠️ safely grab userId

  const [starId, setStarId] = useState("");
  const [techId, setTechId] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!starId.trim()) newErrors.starId = "Star ID is required";
    if (!techId.trim()) newErrors.techId = "Tech ID is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!timeSlot) newErrors.timeSlot = "No slot selected";
    if (!userId) newErrors.userId = "No student ID found";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/student/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: timeSlot!.id,
          starId,
          techId,
          description,
          studentId: userId, // 🛠️ Now correctly send Clerk student ID
        }),
      });

      if (!res.ok) throw new Error("Booking failed");

      alert("✅ Appointment booked successfully!");
      onClose();
    } catch (error) {
      console.error("Booking error:", error);
      alert("❌ Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
      setStarId("");
      setTechId("");
      setDescription("");
      setErrors({});
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[500px] max-w-[90vw] max-h-[90vh] p-0 overflow-auto bg-white">
        <DialogHeader className="bg-primary text-primary-foreground p-6">
          <DialogTitle className="text-2xl">Complete Your Booking</DialogTitle>
          <p className="text-primary-foreground/80 text-sm">Please provide the required information</p>
        </DialogHeader>

        {date && timeSlot && (
          <div className="bg-muted/50 p-4 border-b">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm">{format(date, "EEEE, MMMM d, yyyy")}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 mt-3">
              <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm">{timeSlot.start_time} - {timeSlot.end_time}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-5 py-2">
            <div className="grid gap-2">
              <Label htmlFor="starId">Star ID</Label>
              <Input
                id="starId"
                value={starId}
                onChange={(e) => setStarId(e.target.value)}
                placeholder="Enter Star ID"
                className={errors.starId ? "border-red-500" : ""}
              />
              {errors.starId && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <Info className="h-3 w-3 mr-1" /> {errors.starId}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="techId">Tech ID</Label>
              <Input
                id="techId"
                value={techId}
                onChange={(e) => setTechId(e.target.value)}
                placeholder="Enter Tech ID"
                className={errors.techId ? "border-red-500" : ""}
              />
              {errors.techId && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <Info className="h-3 w-3 mr-1" /> {errors.techId}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your appointment"
                rows={3}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <Info className="h-3 w-3 mr-1" /> {errors.description}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                "Book Appointment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

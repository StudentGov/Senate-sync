'use client';
import { useEffect } from 'react';
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

interface AgendaProps {
  agenda: {
    id: number;
    title: string;
    is_visible: boolean;
    is_open: boolean;
    created_at: string;
    description: string;
  };
  showDetails: boolean;
  setShowDetails: (details: boolean) => void;
  selectedVote: string;
}

export default function Details({ agenda, showDetails, setShowDetails, selectedVote }: AgendaProps) {
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  useEffect(() => {
    if (showDetails) {
      document.body.classList.add("active-modal");
    } else {
      document.body.classList.remove("active-modal");
    }
  }, [showDetails]);

  const isVotingOpen = agenda.is_open;
  const isVisible = agenda.is_visible;

  return (
    <Dialog open={showDetails} onOpenChange={toggleDetails}>
      <DialogContent className="w-[90vw] max-w-lg p-0 max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader className="bg-purple-800 text-white p-6 relative">
          <DialogTitle className="text-xl font-bold break-words whitespace-normal">Details</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={toggleDetails}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-4 p-6">
          {/* Title */}
          {/* <div className="p-3 bg-gray-50 rounded-md min-h-[80px] break-all whitespace-normal"> */}
          <div className="space-y-1 break-all whitespace-normal">
            <p className="text-sm font-medium text-gray-500 ">Title:</p>
            <p className="font-semibold break-words whitespace-normal">{agenda.title}</p>
          </div>

          {/* Your Vote */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Your Vote:</p>
            <p>{selectedVote || "N/A"}</p>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Status:</p>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  isVotingOpen
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }
              >
                {isVotingOpen ? "Open" : "Closed"}
              </Badge>
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Visibility:</p>
            <p>{isVisible ? "Visible" : "Hidden"}</p>
          </div>

          {/* Created At */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Created At:</p>
            <p>{new Date(agenda.created_at).toISOString().split("T")[0]}</p>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Description:</p>
            <div className="p-3 bg-gray-50 rounded-md min-h-[80px] break-all whitespace-normal">
                {agenda.description || (
                <p className="text-gray-400 italic">No description provided</p>
                )}
            </div>
            </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2 p-6">
          <Button variant="outline" onClick={toggleDetails}   className="bg-purple-800 text-white hover:bg-[#5b3a8b]">
            Back
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

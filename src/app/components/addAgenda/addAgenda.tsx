
"use client";

import { useState} from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";

interface User {
  id: string;
}

interface AddAgendaModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddAgendaModal({ user, isOpen, onClose }: AddAgendaModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [message, setMessage] = useState("");

  const handleAddOption = () => {
    if (newOption.trim() !== "") {
      setOptions((prev) => [...prev, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  async function addAgenda() {
    try {
      const response = await fetch("/api/add-agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speaker_id: user.id,
          title: title.trim(),
          options: options,
          description: description.trim(),
        }),
      });

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error adding agenda:", error);
    }
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      setMessage("Agenda is missing");
    } else if (options.length === 0) {
      setMessage("Options are missing");
    } else {
      addAgenda();
      setMessage("Added agenda successfully");
      setTitle("");
      setDescription("");
      setOptions([]);
      setNewOption("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mt-[5vh] w-[90vw] max-w-lg max-h-[80vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Write Agenda</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter Agenda"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Options */}
          <div className="grid gap-2">
            <Label>Options</Label>
            <div className="bg-gray-200 p-4 rounded-md">
              {options.map((option, index) => (
                <div key={index} className="flex items-center justify-between mb-2 last:mb-0">
                  <span className="text-sm">{option}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-600"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Option */}
          <div className="grid gap-2">
            <Label htmlFor="add-option">Add Option</Label>
            <div className="flex gap-2">
              <Input
                id="add-option"
                placeholder="Enter Option"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newOption.trim() !== "") {
                    e.preventDefault();
                    handleAddOption();
                  }
                }}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddOption}
                disabled={newOption.trim() === ""}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter your description here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="sm:justify-center gap-2">
          <div className="text-center text-sm text-green-700">{message}</div>
          <Button
            className="bg-[#63439a] hover:bg-[#8257cb]"
            onClick={handleSubmit}
            disabled={title.trim() === ""}
          >
            Push Agenda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

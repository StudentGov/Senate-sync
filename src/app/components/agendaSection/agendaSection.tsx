"use client";

import { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import VoteModal from "../../components/vote-modal";
import PieChart from "../../components/pieChart/pieChart";
import Details from "../../components/details/Details";
import Confirmation from "../../components/confirmation/Confirmation";

interface Option {
  id: number;
  optionText: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface AgendaProps {
  agenda: {
    id: number;
    title: string;
    is_visible: boolean;
    is_open: boolean;
    created_at: string;
    options: Option[];
    description: string;
  };
  page: string;
  isMember: boolean;
  isSpeaker: boolean;
  user: User;
}

export default function AgendaSection({ agenda, page, isMember, isSpeaker, user }: AgendaProps) {
  const [visible, setVisible] = useState<boolean>(agenda.is_visible);
  const [selectedOption, setSelectedOption] = useState<Option>({ id: -1, optionText: "" });
  const [userChangedVote, setUserChangedVote] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [confirmationOption, setConfirmationOption] = useState<string>("");
  const [voteModalOpen, setVoteModalOpen] = useState(false);

  const toggleDetails = () => setShowDetails((prev) => !prev);

  async function handleToggle() {
    const newVisibility = !visible;
    setVisible(newVisibility);
    try {
      await fetch("/api/update-agenda-visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agenda_id: agenda.id,
          is_visible: newVisibility,
        }),
      });
    } catch (error) {
      console.error("Error updating visibility:", error);
    }
  }

  async function handleClose() {
    try {
      await fetch("/api/handle-close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agenda_id: agenda.id }),
      });
    } catch (error) {
      console.error("Error closing agenda:", error);
    }
  }

  useEffect(() => {
    if (confirmationOption === "confirm") {
      handleClose();
    }
  }, [confirmationOption]);

  useEffect(() => {
    async function getUserVote() {
      try {
        const response = await fetch("/api/get-vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voter_id: user.id, agenda_id: agenda.id }),
        });
        const data = await response.json();
        if (data.optionText === "N/A" || !data.optionText) {
          setSelectedOption({ id: -1, optionText: "N/A" });
        } else {
          setSelectedOption({ id: data.option_id, optionText: data.optionText });
        }
      } catch (error) {
        console.error("Failed to fetch user vote:", error);
      }
    }
    getUserVote();
  }, [user.id, agenda.id]);

  useEffect(() => {
    async function handleVoteSubmit() {
      if (!selectedOption || selectedOption.optionText === "N/A") return;
      setUserChangedVote(false);
      try {
        await fetch("/api/update-user-vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            voter_id: user.id,
            agenda_id: agenda.id,
            name: `${user.firstName} ${user.lastName}`,
            option_id: selectedOption.id,
          }),
        });
      } catch (error) {
        console.error("Error submitting vote:", error);
      }
    }
    if (userChangedVote) {
      handleVoteSubmit();
    }
  }, [selectedOption, user.id, agenda.id]);

  return (
    <>
      <Card
        className={`p-4 hover:shadow-md transition-shadow ${
          agenda.is_open ? "" : "opacity-70"
        } cursor-pointer`}
      >
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Left Half - full height clickable */}
          <div
            className="col-span-12 sm:col-span-5 flex items-center h-full w-full"
            onClick={toggleDetails}
          >
            <h3 className="font-medium truncate w-full">{agenda.title}</h3>
          </div>


          {/* Date */}
          <div className="col-span-6 sm:col-span-3 text-gray-600">
            {new Date(agenda.created_at).toISOString().split("T")[0]}
          </div>

          {/* Visibility Toggle */}
          {isSpeaker && (
            <div className="col-span-6 sm:col-span-2 flex justify-end sm:justify-center">
              <Switch
                checked={visible}
                onCheckedChange={handleToggle}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Badge for Past */}
          {page === "past" && !isSpeaker && (
            <div className="col-span-6 sm:col-span-2 flex justify-end sm:justify-center">
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                Closed
              </Badge>
            </div>
          )}

          {/* Action Buttons */}
          <div className="col-span-12 sm:col-span-2 flex flex-wrap gap-2 mt-2 sm:mt-0 justify-end sm:justify-center">
            {isMember && agenda.is_open && selectedOption.optionText === "N/A" && (
              <Button
                variant="default"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setVoteModalOpen(true);
                }}
              >
                Vote
              </Button>
            )}
            {isSpeaker && agenda.is_open && (
              <Button
                variant="default"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirmation(true);
                }}
              >
                Close
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={(e) => {
                e.stopPropagation();
                toggleDetails();
              }}
            >
              View {isMember ? "Details" : "Voting"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Modals */}
      {voteModalOpen && (
        <VoteModal
          isOpen={voteModalOpen}
          onClose={() => setVoteModalOpen(false)}
          options={agenda.options}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          setUserChangedVote={setUserChangedVote}
        />
      )}

      {showDetails && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-white p-6 rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Details
              agenda={agenda}
              showDetails={showDetails}
              setShowDetails={setShowDetails}
              selectedVote={selectedOption.optionText}
            />
          </div>
        </div>
      )}

      {showConfirmation && (
        <Confirmation
          showConfirmation={showConfirmation}
          setShowConfirmation={setShowConfirmation}
          setConfirmationOption={setConfirmationOption}
          question="Are you sure you want to close the Agenda?"
        />
      )}
    </>
  );
}

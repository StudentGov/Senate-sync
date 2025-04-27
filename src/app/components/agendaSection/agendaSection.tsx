"use client"

import { useEffect, useState } from "react"
import { Card } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Switch } from "../../components/ui/switch"
import VoteModal from "../../components/vote-modal"
import PieChart from "../../components/pieChart/pieChart"
import Details from "../../components/details/Details"
import { Alert, AlertDescription } from "../ui/alert"
import { AlertTriangle } from "lucide-react"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter} from "../ui/dialog"

interface Option {
  id: number
  optionText: string
}

interface User {
  id: string
  firstName: string
  lastName: string
}

interface AgendaProps {
  agenda: {
    id: number
    title: string
    is_visible: boolean
    is_open: boolean
    created_at: string
    options: Option[]
    description: string
  }
  page: string
  isMember: boolean
  isSpeaker: boolean
  user: User
}

export default function AgendaSection({
  agenda,
  page,
  isMember,
  isSpeaker,
  user,
}: AgendaProps) {
  const [visible, setVisible] = useState<boolean>(agenda.is_visible)
  const [selectedOption, setSelectedOption] = useState<Option>({
    id: -1,
    optionText: "",
  })
  const [userChangedVote, setUserChangedVote] = useState<boolean>(false)
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [voteModalOpen, setVoteModalOpen] = useState(false)

  // NEW: control close-confirm dialog
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)

  const toggleDetails = () => setShowDetails((prev) => !prev)

  async function handleToggle() {
    const newVisibility = !visible
    setVisible(newVisibility)
    try {
      await fetch("/api/update-agenda-visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agenda_id: agenda.id,
          is_visible: newVisibility,
        }),
      })
    } catch (error) {
      console.error("Error updating visibility:", error)
    }
  }

  async function handleClose() {
    try {
      await fetch("/api/handle-close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agenda_id: agenda.id }),
      })
    } catch (error) {
      console.error("Error closing agenda:", error)
    }
    setShowCloseConfirm(false)
  }

  useEffect(() => {
    async function getUserVote() {
      try {
        const response = await fetch("/api/get-vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voter_id: user.id, agenda_id: agenda.id }),
        })
        const data = await response.json()
        if (!data.optionText || data.optionText === "N/A") {
          setSelectedOption({ id: -1, optionText: "N/A" })
        } else {
          setSelectedOption({
            id: data.option_id,
            optionText: data.optionText,
          })
        }
      } catch (error) {
        console.error("Failed to fetch user vote:", error)
      }
    }
    getUserVote()
  }, [user.id, agenda.id])

  useEffect(() => {
    async function handleVoteSubmit() {
      if (selectedOption.optionText === "N/A") return
      setUserChangedVote(false)
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
        })
      } catch (error) {
        console.error("Error submitting vote:", error)
      }
    }
    if (userChangedVote) {
      handleVoteSubmit()
    }
  }, [selectedOption, userChangedVote, user.id, agenda.id])

  return (
    <>
      <Card
        className="hover:shadow-md transition-shadow cursor-pointer p-4 sm:p-6"
        onClick={toggleDetails}
      >
        <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center h-full w-full">
          {/* Title */}
          <div className="col-span-12 sm:col-span-5 flex items-center h-full">
            <h3 className="font-semibold text-gray-800 truncate w-full">
              {agenda.title}
            </h3>
          </div>

          {/* Date */}
          <div
            className="col-span-6 sm:col-span-3 text-gray-600 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {new Date(agenda.created_at).toISOString().split("T")[0]}
          </div>

          {/* Vote / Visibility */}
          <div
            className="col-span-6 sm:col-span-2 flex justify-end sm:justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {isSpeaker && page !== "past" ? (
              <Switch
                checked={visible}
                onCheckedChange={handleToggle}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-gray-700 font-semibold text-sm">
                {selectedOption.optionText}
              </span>
            )}
          </div>

          {/* Actions */}
          <div
            className="col-span-12 sm:col-span-2 flex flex-wrap justify-end sm:justify-center gap-2 mt-2 sm:mt-0"
            onClick={(e) => e.stopPropagation()}
          >
            {isMember && agenda.is_open && selectedOption.optionText === "N/A" && (
              <Button
                variant="default"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setVoteModalOpen(true)}
              >
                Vote
              </Button>
            )}
            {isSpeaker && agenda.is_open && (
              <Button
                variant="default"
                size="sm"
                className="bg-red-600 hover:bg-red-800"
                onClick={() => setShowCloseConfirm(true)}
              >
                Close
              </Button>
            )}
            <PieChart agenda={agenda} isSpeaker={isSpeaker} />
          </div>
        </div>
      </Card>

      {/* Vote Modal */}
      {voteModalOpen && (
        <VoteModal
          isOpen={voteModalOpen}
          onClose={() => setVoteModalOpen(false)}
          options={agenda.options}
          setSelectedOption={setSelectedOption}
          selectedOption={selectedOption}
          setUserChangedVote={setUserChangedVote}
        />
      )}

      {/* Details Drawer */}
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

      {/* CLOSE Confirmation Dialog */}
      <Dialog
        open={showCloseConfirm}
        onOpenChange={(open) => {
          if (!open) setShowCloseConfirm(false)
        }}
      >
        <DialogContent className="w-[90vw] max-w-md max-h-[90vh] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Confirm Close
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Please confirm you want to close this agenda.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Once closed, this agenda cannot be reopened. Are you sure you
                want to proceed?
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="sm:justify-center gap-2">
            <Button variant="outline" onClick={() => setShowCloseConfirm(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleClose}
            >
              Confirm Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

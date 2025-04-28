'use client'

import { useState } from 'react'
import { Check, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/ui/dialog"
import { Button } from "../components/ui/button"
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'
import { Label } from "../components/ui/label"
import { Alert, AlertDescription } from "../components/ui/alert"

interface Option {
  id: number;
  optionText: string;
}

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: Option[];
  selectedOption: Option | null;
  setSelectedOption: (option: Option) => void;
  setUserChangedVote?: ((vote: boolean) => void) | null;
}

export default function VoteModal({
  isOpen,
  onClose,
  options,
  setSelectedOption,
  setUserChangedVote
}: VoteModalProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [tempSelectedOption, setTempSelectedOption] = useState<Option | null>(null)

  const handleSubmit = () => {
    if (!showConfirmation) {
      setShowConfirmation(true)
      return
    }

    if (tempSelectedOption) {
      setSelectedOption(tempSelectedOption)
      if (setUserChangedVote) setUserChangedVote(true)
      setShowConfirmation(false)
      setTempSelectedOption(null)
      onClose()
    }
  }

  const handleCancel = () => {
    if (showConfirmation) {
      setShowConfirmation(false)
      setTempSelectedOption(null)
    } else {
      onClose()
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setShowConfirmation(false)
        setTempSelectedOption(null)
        onClose()
      }}
    >
      <DialogContent className="w-[90vw] max-w-md max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {showConfirmation ? "Confirm Your Vote" : "Cast Your Vote"}
          </DialogTitle>
          {showConfirmation && (
            <DialogDescription className="text-center pt-2">Please confirm your selection</DialogDescription>
          )}
        </DialogHeader>

        {showConfirmation ? (
          <div className="py-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Once submitted, your vote cannot be changed. Are you sure you want to proceed?
              </AlertDescription>
            </Alert>

            <div className="mt-4 p-3 border rounded-lg bg-gray-50">
              <p className="font-medium">Your selection:</p>
              <p className="text-lg font-semibold text-purple-700 mt-1">
                {tempSelectedOption?.optionText || "No option selected"}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <RadioGroup
              value={tempSelectedOption?.id.toString() || ""}
              onValueChange={(value) => {
                const foundOption = options.find((opt) => opt.id.toString() === value)
                if (foundOption) setTempSelectedOption(foundOption)
              }}
              className="space-y-3"
            >
              {options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setTempSelectedOption(option)}
                >
                  <RadioGroupItem value={option.id.toString()} id={option.id.toString()} />
                  <Label htmlFor={option.id.toString()} className="flex-1 cursor-pointer font-medium">
                    {option.optionText}
                  </Label>
                  {tempSelectedOption?.id === option.id && <Check className="h-4 w-4 text-green-500" />}
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        <DialogFooter className="sm:justify-center gap-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {showConfirmation ? "Back" : "Cancel"}
          </Button>
          <Button
            type="button"
            disabled={!tempSelectedOption}
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleSubmit}
          >
            {showConfirmation ? "Confirm Vote" : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

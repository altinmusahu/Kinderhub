"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { XIcon } from "lucide-react"

export function ViewUserModal({ userId, triggerLabel = "View", children }: { userId: string, triggerLabel?: string, children?: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">{triggerLabel}</Button>
      </DialogTrigger>

      <DialogContent>
        <div className="kh-modal-content">
          <DialogHeader>
            <DialogTitle className="kh-modal-title">Member details</DialogTitle>
            <DialogDescription className="kh-modal-description">View additional information for user {userId}.</DialogDescription>
          </DialogHeader>

          <div className="kh-card" style={{ padding: 16 }}>
            {children ?? (
              <div className="text-sm text-slate-500">
                No details loaded. Fetch and render user details here.
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <DialogClose>
              <Button variant="ghost" size="icon-sm">
                <XIcon />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ViewUserModal

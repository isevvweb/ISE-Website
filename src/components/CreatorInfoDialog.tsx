import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

interface CreatorInfoDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatorInfoDialog: React.FC<CreatorInfoDialogProps> = ({ isOpen, onOpenChange }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Website Information</DialogTitle>
          <DialogDescription>
            Details about the website and its creator.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-medium">Creator:</span>
            <a href="https://abaleemmo.github.io/" target="_blank" rel="noopener noreferrer" className="col-span-3 text-blue-600 hover:underline">
              Abdul-Aleem Mohammed
            </a>
          </div>
          {/* Creator's Email removed */}
          {/* Portfolio section removed */}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-medium">Admin Page:</span>
            <Link to="/admin" className="col-span-3 text-blue-600 hover:underline" onClick={() => onOpenChange(false)}>
              Go to Admin
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
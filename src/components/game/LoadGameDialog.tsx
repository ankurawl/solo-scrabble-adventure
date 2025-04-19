import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LoadGameDialogProps {
  isOpen: boolean;
  lastSaved: string;
  onClose: () => void;
  onLoadGame: () => void;
  onContinueCurrentGame: () => void;
}

const LoadGameDialog: React.FC<LoadGameDialogProps> = ({
  isOpen,
  lastSaved,
  onClose,
  onLoadGame,
  onContinueCurrentGame,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Previous Game Found</DialogTitle>
          <DialogDescription>
            We found a previously saved game from {lastSaved}. Would you like to load it?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between mt-4">
          <Button onClick={onContinueCurrentGame} variant="outline" className="w-full sm:w-auto">
            Continue Current Game
          </Button>
          <Button onClick={onLoadGame} className="w-full sm:w-auto">
            Load Saved Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoadGameDialog; 
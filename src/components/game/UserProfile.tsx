import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Save } from 'lucide-react';

interface UserProfileProps {
  onSaveGame: () => Promise<void>;
}

const UserProfile: React.FC<UserProfileProps> = ({ onSaveGame }) => {
  const { currentUser, isLoading, signIn, signOut } = useAuth();

  if (isLoading) {
    return (
      <Button disabled variant="ghost" size="sm" className="flex items-center gap-2">
        <span className="w-4 h-4 rounded-full bg-gray-300 animate-pulse"></span>
        <span className="text-xs">Loading...</span>
      </Button>
    );
  }

  if (!currentUser) {
    return (
      <Button onClick={signIn} variant="outline" size="sm" className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <span className="text-xs">Sign In</span>
      </Button>
    );
  }

  const userInitials = currentUser.displayName
    ? currentUser.displayName.split(' ').map(n => n[0]).join('')
    : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 px-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={currentUser.photoURL || ''} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <span className="text-xs hidden sm:inline-block max-w-[100px] truncate">
            {currentUser.displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onSaveGame} className="cursor-pointer flex items-center gap-2">
          <Save className="h-4 w-4" />
          <span>Save Game</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut} className="cursor-pointer flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile; 
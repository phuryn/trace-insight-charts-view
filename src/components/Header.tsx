
import React from 'react';
import { ClipboardCheck, LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { user, userRole, signOut } = useAuth();
  const isMobile = useIsMobile();

  return (
    <header className="bg-white shadow-sm py-4 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <ClipboardCheck className="h-6 w-6 text-blue-600 flex-shrink-0" />
        <h1 className="text-xl font-semibold">LLM Trace Evaluator</h1>
      </div>
      
      {user && (
        <>
          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user.email}
                  </div>
                </DropdownMenuLabel>
                {userRole && (
                  <DropdownMenuItem disabled className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {userRole}
                    </span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-1" />
                    <span>{user.email}</span>
                    {userRole && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {userRole}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Signed in as {userRole || 'User'}</p>
                </TooltipContent>
              </Tooltip>
              
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          )}
        </>
      )}
    </header>
  );
};

export default Header;

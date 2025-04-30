
import React from 'react';
import { ClipboardCheck, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const Header = () => {
  const { user, userRole, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <ClipboardCheck className="h-6 w-6 text-blue-600" />
        <h1 className="text-xl font-semibold">LLM Trace Evaluator</h1>
      </div>
      
      {user && (
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
    </header>
  );
};

export default Header;

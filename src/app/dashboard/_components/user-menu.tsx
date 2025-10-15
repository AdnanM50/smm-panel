'use client'

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, FileText, HelpCircle, Code2, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 h-auto">
          <Avatar className="h-8 w-8" style={{ backgroundColor: 'var(--dashboard-blue)' }}>
            <AvatarFallback className="text-white font-semibold text-sm" style={{ backgroundColor: 'var(--dashboard-blue)' }}>
              S
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: 'var(--dashboard-text-primary)' }}>shoaibsanto</span>
             
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/dashboard/account" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Account
          </Link>
        </DropdownMenuItem>
     
        {/* <DropdownMenuSeparator /> */}
        <DropdownMenuItem className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

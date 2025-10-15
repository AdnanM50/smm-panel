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
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: 'var(--dashboard-text-primary)' }}>shoaibsanto</span>
              <Badge className="h-5 px-2 text-xs text-white border-0" style={{ backgroundColor: 'var(--dashboard-blue)' }}>
                JUNIOR
              </Badge>
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
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <FileText className="mr-2 h-4 w-4" />
          Terms of service
        </DropdownMenuItem>
        <DropdownMenuItem>
          <HelpCircle className="mr-2 h-4 w-4" />
          FAQ
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Code2 className="mr-2 h-4 w-4" />
          API
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

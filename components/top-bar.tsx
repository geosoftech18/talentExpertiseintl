"use client"

import { Menu, Bell, Search, User } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

interface TopBarProps {
  onMenuClick: () => void
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <header className="h-16 theme-card border-b flex items-center justify-between px-6">
      <button onClick={onMenuClick} className="p-2 hover:bg-muted rounded-lg transition-colors theme-primary">
        <Menu size={24} />
      </button>

      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-muted rounded-lg transition-colors theme-muted hover:theme-primary relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </button>

        {/* Theme Toggle */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-medium theme-text">Admin User</p>
            <p className="text-xs theme-muted">Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <User size={20} className="text-primary-foreground" />
          </div>
        </div>
      </div>
    </header>
  )
}

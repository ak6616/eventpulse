"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import { Menu, X, Ticket, LogOut, LayoutDashboard, User } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-zinc-900">
          <Ticket className="h-6 w-6 text-indigo-600" />
          EventPulse
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            Events
          </Link>
          {user ? (
            <>
              {(user.role === "organizer" || user.role === "admin") && (
                <Link href="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
                  Dashboard
                </Link>
              )}
              <Link href="/my-tickets" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
                My Tickets
              </Link>
              <div className="flex items-center gap-3 border-l border-zinc-200 pl-6">
                <span className="text-sm text-zinc-500">{user.name}</span>
                <button
                  onClick={logout}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="rounded-md p-2 text-zinc-500 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-zinc-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              Events
            </Link>
            {user ? (
              <>
                {(user.role === "organizer" || user.role === "admin") && (
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                )}
                <Link href="/my-tickets" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                  <Ticket className="h-4 w-4" /> My Tickets
                </Link>
                <div className="border-t border-zinc-200 pt-3">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500">
                    <User className="h-4 w-4" /> {user.name}
                  </div>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                  Log in
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded-lg bg-indigo-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

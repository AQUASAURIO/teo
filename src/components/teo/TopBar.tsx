"use client";

import { ArrowLeft, ChevronDown, Settings, LogOut, User } from "lucide-react";
import { useViewStore } from "@/store/view-store";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar() {
  const { goBack, viewHistory, setView } = useViewStore();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setUserName(
          session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "User"
        );
      }
      setChecking(false);
    }).catch(() => setChecking(false));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setUserName(
          session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "User"
        );
        // If we were on auth page and just logged in, go to home
        if (pathname === "/auth") {
          router.push("/");
        }
      } else {
        setUser(null);
        setUserName("");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  const goToAuth = () => {
    router.push("/auth");
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10 bg-[#121212]/90 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <button
          onClick={goBack}
          disabled={viewHistory.length === 0}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            viewHistory.length > 0
              ? "bg-black/70 text-white hover:bg-black"
              : "bg-black/30 text-black/30 cursor-default"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-full bg-black/30" />
      </div>

      {/* User Profile Dropdown or Login Button */}
      {!checking && !user && (
        <button
          onClick={goToAuth}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full px-4 py-1.5 transition-colors"
        >
          <User className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-medium">Log in</span>
        </button>
      )}

      {!checking && user && (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 bg-black/70 hover:bg-black rounded-full p-0.5 pr-2 transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-[#535353] flex items-center justify-center text-white text-xs font-bold overflow-hidden">
              {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                <img
                  src={user.user_metadata.avatar_url || user.user_metadata.picture}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>
            <span className="text-white text-xs font-medium max-w-[100px] truncate">
              {userName}
            </span>
            <ChevronDown className="w-3 h-3 text-white" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="end"
            className="bg-[#282828] border-white/10 min-w-[200px]"
          >
            <DropdownMenuItem
              onClick={() => setView("settings")}
              className="text-[#B3B3B3] hover:text-white focus:text-white focus:bg-white/10 cursor-pointer"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-[#B3B3B3] hover:text-white focus:text-white focus:bg-white/10 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

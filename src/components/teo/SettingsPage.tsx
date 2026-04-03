"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, Moon, Sun, Palette, User, Info, Loader2 } from "lucide-react";

const ACCENT_COLORS = [
  { name: "Green", value: "#1DB954" },
  { name: "Blue", value: "#1D73E8" },
  { name: "Purple", value: "#9B59B6" },
  { name: "Red", value: "#E74C3C" },
  { name: "Orange", value: "#F39C12" },
  { name: "Pink", value: "#E91E8F" },
  { name: "Teal", value: "#00BCD4" },
  { name: "Yellow", value: "#FFC107" },
  { name: "Indigo", value: "#3F51B5" },
  { name: "Cyan", value: "#00ACC1" },
];

type SettingsTab = "account" | "personalization" | "about";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [accentColor, setAccentColor] = useState("#1DB954");
  const [darkMode, setDarkMode] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const supabase = createClient();

  const updateAccentCSSVars = (color: string) => {
    const root = document.documentElement;
    root.style.setProperty("--accent-color", color);
    root.style.setProperty("--primary", color);
    root.style.setProperty("--ring", color);
    root.style.setProperty("--sidebar-primary", color);
    root.style.setProperty("--sidebar-ring", color);
  };

  const applyDarkMode = () => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.style.setProperty("--bg-primary", "#121212");
    root.style.setProperty("--bg-secondary", "#181818");
    root.style.setProperty("--text-primary", "#FFFFFF");
    root.style.setProperty("--text-secondary", "#B3B3B3");
  };

  const applyLightMode = () => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.style.setProperty("--bg-primary", "#FFFFFF");
    root.style.setProperty("--bg-secondary", "#F5F5F5");
    root.style.setProperty("--text-primary", "#000000");
    root.style.setProperty("--text-secondary", "#6B6B6B");
  };

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);
      setDisplayName(user.user_metadata?.full_name || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("themeColor, themeMode, name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setDisplayName(profile.name || displayName);
        if (profile.themeColor) {
          setAccentColor(profile.themeColor);
          document.documentElement.style.setProperty(
            "--accent-color",
            profile.themeColor
          );
          // Also update CSS custom properties that depend on accent color
          updateAccentCSSVars(profile.themeColor);
        }
        if (profile.themeMode === "light") {
          setDarkMode(false);
          applyLightMode();
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const applyAccentColor = (color: string) => {
    setAccentColor(color);
    updateAccentCSSVars(color);
  };

  const showSaveSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const saveProfile = async (updates: Record<string, any>) => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase
        .from("profiles")
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq("id", user.id);
      if (updates.name) {
        await supabase.auth.updateUser({
          data: { full_name: updates.name },
        });
      }
      showSaveSuccess();
    } catch {
      // Error handled silently
    }
    setSaving(false);
  };

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      applyDarkMode();
    } else {
      applyLightMode();
    }
    await saveProfile({ themeMode: newMode ? "dark" : "light" });
  };

  const tabs: Array<{ id: SettingsTab; label: string; icon: any }> = [
    { id: "account", label: "Account", icon: User },
    { id: "personalization", label: "Personalization", icon: Palette },
    { id: "about", label: "About", icon: Info },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[#B3B3B3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        {saveSuccess && (
          <div className="flex items-center gap-1.5 text-[var(--accent-color,#1DB954)] text-sm font-medium animate-pulse">
            <Check className="w-4 h-4" />
            Saved
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-white/5 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white/10 text-white"
                  : "text-[#B3B3B3] hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Account Tab */}
      {activeTab === "account" && (
        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/5">
            <h2 className="text-lg font-bold text-white mb-4">Profile</h2>
            <div className="flex items-start gap-6">
              <div className="relative group flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-[#535353] flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (displayName || "U").charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-sm text-[#B3B3B3] mb-1 block">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onBlur={() => saveProfile({ name: displayName })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveProfile({ name: displayName });
                    }}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-[#B3B3B3] focus:outline-none focus:border-[var(--accent-color,#1DB954)] transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#B3B3B3] mb-1 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-2.5 text-[#B3B3B3] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/5">
            <h2 className="text-lg font-bold text-white mb-4">Security</h2>
            <p className="text-[#B3B3B3] text-sm mb-4">
              Your account is protected by Supabase Auth with
              industry-standard encryption.
            </p>
            <button
              onClick={async () => {
                if (!user?.email) return;
                setSaving(true);
                try {
                  await supabase.auth.resetPasswordForEmail(user.email);
                  showSaveSuccess();
                } catch {
                  // Error handled silently
                }
                setSaving(false);
              }}
              disabled={saving}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Reset Password
            </button>
          </div>
        </div>
      )}

      {/* Personalization Tab */}
      {activeTab === "personalization" && (
        <div className="space-y-6">
          {/* Theme Color */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/5">
            <h2 className="text-lg font-bold text-white mb-2">Theme Color</h2>
            <p className="text-[#B3B3B3] text-sm mb-4">
              Choose the accent color for your Teo experience
            </p>
            <div className="grid grid-cols-5 gap-3">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    applyAccentColor(color.value);
                    saveProfile({ themeColor: color.value });
                  }}
                  className={`relative h-14 rounded-xl transition-all hover:scale-105 ${
                    accentColor === color.value
                      ? "ring-2 ring-white ring-offset-2 ring-offset-[#121212]"
                      : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {accentColor === color.value && (
                    <Check className="w-5 h-5 text-white absolute inset-0 m-auto drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Dark/Light Mode */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/5">
            <h2 className="text-lg font-bold text-white mb-2">Appearance</h2>
            <p className="text-[#B3B3B3] text-sm mb-4">
              Switch between dark and light mode
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-[#B3B3B3]" />
                ) : (
                  <Sun className="w-5 h-5 text-[#B3B3B3]" />
                )}
                <span className="text-white">
                  {darkMode ? "Dark" : "Light"} mode
                </span>
              </div>
              <button
                onClick={toggleDarkMode}
                className="relative w-12 h-6 rounded-full transition-colors"
                style={{
                  backgroundColor: darkMode ? accentColor : "#B3B3B3",
                }}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    darkMode ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Tab */}
      {activeTab === "about" && (
        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg flex items-center justify-center bg-[#1DB954]">
                <span className="text-white font-bold text-2xl">T</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Teo</h2>
                <p className="text-[#B3B3B3] text-sm">Music for everyone</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[#B3B3B3]">Version</span>
                <span className="text-white font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[#B3B3B3]">Built with</span>
                <span className="text-white font-medium">
                  Next.js, Supabase, Tailwind CSS
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[#B3B3B3]">Audio</span>
                <span className="text-white font-medium">
                  HTML5 Audio, SoundHelix
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#B3B3B3]">License</span>
                <span className="text-white font-medium">MIT</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

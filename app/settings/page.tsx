'use client'

import { Switch } from "@/components/ui/switch"
import { useState } from "react";

const SettingsPage: React.FC = () => {
  const [isStandupMode, setIsStandupMode] = useState(true);

  const handleSwitchChange = () => {
    setIsStandupMode(!isStandupMode);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--cream))]">
      <div className="container-zen py-12">
        <div className="space-zen">
          <h1 className="text-3xl font-light text-[hsl(var(--charcoal))] tracking-wide mb-12">
            Settings
          </h1>
          
          <div className="sketch-border p-8 bg-[hsl(var(--card))] shadow-soft max-w-md">
            <div className="space-zen">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[hsl(var(--charcoal))] font-light tracking-wide">
                    Standup mode toggle
                  </label>
                  <p className="text-xs text-[hsl(var(--charcoal-light))] mt-1 font-light">
                    Switch between different modes
                  </p>
                </div>
                <Switch 
                  checked={isStandupMode} 
                  onCheckedChange={handleSwitchChange}
                  className="focus-zen"
                />
              </div>
              
              <div className="pt-4 border-t border-[hsl(var(--border))]">
                <p className="text-sm text-[hsl(var(--charcoal-light))] font-light tracking-wide">
                  Current mode: {isStandupMode ? "standup mode" : "unemployed mode"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Trash2, 
  Download, 
  BarChart3, 
  RefreshCw, 
  Sun, 
  Moon,
  User,
  MapPin,
  Target,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfile {
  name: string;
  campus: string;
  focus: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
  onClearChat: () => void;
  onExportChat: () => void;
  onShowStats: () => void;
  onReset: () => void;
  messageCount: number;
}

const campusOptions = [
  "Any campus",
  "Kattankulathur (KTR)",
  "Vadapalani", 
  "Ramapuram",
  "Delhi NCR",
  "Sonepat",
  "Amaravati"
];

const focusOptions = [
  "General",
  "Admissions", 
  "Academics",
  "Hostel",
  "Fees",
  "Placements", 
  "Events"
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  isDark,
  onThemeToggle,
  profile,
  onProfileUpdate,
  onClearChat,
  onExportChat,
  onShowStats,
  onReset,
  messageCount
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-full w-80 transform transition-transform duration-300 lg:relative lg:translate-x-0",
        "bg-sidebar border-r border-sidebar-border",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="bg-gradient-primary p-6 text-center">
            <div className="text-2xl font-bold text-primary-foreground">🎓 MIST AI</div>
            <div className="text-sm text-primary-foreground/90">SRM Virtual Assistant</div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Theme Toggle */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  Theme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-toggle" className="text-sm">
                    {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
                  </Label>
                  <Switch
                    id="theme-toggle"
                    checked={isDark}
                    onCheckedChange={onThemeToggle}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Profile */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => onProfileUpdate({ ...profile, name: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Campus
                  </Label>
                  <Select 
                    value={profile.campus}
                    onValueChange={(value) => onProfileUpdate({ ...profile, campus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {campusOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Focus Area
                  </Label>
                  <Select 
                    value={profile.focus}
                    onValueChange={(value) => onProfileUpdate({ ...profile, focus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {focusOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  ⚡ Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={onClearChat}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                  <Button variant="outline" size="sm" onClick={onExportChat}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
                
                <Button variant="outline" size="sm" onClick={onShowStats} className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistics ({messageCount} messages)
                </Button>
                
                {!showResetConfirm ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Reset all settings?</div>
                    <div className="flex gap-2">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => {
                          onReset();
                          setShowResetConfirm(false);
                        }}
                        className="flex-1"
                      >
                        Confirm
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowResetConfirm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Help & Info */}
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="font-medium text-foreground">ℹ️ About MIST AI</div>
              <div>Your friendly SRM guide powered by advanced AI. Ask about admissions, courses, campus life, or any general questions!</div>
              
              <div className="mt-4">
                <div className="font-medium text-foreground mb-2">🏫 SRM Campuses</div>
                <div className="space-y-1 text-xs">
                  <div>• Kattankulathur (Main)</div>
                  <div>• Vadapalani, Ramapuram</div>
                  <div>• Delhi NCR, Sonepat</div>
                  <div>• Amaravati</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-sidebar-border bg-sidebar-accent/50 p-4 text-center">
            <div className="text-xs font-medium text-sidebar-foreground">MIST AI v2.0</div>
            <div className="text-xs text-sidebar-foreground/70">Enhanced for SRM Community</div>
          </div>
        </div>
      </div>
    </>
  );
};
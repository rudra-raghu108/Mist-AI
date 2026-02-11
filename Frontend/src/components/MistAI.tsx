import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Message } from "@/components/ChatMessage";
import { ChatInput } from './ChatInput';
import { QuickSuggestions } from './QuickSuggestions';
import { Sidebar } from './Sidebar';
import { Menu, Sparkles, BookOpen, Users, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfile {
  name: string;
  campus: string;
  focus: string;
}

export const MistAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    campus: 'Any campus',
    focus: 'General'
  });
  
  const { toast } = useToast();

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('mist-ai-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(savedTheme === 'dark' || (!savedTheme && prefersDark));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('mist-ai-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Try backend first, fallback to local simulated response
  const generateResponse = useCallback(async (query: string): Promise<string> => {
    // 1) Attempt backend call via Vite proxy
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        if (typeof data?.response === 'string') {
          return data.response;
        }
      }
    } catch (e) {
      // ignore and fallback to local simulation
    }

    // 2) Local simulation fallback
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));

    const userName = profile.name || "Student";
    const campus = profile.campus !== 'Any campus' ? profile.campus : '';
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
      return `Hello ${userName}! 😊 I'm MIST AI, your dedicated SRM assistant. I'm here to help you with anything related to SRM University or any general questions you might have.`;
    }

    if (lowerQuery.includes('admission') || lowerQuery.includes('apply')) {
      const campusInfo = campus ? ` for ${campus}` : '';
      return `🎓 **SRM Admissions${campusInfo}**\n\n• **Application Process**: Online applications through admissions portal\n• **Entrance Exams**: SRMJEEE for engineering, NEET for medical\n• **Deadlines**: Usually April-May for the academic year\n• **Documents**: 10th & 12th marksheets, entrance exam scores\n• **Fee Structure**: Varies by program and campus\n\nWould you like specific information about any program or campus?`;
    }

    if (lowerQuery.includes('engineering') || lowerQuery.includes('courses')) {
      return `⚙️ **Top Engineering Programs at SRM**\n\n• **Computer Science & Engineering** - AI/ML, Cybersecurity specializations\n• **Electronics & Communication** - VLSI, IoT focus\n• **Mechanical Engineering** - Robotics, Automotive\n• **Civil Engineering** - Smart infrastructure\n• **Aerospace Engineering** - Cutting-edge research\n• **Biotechnology** - Healthcare applications\n\nAll programs feature industry partnerships, internships, and excellent placement records!`;
    }

    if (lowerQuery.includes('hostel') || lowerQuery.includes('accommodation')) {
      const campusInfo = campus ? ` at ${campus}` : '';
      return `🏠 **Hostel Facilities${campusInfo}**\n\n• **Accommodation Types**: Single, double, and triple sharing rooms\n• **Facilities**: Wi-Fi, laundry, mess, recreational areas\n• **Security**: 24/7 security with CCTV surveillance\n• **Fees**: ₹80,000 - ₹1,50,000 per year (varies by room type)\n• **Amenities**: Gym, library, common rooms, medical facility\n\nSeparate hostels for boys and girls with modern amenities!`;
    }

    if (lowerQuery.includes('placement') || lowerQuery.includes('job') || lowerQuery.includes('career')) {
      return `💼 **SRM Placement Highlights**\n\n• **Placement Rate**: 95%+ across all engineering branches\n• **Top Recruiters**: Google, Microsoft, Amazon, TCS, Infosys, Wipro\n• **Average Package**: ₹6-8 LPA\n• **Highest Package**: ₹50+ LPA\n• **Career Services**: Resume building, mock interviews, skill development\n• **Industry Connect**: Regular company visits, guest lectures\n\nDedicated placement cell ensures excellent career opportunities!`;
    }

    if (lowerQuery.includes('event') || lowerQuery.includes('club') || lowerQuery.includes('activities')) {
      return `🎪 **Campus Life & Events**\n\n• **Cultural Events**: Milan (cultural fest), technical symposiums\n• **Student Clubs**: 100+ clubs covering arts, sports, technology\n• **Sports**: Cricket, football, basketball courts, swimming pool\n+• **Technical Clubs**: Robotics, coding, innovation labs\n• **Arts & Culture**: Dance, music, drama, literary societies\n• **International Events**: Model UN, cultural exchanges\n\nVibrant campus life with opportunities to explore your interests!`;
    }

    if (lowerQuery.includes('fee') || lowerQuery.includes('cost') || lowerQuery.includes('tuition')) {
      const campusInfo = campus ? ` for ${campus}` : '';
      return `💰 **Fee Structure${campusInfo}**\n\n**Engineering Programs**:\n• **KTR Campus**: ₹2.5-4 LPA\n• **Other Campuses**: ₹1.5-3 LPA\n\n**Additional Costs**:\n• **Hostel**: ₹80,000-1,50,000/year\n• **Mess**: ₹50,000-70,000/year\n• **Books & Supplies**: ₹20,000-30,000/year\n\n**Scholarships Available**: Merit-based and need-based financial aid options!`;
    }

    if (lowerQuery.includes('srm') || lowerQuery.includes('university') || lowerQuery.includes('campus')) {
      return `🏫 **About SRM Institute of Science & Technology**\n\n• **Established**: 1985, leading private university\n• **Rankings**: Top 10 private engineering colleges in India\n• **Campuses**: Kattankulathur (main), Vadapalani, Ramapuram, Delhi NCR, Sonepat, Amaravati\n• **Students**: 50,000+ diverse student community\n• **Faculty**: 2,500+ qualified and experienced\n• **Research**: Strong focus on innovation and patents\n• **Global Presence**: International collaborations and student exchanges\n\nNIRF ranked with excellent industry connections!`;
    }

    return `I understand you're asking about "${query}". As your SRM assistant, I'm here to help with:\n\n• 🎓 **Admissions & Applications**\n• 📚 **Academic Programs & Courses**\n• 🏠 **Campus Life & Facilities**\n• 💼 **Placements & Career Services**\n• 🎪 **Events & Student Activities**\n• 💰 **Fees & Scholarships**\n• 📍 **Campus Information**\n\nCould you be more specific about what aspect of SRM you'd like to know about? I'm also happy to help with any general questions!`;
  }, [profile]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await generateResponse(content);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "I'm experiencing technical difficulties. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleClearChat = () => {
    setMessages([]);
    toast({
      title: "Chat Cleared",
      description: "Your conversation history has been cleared.",
    });
  };

  const handleExportChat = () => {
    if (messages.length === 0) {
      toast({
        title: "No Messages",
        description: "There's no chat history to export.",
        variant: "destructive",
      });
      return;
    }

    const chatContent = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'MIST AI'}: ${msg.content}\n\n`
    ).join('');

    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mist-ai-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Chat Exported",
      description: "Your conversation has been downloaded as a text file.",
    });
  };

  const handleShowStats = () => {
    const userMessages = messages.filter(msg => msg.role === 'user').length;
    const botMessages = messages.filter(msg => msg.role === 'assistant').length;
    
    toast({
      title: "📊 Chat Statistics",
      description: `Total: ${messages.length} | You: ${userMessages} | AI: ${botMessages}`,
    });
  };

  const handleReset = () => {
    setMessages([]);
    setProfile({ name: '', campus: 'Any campus', focus: 'General' });
    localStorage.removeItem('mist-ai-profile');
    toast({
      title: "Reset Complete",
      description: "All settings and chat history have been reset.",
    });
  };

  const handleCopyMessage = (content: string) => {
    toast({
      title: "Copied!",
      description: "Message copied to clipboard.",
    });
  };

  // Load profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('mist-ai-profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  }, []);

  // Save profile to localStorage
  useEffect(() => {
    localStorage.setItem('mist-ai-profile', JSON.stringify(profile));
  }, [profile]);

  return (
    <div className="flex h-screen bg-gradient-hero">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isDark={isDark}
        onThemeToggle={() => setIsDark(!isDark)}
        profile={profile}
        onProfileUpdate={setProfile}
        onClearChat={handleClearChat}
        onExportChat={handleExportChat}
        onShowStats={handleShowStats}
        onReset={handleReset}
        messageCount={messages.length}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="border-b border-border bg-gradient-card/90 backdrop-blur-lg p-4 shadow-medium">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground">
                  <img src="/logo.svg" alt="MIST AI Logo" className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    MIST AI
                  </h1>
                  <p className="text-sm text-muted-foreground">SRM Virtual Assistant</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                {profile.name && <span>👤 {profile.name}</span>}
                {profile.campus !== 'Any campus' && <span>📍 {profile.campus}</span>}
                {profile.focus !== 'General' && <span>🎯 {profile.focus}</span>}
              </div>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.length === 0 ? (
              <div className="mx-auto max-w-4xl">
                {/* Welcome Message */}
                <Card className="mb-8 border-0 shadow-strong bg-gradient-card overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-header opacity-10"></div>
                  <CardContent className="p-12 text-center relative z-10">
                    <div className="mb-6">
                      <div className="mx-auto h-20 w-20 rounded-full bg-gradient-header flex items-center justify-center shadow-glow animate-pulse">
                        <img src="/logo.svg" alt="MIST AI Logo" className="h-12 w-12" />
                      </div>
                    </div>
                    <h2 className="text-5xl font-extrabold mb-6 bg-gradient-header bg-clip-text text-transparent drop-shadow-lg tracking-tight">
                      MIST AI - SRM Assistant
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 font-medium">
                      {profile.name 
                        ? `👋 Hello ${profile.name}! I'm your friendly SRM guide for everything university-related` 
                        : "Your intelligent SRM University assistant for admissions, courses, campus life and more"}
                    </p>
                  </CardContent>
                </Card>

                {/* Quick Suggestions */}
                <QuickSuggestions onSuggestionClick={handleSuggestionClick} />
              </div>
            ) : (
              <div className="mx-auto max-w-4xl space-y-6">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onCopy={handleCopyMessage}
                  />
                ))}
                
                {isLoading && (
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-card shadow-soft border border-border">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-secondary text-secondary-foreground">
                      <img src="/logo.svg" alt="MIST AI Logo" className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium opacity-70 mb-2">MIST AI</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <img src="/logo.svg" alt="MIST AI Logo" className="h-4 w-4 animate-pulse" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chat Input */}
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};
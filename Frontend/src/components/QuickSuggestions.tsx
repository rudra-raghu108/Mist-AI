import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface QuickSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  {
    title: "Admissions Process",
    description: "About admission requirements and deadlines",
   icon: "🎓"
  },
  {
    title: "Engineering Programs", 
    description: "Explore top engineering courses at SRM",
    icon: "⚙️"
  },
  {
    title: "Hostel Facilities",
    description: "Information about accommodation and fees",
    icon: "🏠"
  },
  {
    title: "Campus Events",
    description: "Discover clubs, events, and activities",
    icon: "🎪"
  },
  {
    title: "Placement Statistics",
    description: "Career opportunities and company visits",
    icon: "💼"
  },
  {
    title: "Campus Locations",
    description: "Information about different SRM campuses",
    icon: "📍"
  }
];

export const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({ onSuggestionClick }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">💡 Quick Suggestions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((suggestion, index) => (
          <Card
            key={index}
            className="group cursor-pointer transition-all duration-300 hover:shadow-strong border-0 bg-gradient-card overflow-hidden"
          >
            <Button
              variant="suggestion"
              onClick={() => onSuggestionClick(suggestion.title)}
              className="h-full w-full p-6 flex flex-col items-center text-center space-y-3"
            >
              <div className="text-3xl transition-transform duration-300 group-hover:scale-110">
                {suggestion.icon}
              </div>
              <div className="space-y-1">
                <div className="font-medium text-foreground">{suggestion.title}</div>
                <div className="text-sm text-muted-foreground">{suggestion.description}</div>
              </div>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
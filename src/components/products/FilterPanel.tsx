import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  name: string;
  options: FilterOption[];
}

interface FilterPanelProps {
  groups: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (groupId: string, optionId: string, checked: boolean) => void;
  onClearAll: () => void;
}

export default function FilterPanel({ 
  groups, 
  selectedFilters, 
  onFilterChange, 
  onClearAll 
}: FilterPanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    groups.slice(0, 3).map(g => g.id)
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const totalSelected = Object.values(selectedFilters).flat().length;

  return (
    <div className="w-64 flex-shrink-0">
      <div className="sticky top-28 bg-background border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary">
          <h3 className="font-semibold text-sm uppercase tracking-wide">Filters</h3>
          {totalSelected > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearAll}
              className="text-xs h-auto py-1 px-2"
            >
              Clear all ({totalSelected})
            </Button>
          )}
        </div>

        {/* Filter Groups */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {groups.map((group) => (
            <div key={group.id} className="border-b border-border last:border-b-0">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium text-sm">{group.name}</span>
                {expandedGroups.includes(group.id) ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              {expandedGroups.includes(group.id) && (
                <div className="px-4 pb-3 space-y-1">
                  {group.options.map((option) => {
                    const isChecked = selectedFilters[group.id]?.includes(option.id) || false;
                    return (
                      <label key={option.id} className="filter-checkbox">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => 
                            onFilterChange(group.id, option.id, checked as boolean)
                          }
                        />
                        <span className="flex-1">{option.label}</span>
                        {option.count !== undefined && (
                          <span className="text-xs text-muted-foreground">({option.count})</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

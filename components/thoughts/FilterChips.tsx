import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MessageSquare, User, CircleHelp, Clock } from 'lucide-react-native';

export type FilterType = 'all' | 'my-thoughts' | 'suggested' | 'open';

type FilterChipsProps = {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
};

const filters = [
  { key: 'all' as FilterType, label: 'All', icon: MessageSquare },
  { key: 'my-thoughts' as FilterType, label: 'My Thoughts', icon: User },
  { key: 'suggested' as FilterType, label: 'Suggested', icon: CircleHelp },
  { key: 'open' as FilterType, label: 'Open', icon: Clock },
];

export function FilterChips({ activeFilter, setActiveFilter }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersContainer}
    >
      {filters.map((filter) => {
        const IconComponent = filter.icon;
        const isActive = activeFilter === filter.key;
        
        return (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterButton, isActive && styles.filterButtonActive]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <IconComponent
              color={isActive ? '#FFFFFF' : '#6B7280'}
              size={16}
            />
            <Text
              style={[
                styles.filterButtonText,
                isActive && styles.filterButtonTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#6366F1',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
}); 
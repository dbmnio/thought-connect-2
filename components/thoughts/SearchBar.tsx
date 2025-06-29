import { View, TextInput, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';

type SearchBarProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

export function SearchBar({ searchQuery, setSearchQuery }: SearchBarProps) {
  return (
    <View style={styles.searchContainer}>
      <Search color="#9CA3AF" size={20} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search questions..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
}); 
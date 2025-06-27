import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { SearchResult } from '../../types/SearchResult';
import { SearchResultCard } from './SearchResultCard';

type SearchViewProps = {
  searchQuery: string;
  searchResults: SearchResult[];
  isLoading: boolean;
};

export function SearchView({ searchQuery, searchResults, isLoading }: SearchViewProps) {
  return (
    <>
      {searchQuery && (
        <View style={styles.searchHeader}>
          <Text style={styles.searchResultsCount}>
            {isLoading ? 'Searching...' : `${searchResults.length} results found`}
          </Text>
        </View>
      )}
      <FlatList
        data={searchResults}
        renderItem={({ item }) => <SearchResultCard item={item} />}
        keyExtractor={(item) => item.id}
        style={styles.searchResultsList}
        contentContainerStyle={styles.searchResultsContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          searchQuery ? (
            <View style={styles.emptyState}>
              <Search color="#9CA3AF" size={48} />
              <Text style={styles.emptyTitle}>
                {isLoading ? 'Searching...' : 'No results found'}
              </Text>
              <Text style={styles.emptyDescription}>
                {isLoading
                  ? 'Searching through your knowledge base...'
                  : 'Try adjusting your search terms or check your spelling'}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Search color="#9CA3AF" size={48} />
              <Text style={styles.emptyTitle}>Search Your Knowledge</Text>
              <Text style={styles.emptyDescription}>
                Enter keywords to search through your thoughts, questions, answers, and documents
              </Text>
            </View>
          )
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  searchHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchResultsCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultsContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
}); 
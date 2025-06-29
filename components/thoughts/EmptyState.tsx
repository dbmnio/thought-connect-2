import { View, Text, StyleSheet } from 'react-native';
import { MessageSquare } from 'lucide-react-native';

type EmptyStateProps = {
    searchQuery: string;
};

export function EmptyState({ searchQuery }: EmptyStateProps) {
    return (
        <View style={styles.emptyState}>
            <MessageSquare color="#9CA3AF" size={64} />
            <Text style={styles.emptyTitle}>No thoughts found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Start capturing your first thought with the camera!'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        marginTop: 64,
    },
    emptyTitle: {
        marginTop: 16,
        fontSize: 20,
        fontFamily: 'Inter-Bold',
        color: '#1F2937',
    },
    emptyDescription: {
        marginTop: 8,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        color: '#6B7280',
        textAlign: 'center',
    },
}); 
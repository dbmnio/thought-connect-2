import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function TabTwo() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab Two</Text>
      <Text style={styles.subtitle}>This is the second tab.</Text>
      <Link href="/(app)/user-profile" style={styles.link}>
        Back to Profile
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
    color: '#2e78b7',
  },
}); 
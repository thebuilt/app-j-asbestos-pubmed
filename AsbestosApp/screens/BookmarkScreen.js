import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trash2, ExternalLink } from 'lucide-react-native';

export default function BookmarkScreen() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const data = await AsyncStorage.getItem('@bookmarks');
      if (data) setBookmarks(JSON.parse(data));
    } catch (e) {
      console.error("Error loading bookmarks", e);
    }
  };

  const removeBookmark = async (id) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    await AsyncStorage.setItem('@bookmarks', JSON.stringify(updated));
  };

  const renderItem = ({ item }) => (
    <View style={styles.bookmarkItem}>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.date}>{item.pubDate} | {item.source}</Text>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.button, styles.readButton]}
          onPress={() => Linking.openURL(item.url)}
        >
          <ExternalLink color="#FFF" size={20} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => removeBookmark(item.id)}
        >
          <Trash2 color="#FFF" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Saved Papers</Text>
      {bookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You haven't bookmarked any papers yet.</Text>
          <Text style={styles.emptySubText}>Swipe right or tap the bookmark icon on papers you like!</Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    margin: 20,
    color: '#333',
  },
  bookmarkItem: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  actionContainer: {
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readButton: {
    backgroundColor: '#007AFF',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  }
});

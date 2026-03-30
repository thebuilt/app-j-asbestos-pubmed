import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Linking, SafeAreaView } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { fetchPubMedPapers } from '../api/pubmed';
import { enhancePaperWithAI } from '../api/ai';
import { Bookmark, RefreshCcw } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SwipeScreen({ navigation }) {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [learningModel, setLearningModel] = useState({ likes: 0, dislikes: 0 });
  const [offset, setOffset] = useState(0);

  // Function to load and enhance papers
  const loadPapers = async (currentOffset) => {
    setLoading(true);
    const pubmedResults = await fetchPubMedPapers(10, currentOffset);

    // Enhance them with AI (Mocked for now)
    const enhancedPromises = pubmedResults.map(paper => enhancePaperWithAI(paper));
    const enhanced = await Promise.all(enhancedPromises);

    setPapers(enhanced);
    setLoading(false);
  };

  useEffect(() => {
    loadPapers(0);
  }, []);

  const handleSwipeRight = async (cardIndex) => {
    const paper = papers[cardIndex];
    console.log("Swiped Right! You liked this paper.");
    setLearningModel(prev => ({ ...prev, likes: prev.likes + 1 }));
  };

  const handleSwipeLeft = (cardIndex) => {
    console.log("Swiped Left! Not interested.");
    setLearningModel(prev => ({ ...prev, dislikes: prev.dislikes + 1 }));
  };

  const handleSwipedAll = () => {
    console.log("Swiped all cards, loading next batch...");
    const nextOffset = offset + 10;
    setOffset(nextOffset);
    loadPapers(nextOffset);
  };

  const handleBookmark = async (paper) => {
    if (!paper) return;
    try {
      const existing = await AsyncStorage.getItem('@bookmarks');
      let bookmarks = existing ? JSON.parse(existing) : [];

      if (!bookmarks.find(b => b.id === paper.id)) {
        bookmarks.push(paper);
        await AsyncStorage.setItem('@bookmarks', JSON.stringify(bookmarks));
        alert("Paper saved to Bookmarks!");
      } else {
        alert("This paper is already bookmarked.");
      }
    } catch (e) {
      console.error("Failed to save bookmark", e);
    }
  };

  const renderCard = (paper) => {
    if (!paper) return <View style={styles.card} />;

    return (
      <View style={styles.card}>
        <Image source={{ uri: paper.aiImage || 'https://via.placeholder.com/600x400' }} style={styles.cardImage} />

        <TouchableOpacity
          style={styles.bookmarkButtonOverlay}
          onPress={() => handleBookmark(paper)}
        >
          <Bookmark color="white" fill="#007AFF" size={30} />
        </TouchableOpacity>

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>{paper.title}</Text>
          <Text style={styles.cardDate}>{paper.pubDate} | {paper.source}</Text>
          <Text style={styles.cardAuthors} numberOfLines={1}>{paper.authors}</Text>

          <View style={styles.summaryContainer}>
             <Text style={styles.summaryTitle}>AI Summary (60 Words):</Text>
             <Text style={styles.summaryText} numberOfLines={4}>{paper.aiSummary}</Text>
          </View>

          <TouchableOpacity
            style={styles.fullTextButton}
            onPress={() => Linking.openURL(paper.url)}
          >
            <Text style={styles.fullTextText}>Read Full Text on PubMed</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && papers.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Finding interesting asbestos science...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Science Swipe</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Bookmarks')} style={styles.headerIcon}>
          <Bookmark color="#000" size={28} />
        </TouchableOpacity>
      </View>

      <View style={styles.swiperContainer}>
        {papers.length > 0 ? (
          <Swiper
            cards={papers}
            renderCard={renderCard}
            onSwipedRight={handleSwipeRight}
            onSwipedLeft={handleSwipeLeft}
            onSwipedAll={handleSwipedAll}
            cardIndex={0}
            backgroundColor={'#f2f2f2'}
            stackSize={3}
            animateCardOpacity
            overlayLabels={{
              left: {
                title: 'IGNORE',
                style: {
                  label: { backgroundColor: '#ff4b4b', color: 'white', padding: 10, borderRadius: 10, fontSize: 24 },
                  wrapper: { flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', marginTop: 30, marginLeft: -30 }
                }
              },
              right: {
                title: 'MORE LIKE THIS',
                style: {
                  label: { backgroundColor: '#4CAF50', color: 'white', padding: 10, borderRadius: 10, fontSize: 24 },
                  wrapper: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: 30, marginLeft: 30 }
                }
              }
            }}
          />
        ) : (
          <View style={styles.noCardsContainer}>
             <Text style={styles.noCardsText}>No more papers found!</Text>
             <TouchableOpacity style={styles.reloadButton} onPress={() => loadPapers(0)}>
               <RefreshCcw color="#FFF" size={24} />
               <Text style={styles.reloadButtonText}>Start Over</Text>
             </TouchableOpacity>
          </View>
        )}
      </View>

      {loading && papers.length > 0 && (
        <View style={styles.fetchingNextContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.fetchingNextText}>Fetching more papers...</Text>
        </View>
      )}

      <View style={styles.bottomButtons}>
        <Text style={styles.hintText}>Swipe Right for More, Left to Ignore</Text>
        <Text style={styles.subHintText}>Tap the bookmark icon on the card to save it!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerIcon: {
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#666',
  },
  swiperContainer: {
    flex: 1,
  },
  card: {
    flex: 0.85,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  bookmarkButtonOverlay: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 30,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardInfo: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#222',
  },
  cardDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  cardAuthors: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  summaryContainer: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  summaryTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#007AFF',
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
  },
  fullTextButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  fullTextText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomButtons: {
    padding: 15,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
    marginBottom: 5,
  },
  subHintText: {
    fontSize: 12,
    color: '#aaa',
  },
  noCardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCardsText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 20,
  },
  reloadButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  reloadButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  fetchingNextContainer: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  fetchingNextText: {
    marginLeft: 8,
    color: '#007AFF',
    fontWeight: '600',
  }
});

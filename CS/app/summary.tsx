import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, BookOpen, Loader2, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateText } from "@rork-ai/toolkit-sdk";
import { useMutation } from "@tanstack/react-query";

interface BookInfo {
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
}

export default function SummaryScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const { mutate: analyzeMutation, isPending, isError, data } = useMutation({
    mutationFn: async (uri: string) => {
      console.log("Analyzing book cover with AI...", uri);
      
      let imageBase64 = uri;
      if (!uri.startsWith("data:")) {
        const response = await fetch(uri);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        imageBase64 = base64;
      }

      console.log("Image prepared for AI analysis");

      const extractionResult = await generateText({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                image: imageBase64,
              },
              {
                type: "text",
                text: "Analyse cette couverture de livre et identifie le titre et l'auteur. Réponds UNIQUEMENT au format JSON: {\"title\": \"titre du livre\", \"author\": \"nom de l'auteur\"}",
              },
            ],
          },
        ],
      });

      console.log("Extraction result:", extractionResult);
      
      let parsedInfo: { title: string; author: string };
      try {
        parsedInfo = JSON.parse(extractionResult);
      } catch {
        parsedInfo = {
          title: "Le titre n'a pas pu être identifié",
          author: "Auteur inconnu",
        };
      }

      console.log("Searching Google Books API...");
      const searchQuery = encodeURIComponent(
        `${parsedInfo.title} ${parsedInfo.author}`
      );
      const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&maxResults=1`;
      
      let bookData: BookInfo = {
        title: parsedInfo.title,
        author: parsedInfo.author,
      };

      try {
        const response = await fetch(googleBooksUrl);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const book = data.items[0].volumeInfo;
          bookData = {
            title: book.title || parsedInfo.title,
            author: book.authors?.[0] || parsedInfo.author,
            coverUrl: book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail,
            description: book.description,
          };
        }
      } catch (error) {
        console.error("Google Books API error:", error);
      }

      console.log("Generating summary with AI...");
      const summaryPrompt = bookData.description
        ? `Écris un résumé concis du livre "${bookData.title}" de ${bookData.author} en environ 10 lignes. Voici la description officielle: ${bookData.description}. Rends le résumé clair, structuré et fidèle au livre.`
        : `Écris un résumé concis du livre "${bookData.title}" de ${bookData.author} en environ 10 lignes. Base-toi sur tes connaissances du livre. Rends le résumé clair, structuré et fidèle au livre.`;

      const summary = await generateText(summaryPrompt);

      return {
        ...bookData,
        summary,
      };
    },
    onSuccess: (data) => {
      setBookInfo(data);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    },
  });

  useEffect(() => {
    if (imageUri) {
      analyzeMutation(imageUri);
    }
  }, [imageUri, analyzeMutation]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FFF8F0", "#F5EBE0", "#E8D5C4"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#3E2723" strokeWidth={2.5} />
            </Pressable>
            <Text style={styles.headerTitle}>Résumé</Text>
            <View style={{ width: 40 }} />
          </View>

          {isPending ? (
            <View style={styles.loadingContainer}>
              <Loader2 size={48} color="#FF6B35" />
              <Text style={styles.loadingText}>
                Analyse de la couverture en cours...
              </Text>
              <Text style={styles.loadingSubtext}>
                Identification du livre et génération du résumé
              </Text>
            </View>
          ) : isError ? (
            <View style={styles.errorContainer}>
              <BookOpen size={48} color="#FF6B35" />
              <Text style={styles.errorTitle}>Erreur</Text>
              <Text style={styles.errorText}>
                Impossible d&apos;analyser la couverture. Veuillez réessayer avec une
                image plus claire.
              </Text>
              <Pressable
                onPress={() => router.back()}
                style={styles.retryButton}
              >
                <LinearGradient
                  colors={["#FF6B35", "#FF8C42", "#FFA07A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Réessayer</Text>
                </LinearGradient>
              </Pressable>
            </View>
          ) : bookInfo ? (
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.bookCard}>
                  {bookInfo.coverUrl && (
                    <Image
                      source={{ uri: bookInfo.coverUrl }}
                      style={styles.coverImage}
                      contentFit="cover"
                    />
                  )}
                  <View style={styles.bookInfo}>
                    <View style={styles.infoRow}>
                      <BookOpen size={20} color="#FF6B35" />
                      <Text style={styles.bookTitle}>{bookInfo.title}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <User size={18} color="#FF8C42" />
                      <Text style={styles.bookAuthor}>{bookInfo.author}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Résumé</Text>
                  <Text style={styles.summaryText}>
                    {data?.summary}
                  </Text>
                </View>
              </ScrollView>
            </Animated.View>
          ) : null}
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#3E2723",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#3E2723",
    textAlign: "center",
  },
  loadingSubtext: {
    fontSize: 16,
    color: "#5D4037",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#3E2723",
  },
  errorText: {
    fontSize: 16,
    color: "#5D4037",
    textAlign: "center",
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  bookCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  coverImage: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    marginBottom: 16,
  },
  bookInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bookTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#3E2723",
  },
  bookAuthor: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#5D4037",
  },
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#3E2723",
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 16,
    color: "#4E342E",
    lineHeight: 26,
  },
});

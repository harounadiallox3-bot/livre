import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Camera } from "lucide-react-native";
import React from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleScan = () => {
    router.push("/scan");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#F7E9E3", "#F0DDD5", "#E8D0C5"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Image
                source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/odvi9va3bkhlpys0nptao" }}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.title}>Cover Scan</Text>
              <Text style={styles.subtitle}>
                Transformez une couverture de livre{"\n"}en résumé instantané
              </Text>
            </View>

            <View style={styles.featureContainer}>
              <FeatureItem
                icon="1"
                text="Scannez la couverture"
                color="#FF6B35"
              />
              <FeatureItem
                icon="2"
                text="IA identifie le livre"
                color="#FF8C42"
              />
              <FeatureItem
                icon="3"
                text="Résumé intelligent"
                color="#FFA07A"
              />
            </View>

            <Animated.View
              style={[
                styles.buttonContainer,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <Pressable
                onPress={handleScan}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.scanButton}
              >
                <LinearGradient
                  colors={["#FF6B35", "#FF8C42", "#FFA07A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Camera size={28} color="#FFF" strokeWidth={2.5} />
                  <Text style={styles.buttonText}>Scanner un livre</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

function FeatureItem({
  icon,
  text,
  color,
}: {
  icon: string;
  text: string;
  color: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureNumber, { backgroundColor: color }]}>
        <Text style={styles.featureNumberText}>{icon}</Text>
      </View>
      <Text style={styles.featureText}>{text}</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 60,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
    borderRadius: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "800" as const,
    color: "#3E2723",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#5D4037",
    textAlign: "center",
    lineHeight: 26,
  },
  featureContainer: {
    gap: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  featureNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureNumberText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  featureText: {
    fontSize: 17,
    color: "#4E342E",
    fontWeight: "500" as const,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 32,
  },
  scanButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFF",
  },
});

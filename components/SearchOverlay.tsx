import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Search, X, TrendingUp } from "lucide-react-native";
import { DramaImage } from "./DramaImage";
import type { Drama } from "../lib/drama-data";

const TRENDING_SEARCHES = [
  "Love in Accra",
  "CEO Secret",
  "Juju Rising",
  "Palace Wife",
  "Gold Coast",
];

const GENRES = [
  "All",
  "Romance",
  "Thriller",
  "Fantasy",
  "Comedy",
  "Family Drama",
] as const;

type Genre = (typeof GENRES)[number];

const DEBOUNCE_MS = 300;

type SearchItem =
  | { type: "trending"; id: string; term: string }
  | { type: "drama"; id: string; drama: Drama };

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  dramas: Drama[];
  onDramaTap?: (id: string) => void;
}

export function SearchOverlay({
  open,
  onClose,
  dramas,
  onDramaTap,
}: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<Genre>("All");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when overlay opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setDebouncedQuery("");
      setSelectedGenre("All");
    }
  }, [open]);

  // Debounce the search query
  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(text);
    }, DEBOUNCE_MS);
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleClearQuery = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  const handleGenreSelect = useCallback((genre: Genre) => {
    setSelectedGenre(genre);
  }, []);

  // Filter dramas by debounced query and selected genre
  const results = useMemo(() => {
    const hasQuery = debouncedQuery.trim().length > 0;
    const hasGenre = selectedGenre !== "All";

    if (!hasQuery && !hasGenre) return [];

    const q = debouncedQuery.toLowerCase();

    return dramas.filter((d) => {
      const matchesQuery =
        !hasQuery ||
        d.title.toLowerCase().includes(q) ||
        d.genre.toLowerCase().includes(q);

      const matchesGenre =
        !hasGenre || d.genre.toLowerCase().includes(selectedGenre.toLowerCase());

      return matchesQuery && matchesGenre;
    });
  }, [debouncedQuery, selectedGenre, dramas]);

  const isFiltering =
    debouncedQuery.trim().length > 0 || selectedGenre !== "All";

  const listData = useMemo((): SearchItem[] => {
    if (!isFiltering) {
      return TRENDING_SEARCHES.map((term, i) => ({
        type: "trending" as const,
        id: `t-${i}`,
        term,
      }));
    }
    return results.map((drama) => ({
      type: "drama" as const,
      id: drama.id,
      drama,
    }));
  }, [isFiltering, results]);

  const renderItem = useCallback(({ item }: { item: SearchItem }) => {
    if (item.type === "trending") {
      return (
        <Pressable
          onPress={() => handleQueryChange(item.term)}
          className="flex-row items-center gap-3 py-3 border-b border-border/50 active:scale-[0.97]"
        >
          <TrendingUp size={16} color="#ff4d4d" />
          <Text className="text-sm text-foreground">{item.term}</Text>
        </Pressable>
      );
    }
    const { drama } = item;
    return (
      <Pressable
        onPress={() => {
          onDramaTap?.(drama.id);
          onClose();
        }}
        className="flex-row items-center gap-3 rounded-full p-2 -mx-2 active:bg-card active:scale-[0.97]"
      >
        <View className="w-12 h-16 rounded-md overflow-hidden border border-border/50">
          <DramaImage
            uri={drama.image}
            alt={drama.title}
            width={48}
            height={64}
            contentFit="cover"
            className="w-full h-full"
          />
        </View>
        <View className="flex-1 min-w-0">
          <Text
            className="text-sm font-semibold text-foreground"
            numberOfLines={1}
          >
            {drama.title}
          </Text>
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {drama.genre}
          </Text>
        </View>
      </Pressable>
    );
  }, [handleQueryChange, onDramaTap, onClose]);

  const ListHeaderComponent = () => (
    <View className="pb-2">
      {!isFiltering ? (
        <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Trending searches
        </Text>
      ) : (
        <Text className="text-xs text-muted-foreground">
          {results.length} result{results.length !== 1 ? "s" : ""}
        </Text>
      )}
    </View>
  );

  const ListEmptyComponent = () =>
    isFiltering && results.length === 0 ? (
      <View className="items-center justify-center pt-20 gap-3">
        <Search size={40} color="#3f3f46" />
        <Text className="text-sm text-muted-foreground text-center">
          No dramas found
          {debouncedQuery.trim()
            ? ` for "${debouncedQuery}"`
            : ` in ${selectedGenre}`}
        </Text>
      </View>
    ) : null;

  if (!open) return null;

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-background"
      >
        {/* Search bar */}
        <View className="flex-row items-center gap-3 px-4 pt-4 pb-3 border-b border-border">
          <View className="flex-1 flex-row items-center gap-2.5 bg-card border border-border rounded-full px-3.5 py-2.5">
            <Search size={16} color="#a1a1aa" />
            <TextInput
              testID="search-input"
              value={query}
              onChangeText={handleQueryChange}
              placeholder="Search dramas, genres..."
              placeholderTextColor="#71717a"
              className="flex-1 text-sm text-foreground py-0"
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={handleClearQuery} hitSlop={8}>
                <X size={16} color="#a1a1aa" />
              </Pressable>
            )}
          </View>
          <Pressable onPress={onClose} className="py-2 active:opacity-70">
            <Text className="text-sm font-medium text-primary">Cancel</Text>
          </Pressable>
        </View>

        {/* Genre filter chips */}
        <View className="border-b border-border/50">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
          >
            {GENRES.map((genre) => {
              const isActive = selectedGenre === genre;
              return (
                <Pressable
                  key={genre}
                  onPress={() => handleGenreSelect(genre)}
                  className={`px-3.5 py-1.5 rounded-full transition-colors active:scale-[0.97] active:opacity-80 ${
                    isActive
                      ? "bg-primary"
                      : "bg-white/10"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      isActive
                        ? "text-white"
                        : "text-muted-foreground"
                    }`}
                  >
                    {genre}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Content */}
        <View className="flex-1 px-4 pb-8">
          <FlashList
            data={listData}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={ListEmptyComponent}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

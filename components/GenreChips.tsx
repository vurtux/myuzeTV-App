import { ScrollView, Text, Pressable } from "react-native";

const GENRES = [
  { label: "All", value: "all" },
  { label: "Romance", value: "romance" },
  { label: "Thriller", value: "thriller" },
  { label: "Fantasy", value: "fantasy" },
  { label: "Comedy", value: "comedy" },
  { label: "Family Drama", value: "family_drama" },
] as const;

interface GenreChipsProps {
  selectedGenre: string;
  onSelect: (genre: string) => void;
}

export function GenreChips({ selectedGenre, onSelect }: GenreChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
      className="flex-none"
    >
      {GENRES.map(({ label, value }) => {
        const isActive = selectedGenre === value;

        return (
          <Pressable
            key={value}
            onPress={() => onSelect(value)}
            className={`rounded-full px-4 py-2 transition-colors active:scale-[0.97] active:opacity-80 ${
              isActive ? "bg-primary" : "bg-white/10"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                isActive ? "text-white" : "text-muted-foreground"
              }`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

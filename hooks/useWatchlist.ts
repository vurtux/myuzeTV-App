import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWatchlist, addToWatchlist, removeFromWatchlist } from "../api/watchlist";
import type { Drama } from "../lib/drama-data";

export function useWatchlist() {
  const queryClient = useQueryClient();

  const {
    data: watchlist = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["watchlist"],
    queryFn: fetchWatchlist,
  });

  const addMutation = useMutation({
    mutationFn: (dramaId: string | number) => addToWatchlist(dramaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (dramaId: string | number) => removeFromWatchlist(dramaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  const toggleWatchlist = async (drama: Drama) => {
    const isCurrentlyIn = watchlist.some((d: any) => String(d.id) === String(drama.id));
    if (isCurrentlyIn) {
      await removeMutation.mutateAsync(drama.id);
    } else {
      await addMutation.mutateAsync(drama.id);
    }
  };

  const isInWatchlist = (dramaId: string | number) => {
    return watchlist.some((d: any) => String(d.id) === String(dramaId));
  };

  return {
    watchlist,
    isLoading,
    isError,
    toggleWatchlist,
    isInWatchlist,
    refetch,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}

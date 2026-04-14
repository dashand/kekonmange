import { useState, useEffect, useCallback, useRef } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase(window.location.origin);

export interface Vote {
  id: string;
  restaurant: string;
  nickname: string;
  vote: "up" | "down";
  instance?: string;
}

export interface VoteSummary {
  up: number;
  down: number;
  userVote: "up" | "down" | null;
}

export function useVotes(instanceId?: string, nickname?: string) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const votesRef = useRef(votes);
  votesRef.current = votes;

  useEffect(() => {
    const filter = instanceId ? `instance = '${instanceId}'` : "";
    pb.collection("votes")
      .getFullList({ filter })
      .then((records) => {
        setVotes(
          records.map((r: any) => ({
            id: r.id,
            restaurant: r.restaurant,
            nickname: r.nickname,
            vote: r.vote,
            instance: r.instance || undefined,
          }))
        );
      })
      .catch(console.error);
  }, [instanceId]);

  // Realtime
  useEffect(() => {
    pb.collection("votes").subscribe("*", (e) => {
      const v: Vote = {
        id: e.record.id,
        restaurant: e.record.restaurant,
        nickname: e.record.nickname,
        vote: e.record.vote,
        instance: e.record.instance || undefined,
      };
      if (instanceId && v.instance && v.instance !== instanceId) return;
      setVotes((prev) => {
        if (e.action === "create") {
          if (prev.find((x) => x.id === v.id)) return prev;
          return [...prev, v];
        }
        if (e.action === "update")
          return prev.map((x) => (x.id === v.id ? v : x));
        if (e.action === "delete") return prev.filter((x) => x.id !== v.id);
        return prev;
      });
    });
    return () => {
      pb.collection("votes").unsubscribe("*");
    };
  }, [instanceId]);

  const getVoteSummary = useCallback(
    (restaurantId: string): VoteSummary => {
      const restaurantVotes = votes.filter(
        (v) => v.restaurant === restaurantId
      );
      return {
        up: restaurantVotes.filter((v) => v.vote === "up").length,
        down: restaurantVotes.filter((v) => v.vote === "down").length,
        userVote:
          restaurantVotes.find((v) => v.nickname === nickname)?.vote || null,
      };
    },
    [votes, nickname]
  );

  const castVote = useCallback(
    async (restaurantId: string, voteType: "up" | "down") => {
      if (!nickname) return;

      const existing = votesRef.current.find(
        (v) => v.restaurant === restaurantId && v.nickname === nickname
      );

      if (existing) {
        if (existing.vote === voteType) {
          // Same vote = remove
          await pb.collection("votes").delete(existing.id);
        } else {
          // Different vote = update
          await pb.collection("votes").update(existing.id, { vote: voteType });
        }
      } else {
        // New vote
        await pb.collection("votes").create({
          restaurant: restaurantId,
          nickname,
          vote: voteType,
          instance: instanceId || "",
        });
      }
    },
    [nickname, instanceId]
  );

  return { getVoteSummary, castVote };
}

import { useState, useEffect, useCallback, useRef } from "react";
import PocketBase from "pocketbase";
import { toast } from "sonner";

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
  const busyRef = useRef(false);

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
      const rv = votes.filter((v) => v.restaurant === restaurantId);
      return {
        up: rv.filter((v) => v.vote === "up").length,
        down: rv.filter((v) => v.vote === "down").length,
        userVote: rv.find((v) => v.nickname === nickname)?.vote || null,
      };
    },
    [votes, nickname]
  );

  const castVote = useCallback(
    async (restaurantId: string, voteType: "up" | "down") => {
      if (!nickname || busyRef.current) return;
      busyRef.current = true;

      try {
        // Always re-fetch the current vote from the server to avoid stale state
        const filter = `restaurant = '${restaurantId}' && nickname = '${nickname}'`;
        const existing = await pb.collection("votes").getFullList({ filter });

        if (existing.length > 0) {
          const record = existing[0];
          if (record.vote === voteType) {
            await pb.collection("votes").delete(record.id);
          } else {
            await pb.collection("votes").update(record.id, { vote: voteType });
          }
        } else {
          await pb.collection("votes").create({
            restaurant: restaurantId,
            nickname,
            vote: voteType,
            instance: instanceId || "",
          });
        }
      } catch (err) {
        console.error("Vote error:", err);
        toast.error("Erreur lors du vote");
      } finally {
        busyRef.current = false;
      }
    },
    [nickname, instanceId]
  );

  return { getVoteSummary, castVote };
}

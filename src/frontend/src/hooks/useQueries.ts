import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Coupon, Session, User } from "../backend";
import { useActor } from "./useActor";

export function useGetSessions(statusFilter: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Session[]>({
    queryKey: ["sessions", statusFilter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSessions(statusFilter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCoupons() {
  const { actor, isFetching } = useActor();
  return useQuery<Coupon[]>({
    queryKey: ["coupons"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCoupons();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignListener() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      listener,
    }: { sessionId: string; listener: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.assignListener(sessionId, listener);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useUpdateSessionStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      status,
    }: { sessionId: string; status: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateSessionStatus(sessionId, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useAddCoupon() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      code: string;
      discountType: string;
      discountValue: bigint;
      expiryTimestamp: bigint;
      usageLimit: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addCoupon(
        params.code,
        params.discountType,
        params.discountValue,
        params.expiryTimestamp,
        params.usageLimit,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

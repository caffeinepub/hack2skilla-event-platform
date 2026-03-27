import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EventRegistration, TechEvent, Testimonial } from "../backend.d";
import { useActor } from "./useActor";

export function useEvents(category?: string | null, status?: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<TechEvent[]>({
    queryKey: ["events", category ?? null, status ?? null],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEvents(category ?? null, status ?? null);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useCreateEvent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (event: TechEvent) => {
      if (!actor) throw new Error("Not connected");
      return actor.createEvent(event);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useUpdateEvent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, event }: { id: bigint; event: TechEvent }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateEvent(id, event);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useDeleteEvent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteEvent(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function usePublishEvent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.publishEvent(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useRegisterForEvent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reg: EventRegistration) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerForEvent(reg);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      items,
      successUrl,
      cancelUrl,
    }: {
      items: Array<{
        productName: string;
        currency: string;
        quantity: bigint;
        priceInCents: bigint;
        productDescription: string;
      }>;
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCheckoutSession(items, successUrl, cancelUrl);
    },
  });
}

export function useSubscribeNewsletter() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.subscribeToNewsletter(email);
    },
  });
}

export function useCreateTestimonial() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (t: Testimonial) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTestimonial(t);
    },
  });
}

export function usePublishTestimonial() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.publishTestimonial(id);
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin", actor],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

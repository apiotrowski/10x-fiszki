import { useState, useCallback } from "react";
import type { FlashcardProposalDTO } from "../../types";

/**
 * Extended FlashcardProposal with acceptance status
 */
export interface FlashcardProposalWithStatus extends FlashcardProposalDTO {
  id: string; // Temporary ID for UI purposes
}

interface UseFlashcardProposalsResult {
  proposals: FlashcardProposalWithStatus[];
  acceptedCount: number;
  setProposals: (proposals: FlashcardProposalDTO[], generationId: string) => void;
  toggleProposal: (id: string) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  getAcceptedProposals: () => FlashcardProposalDTO[];
}

/**
 * Custom hook to manage flashcard proposal acceptance/rejection state
 * Tracks which proposals are accepted and provides helper functions
 */
export function useFlashcardProposals(): UseFlashcardProposalsResult {
  const [proposals, setProposalsState] = useState<FlashcardProposalWithStatus[]>([]);

  // Set initial proposals from API response
  const setProposals = useCallback((newProposals: FlashcardProposalDTO[], generationId: string) => {
    const proposalsWithStatus: FlashcardProposalWithStatus[] = newProposals.map((proposal, index) => ({
      ...proposal,
      id: `${generationId}-${index}`,
      generation_id: generationId,
      is_accepted: false, // All proposals are accepted by default
    }));
    setProposalsState(proposalsWithStatus);
  }, []);

  // Toggle acceptance status of a single proposal
  const toggleProposal = useCallback((id: string) => {
    setProposalsState((prev) =>
      prev.map((proposal) => (proposal.id === id ? { ...proposal, is_accepted: !proposal.is_accepted } : proposal))
    );
  }, []);

  // Accept all proposals
  const acceptAll = useCallback(() => {
    setProposalsState((prev) => prev.map((proposal) => ({ ...proposal, is_accepted: true })));
  }, []);

  // Reject all proposals
  const rejectAll = useCallback(() => {
    setProposalsState((prev) => prev.map((proposal) => ({ ...proposal, is_accepted: false })));
  }, []);

  // Get only accepted proposals for saving
  const getAcceptedProposals = useCallback((): FlashcardProposalDTO[] => {
    return proposals.filter((proposal) => proposal.is_accepted).map(({ ...flashcard }) => flashcard);
  }, [proposals]);

  // Count accepted proposals
  const acceptedCount = proposals.filter((p) => p.is_accepted).length;

  return {
    proposals,
    acceptedCount,
    setProposals,
    toggleProposal,
    acceptAll,
    rejectAll,
    getAcceptedProposals,
  };
}

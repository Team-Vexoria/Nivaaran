export const ChallengeTransitionPayload = { challenge_id: z.string(), action: z.string(), resolver: z.object({}).optional() };

test('GOV_VALIDATOR denied on deployment:approve', () => { expect(auth.authorize('deployment:approve', govValidator)).toBeDenied(); });

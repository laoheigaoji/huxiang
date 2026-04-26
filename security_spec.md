# Firestore Security Specification

## Data Invariants
1. A user can only access their own profile.
2. A prediction's `content/details` is only accessible if the user has purchased it (exists in `orders`) or if it's marked as free in the parent prediction document.
3. Users cannot modify their own balance directly via client SDK.
4. Orders can only be created if the user has sufficient balance (enforced via app logic, but Rules should at least check existence). Wait, Rules can't check/decrement balance across docs easily. In a "real" app we'd use Functions, but here we'll do the best we can with Rules.

## The Dirty Dozen Payloads
1. **Identity Spoofing**: Trying to write a user profile with a different UID.
2. **Resource Poisoning**: Writing a prediction with a 1MB string title.
3. **Price Manipulation**: Updating a prediction price to 0.
4. **Illegal Read**: Reading another user's profile.
5. **Unauthorized Unlock**: Reading `predictions/{id}/content/details` without an order.
6. **Balance Injection**: Updating own `balance` to 99999.
7. **Phantom Author**: Creating a prediction with a non-existent author ID.
8. **Malicious Order**: Creating an order for price 0 when the prediction price is 100.
9. **Spam List**: Listing users collection to get all emails.
10. **Shadow Field**: Adding `isAdmin: true` to a user profile.
11. **Negative Balance**: Setting balance to -100.
12. **Future Timestamp**: Setting `createdAt` to a month from now.

## Test Runner (Red Team)
See `firestore.rules.test.ts` (conceptual, we'll implement the rules next).

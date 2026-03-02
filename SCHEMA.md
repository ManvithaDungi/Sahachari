# Firestore Database Schema for Sahachari 

This document outlines the complete data structure for the application.

## 1. Users Collection
**Collection:** `users`
**Document ID:** `uid` (from Firebase Auth)

| Field | Type | Description |
| :--- | :--- | :--- |
| `email` | string | User's email address |
| `displayName` | string | Full name (optional) |
| `photoURL` | string | Profile picture URL (optional) |
| `role` | string | 'user', 'doctor', or 'admin' |
| `isOnboarded` | boolean | True if initial setup is complete |
| `language` | string | Preferred language code (e.g., 'en', 'ta') |
| `healthProfile` | map | Basic health info (optional) |
| `  .age` | number | |
| `  .conditions` | array | List of known conditions (e.g., 'PCOS') |
| `createdAt` | timestamp | Account creation date |

---

## 2. Symptom Logs
**Collection:** `symptom_logs`
**Document ID:** Auto-generated

| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | string | Reference to `users` doc ID |
| `symptoms` | array | List of reported symptoms (strings) |
| `notes` | string | Additional context user provided |
| `result` | map | AI analysis result |
| `  .condition` | string | Predicted condition |
| `  .confidence` | number | Confidence score (0-1) |
| `  .advice` | string | AI generated advice |
| `timestamp` | timestamp | Date of log |

---

## 3. Forum Topics (Static/Admin managed)
**Collection:** `forum_topics`
**Document ID:** `topicId` (e.g., 'PCOS', 'Anemia')

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | string | Unique slug |
| `title` | string | Display title (English) |
| `titleTamil` | string | Display title (Tamil) |
| `description` | string | Topic description |
| `icon` | string | Emoji or specific icon name |
| `color` | string | Theme color for badges/borders |
| `postCount` | number | cached count of posts |

---

## 4. Forum Posts
**Collection:** `forum_posts`
**Document ID:** Auto-generated

| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | string | Author's UID |
| `anonName` | string | Display name like "Anon#1234" |
| `topic` | string | Matches `forum_topics` ID |
| `type` | string | 'text', 'question', 'image' |
| `title` | string | Post title |
| `content` | string | Post body text |
| `imageUrl` | string | Optional image URL |
| `upvotes` | number | Count of upvotes |
| `upvotedBy` | array | List of user IDs who upvoted |
| `commentCount` | number | Count of comments |
| `approved` | boolean | Moderation status |
| `isPinned` | boolean | Admin pinned post |
| `isExpertAnswered` | boolean | True if a doctor replied |
| `createdAt` | timestamp | Creation time |
| `moderation` | map | AI moderation metadata |
| `  .safetyScore` | number | 0-100 Gemini score |
| `  .flags` | array | ['safe', 'triggering'] etc |

---

## 5. Forum Comments (Sub-collection)
**Collection:** `forum_posts/{postId}/comments`
**Document ID:** Auto-generated

| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | string | Author's UID |
| `anonName` | string | "Anon#5678" or "Dr. Smith" |
| `content` | string | Comment text |
| `isExpertComment` | boolean | True if author is role='doctor' |
| `upvotes` | number | Count |
| `upvotedBy` | array | User IDs |
| `createdAt` | timestamp | |
| `approved` | boolean | Moderation status |

---

## 6. Journal Entries
**Collection:** `journal_entries`
**Document ID:** Auto-generated

| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | string | Owner UID |
| `date` | string | 'YYYY-MM-DD' format for easy querying |
| `mood` | string | 'Happy', 'Sad', 'Neutral', etc. |
| `symptoms` | array | ['Cramps', 'Headache'] |
| `energyLevel` | number | 1-10 scale |
| `waterIntake` | number | Glasses drunk |
| `sleepHours` | number | Hours slept |
| `notes` | string | Personal reflection |
| `createdAt` | timestamp | exact time |

---

## 7. Remedies
**Collection:** `remedies`
**Document ID:** Auto-generated

| Field | Type | Description |
| :--- | :--- | :--- |
| `title` | string | Name of remedy |
| `description` | string | Usage instructions |
| `category` | string | 'PCOS', 'Anemia', 'General' |
| `ingredients` | array | List of items needed |
| `isVerified` | boolean | Medically reviewed? |
| `source` | string | Origin of remedy (e.g. 'Ayurveda') |
| `imageUrl` | string | Optional image |

---

## 8. Doctors (Directory)
**Collection:** `doctors`
**Document ID:** Auto-generated or Doctor's UID

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | string | "Dr. Anjali" |
| `specialty` | string | "Gynecologist", "Nutritionist" |
| `location` | geopoint | Lat/Lng for map |
| `address` | string | Text address |
| `phone` | string | Contact number |
| `rating` | number | 0-5 stars |
| `isVerified` | boolean | Platform verified |
| `availableForQA` | boolean | Can accept online questions? |

---

## 9. Doctor Q&A (Private Consults)
**Collection:** `doctor_qa`
**Document ID:** Auto-generated

| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | string | Patient UID |
| `doctorId` | string | Target Doctor UID (optional if open pool) |
| `question` | string | User's question |
| `answer` | string | Doctor's response (initially null) |
| `status` | string | 'open', 'answered', 'closed' |
| `isPublic` | boolean | Can be shown in FAQs? (User consent) |
| `createdAt` | timestamp | |
| `answeredAt` | timestamp | |

---

## 10. Reports (Moderation)
**Collection:** `reports`
**Document ID:** Auto-generated

| Field | Type | Description |
| :--- | :--- | :--- |
| `targetType` | string | 'post', 'comment', 'user' |
| `targetId` | string | ID of the content |
| `reason` | string | 'spam', 'harassment', etc. |
| `reportedBy` | string | Reporter's UID |
| `status` | string | 'pending', 'resolved', 'dismissed' |
| `createdAt` | timestamp | |

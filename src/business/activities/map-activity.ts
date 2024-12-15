import { Activity } from "@/integrations/strava/models/activity";
import { ActivityEntry } from "../../app/velg-luke/[year]/activity-entry";

const emojiNumberMap: Record<string, string> = {
  "0️⃣": "0",
  "1️⃣": "1",
  "2️⃣": "2",
  "3️⃣": "3",
  "4️⃣": "4",
  "5️⃣": "5",
  "6️⃣": "6",
  "7️⃣": "7",
  "8️⃣": "8",
  "9️⃣": "9",
};

const replaceEmojiNumbers = (text: string): string => {
  return text.replace(/[\d]️⃣/g, (emoji) => {
    return emojiNumberMap[emoji] || emoji;
  });
};

const parseActivityName = (name: string): string => {
  const lukeRegex = /luke (?<luke>(\d+){1,2})/i;
  const nameWithoutEmojiNumbers = replaceEmojiNumbers(name);
  const nameWithoutLuke = nameWithoutEmojiNumbers.replace(lukeRegex, "").trim();
  const nameCleaned = nameWithoutLuke.replace(/[:\-\/\|]+$/, "").trim();
  return nameCleaned;
};

const parseCalendarDistance = (activity: Activity): number => {
  const lukeRegex = /luke (?<luke>(\d+){1,2})/i;
  const activityName = replaceEmojiNumbers(activity.name);
  const match = activityName.match(lukeRegex);
  if (match && match.groups?.luke) {
    return Number(match.groups.luke);
  }
  return Math.floor(activity.distance / 1000);
};

export const mapActivity = (activity: Activity): ActivityEntry => ({
  id: activity.id,
  name: parseActivityName(activity.name),
  calendarDistance: parseCalendarDistance(activity),
  startDate: new Date(activity.start_date_local),
  actualDistance: activity.distance / 1000,
});

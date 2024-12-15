import { ActivityEntry } from "@/app/velg-luke/[year]/activity-entry";
import { mapActivity } from "@/business/activities/map-activity";
import { Activity } from "@/integrations/strava/models/activity";

type ActivityDayType = "single" | "double" | "composite";

interface ActivityDayBase {
  dayNumber: number;
  type: ActivityDayType;
}

interface ActivityDaySingle extends ActivityDayBase {
  type: "single";
  activity: ActivityEntry;
}

interface ActivityDayDouble extends ActivityDayBase {
  type: "double";
  activities: [ActivityEntry, ActivityEntry];
}

interface ActivityDayComposite extends ActivityDayBase {
  type: "composite";
  activities: ActivityEntry[];
}

export type ActivityDay =
  | ActivityDaySingle
  | ActivityDayDouble
  | ActivityDayComposite;

export const mapActivitiesToDays = (activities: Activity[]): ActivityDay[] => {
  const runningActivities = activities
    .filter((a) => a.type === "Run")
    .map(mapActivity);
  const activitiesByDay = Map.groupBy(runningActivities, (activity) =>
    activity.startDate.getDate()
  );
  const activityMap = new Map<number, ActivityDay>();
  for (const [dayNumber, activities] of activitiesByDay) {
    if (activities?.length === 1) {
      const activity = activities[0];
      activityMap.set(dayNumber, {
        dayNumber: activity.calendarDistance,
        type: "single",
        activity: activity,
      });
      activitiesByDay.delete(dayNumber);
    }
  }
  for (const [dayNumber, activities] of activitiesByDay) {
    const totalActualDistance = activities.reduce<number>(
      (acc, activity) => acc + activity.actualDistance,
      0
    );

    const compositeAcitivity: ActivityDayComposite = {
      dayNumber: Math.floor(totalActualDistance),
      type: "composite",
      activities,
    };

    if (!activityMap.has(compositeAcitivity.dayNumber)) {
      activityMap.set(compositeAcitivity.dayNumber, compositeAcitivity);
      activitiesByDay.delete(dayNumber);
    }
  }
  for (const [dayNumber, activities] of activitiesByDay) {
    const sortedActivities = activities.sort(
      (a, b) => a.calendarDistance - b.calendarDistance
    );
    const activityDay: ActivityDayDouble = {
      dayNumber: dayNumber,
      type: "double",
      activities: [sortedActivities[0], sortedActivities[1]],
    };
    const totalCalendarDistance = activityDay.activities.reduce(
      (acc, activity) => acc + activity.calendarDistance,
      0
    );
    if (!activityMap.has(totalCalendarDistance)) {
      activityMap.set(totalCalendarDistance, activityDay);
      activitiesByDay.delete(dayNumber);
    }
  }
  return [...activityMap.values()];
};

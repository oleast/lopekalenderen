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
  activity: ActivityEntry;
  siblingActivity: ActivityEntry;
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
      activityMap.set(activity.calendarDistance, {
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
    if (activities.length !== 2) {
      continue;
    }
    const [activityA, activityB] = activities.sort(
      (a, b) => a.calendarDistance - b.calendarDistance
    );
    const activityDayA: ActivityDayDouble = {
      type: "double",
      dayNumber: activityA.calendarDistance,
      activity: activityA,
      siblingActivity: activityB,
    };
    const activityDayB: ActivityDayDouble = {
      type: "double",
      dayNumber: activityB.calendarDistance,
      activity: activityB,
      siblingActivity: activityA,
    };

    if (
      !activityMap.has(activityDayA.dayNumber) &&
      !activityMap.has(activityDayB.dayNumber)
    ) {
      activityMap.set(activityDayA.dayNumber, activityDayA);
      activityMap.set(activityDayB.dayNumber, activityDayB);
      activitiesByDay.delete(dayNumber);
    }
  }
  return [...activityMap.values()];
};

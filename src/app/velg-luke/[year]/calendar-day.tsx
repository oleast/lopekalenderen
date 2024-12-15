import { FC, Fragment } from "react";
import cn from "classnames";
import { ActivityDay } from "@/business/activities/map-activities-to-days";

interface Props {
  date: Date;
  activityDay: ActivityDay | null;
}

export const CalendarDay: FC<Props> = ({ date, activityDay }) => {
  const isCompleted = activityDay !== null;
  return (
    <li
      className={cn("aspect-square flex items-center justify-center relative", {
        "bg-gray-200 border border-solid text-black": isCompleted,
        "paint-dashed-border text-white": !isCompleted,
      })}
    >
      <time
        className={cn("text-4xl absolute", {
          "text-green-950": isCompleted,
          "text-gray-200": !isCompleted,
        })}
        dateTime={date.toISOString()}
      >
        {date.getDate()}
      </time>
      {activityDay ? (
        <p className="absolute bottom-[10%] text-xs text-center mx-2 leading-tight">
          {activityDay.type === "single" && (
            <span>
              {activityDay.activity.name} (
              {activityDay.activity.actualDistance.toFixed(2)}
              &nbsp;km)
            </span>
          )}
          {activityDay.type === "double" && (
            <span>
              {activityDay.activities[0].name} (
              {activityDay.activities[0].actualDistance.toFixed(2)}&nbsp;km) +{" "}
              {activityDay.activities[1].name} (
              {activityDay.activities[1].actualDistance.toFixed(2)}&nbsp;km)
            </span>
          )}
          {activityDay.type === "composite" && (
            <span>
              {activityDay.activities.map((a) => (
                <Fragment key={a.id}>
                  {a.name} ({a.actualDistance.toFixed(2)}&nbsp;km){" "}
                </Fragment>
              ))}
            </span>
          )}
        </p>
      ) : null}
    </li>
  );
};

import { FC } from "react";
import { ActivityEntry } from "./activity-entry";
import cn from "classnames";

interface Props {
  date: Date;
  activityEntry: ActivityEntry | null;
}

export const CalendarDay: FC<Props> = ({ date, activityEntry }) => {
  const isCompleted = activityEntry !== null;
  return (
    <li
      className={cn("aspect-square flex items-center justify-center relative", {
        "bg-gray-200 border border-solid text-black": isCompleted,
        "border border-dashed text-white": !isCompleted,
      })}
    >
      <time
        className={cn("text-4xl absolute", {
          "text-green-950": isCompleted,
          "text-gray-400": !isCompleted,
        })}
        dateTime={date.toISOString()}
      >
        {date.getDate()}
      </time>
      {activityEntry ? (
        <p className="absolute bottom-[20%] text-xs text-center">
          {activityEntry.name}
        </p>
      ) : null}
    </li>
  );
};

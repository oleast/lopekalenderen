import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { cache, FC } from "react";
import { CalendarDay } from "./calendar-day";
import { getActivities } from "@/integrations/strava/resources/activities";
import { mapActivitiesToDays } from "@/business/activities/map-activities-to-days";

interface Params {
  year: string;
}

const getDecemberDates = (year: string): Date[] => {
  const startDate = new Date(`${year}-12-01`);
  const endDate = new Date(`${year}-12-24`);
  const dates: Date[] = [];

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    dates.push(new Date(date));
  }

  return dates;
};

const getActivitiesCached = cache(getActivities);

const CalendarYearPage: FC<{ params: Promise<Params> }> = async ({
  params,
}) => {
  const session = await auth();
  if (!session?.accessToken) {
    return notFound();
  }
  const { year } = await params;
  const calendarStartDate = new Date(`${year}-12-01T00:00:00Z`);
  const calendarEndDate = new Date(`${year}-12-24T23:59:59Z`);
  const activities = await getActivitiesCached(
    session.accessToken,
    calendarStartDate,
    calendarEndDate,
    1,
    200
  );
  const activityDays = mapActivitiesToDays(activities);

  const totalDistance = activityDays.reduce((acc, a) => acc + a.dayNumber, 0);

  const dates = getDecemberDates(year);
  const goalTotal = dates.reduce((acc, date) => {
    const day = date.getDate();
    return acc + day;
  }, 0);

  return (
    <main className="max-w-[800px] lg:max-w-[1240px] mx-auto px-4 my-12 text-white">
      <h1 className="text-8xl text-center mb-8">{year}</h1>
      <p className="text-4xl text-center mb-8">
        <i>{totalDistance}</i> / {goalTotal} km
      </p>
      <p className="text-4xl text-center mb-8">
        <i>
          {(
            (goalTotal - totalDistance) /
            (dates.length - new Date().getDate())
          ).toFixed(2)}
        </i>{" "}
        / {(goalTotal / dates.length).toFixed(2)} km
      </p>
      <ul className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
        {dates.map((date) => (
          <CalendarDay
            key={date.getDate()}
            date={date}
            activityDay={
              activityDays.find((a) => a.dayNumber === date.getDate()) ?? null
            }
          />
        ))}
      </ul>
    </main>
  );
};

export default CalendarYearPage;

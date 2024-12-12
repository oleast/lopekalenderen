import { auth } from "@/auth";
import { Activity } from "@/integrations/strava/models/activity";
import { notFound } from "next/navigation";
import { cache, FC } from "react";
import { CalendarDay } from "./calendar-day";
import { mapActivity } from "./map-activity";

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

const getActivities = async (
  token: string,
  year: string
): Promise<Activity[]> => {
  const stravaApiUrl = "https://www.strava.com/api/v3";
  const page = 1;
  const pageSize = 200;

  const calendarStartDate = Math.floor(
    new Date(`${year}-12-01T00:00:00Z`).getTime() / 1000
  );
  const calendarEndDate = Math.floor(
    new Date(`${year}-12-24T23:59:59Z`).getTime() / 1000
  );

  const response = await fetch(
    `${stravaApiUrl}/athlete/activities?before=${calendarEndDate}&after=${calendarStartDate}&page=${page}&per_page=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const result = await response.json();

  return result;
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
  const activities = await getActivitiesCached(session.accessToken, year);
  const runningActivities = activities
    .filter((a) => a.type === "Run")
    .map(mapActivity);
  const totalDistance = runningActivities.reduce(
    (acc, a) => acc + a.calendarDistance,
    0
  );

  const dates = getDecemberDates(year);
  const goalTotal = dates.reduce((acc, date) => {
    const day = date.getDate();
    return acc + day;
  }, 0);

  return (
    <main className="max-w-[800px] mx-auto my-12 text-white">
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
      <ul className="grid grid-cols-4 gap-6">
        {dates.map((date) => (
          <ul className="" key={date.getDate()}>
            <CalendarDay
              date={date}
              activityEntry={
                runningActivities.find(
                  (a) => a.calendarDistance === date.getDate()
                ) ?? null
              }
            />
          </ul>
        ))}
      </ul>
    </main>
  );
};

export default CalendarYearPage;

import { STRAVA_API_URL } from "../constants";
import { Activity } from "../models/activity";

export const getActivities = async (
  token: string,
  startDate: Date,
  endDate: Date,
  page: number,
  pageSize: number
): Promise<Activity[]> => {
  const startTime = startDate.getTime() / 1000;
  const endTime = endDate.getTime() / 1000;
  const response = await fetch(
    `${STRAVA_API_URL}/athlete/activities?after=${startTime}&before=${endTime}&page=${page}&per_page=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const result = await response.json();

  return result;
};

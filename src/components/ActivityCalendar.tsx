import { ActivityCalendar } from "react-activity-calendar";
import type { Activity } from "@lib/github";

interface Props {
  data: Activity[];
}

const theme = {
  light: ["#f0ede7", "#fdba74", "#fb923c", "#f97316", "#ea580c"],
  dark: ["#1a1a1a", "#7c2d12", "#c2410c", "#ea580c", "#fb923c"],
};

export default function ActivityCalendarComponent({ data }: Props) {
  return (
    <ActivityCalendar
      data={data}
      theme={theme}
      maxLevel={4}
      labels={{
        months: [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ],
        weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        totalCount: "{{count}} contributions in the last year",
      }}
    />
  );
}

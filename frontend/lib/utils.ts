import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(timeString: string) {
  const options = {
    hour: "numeric" as "numeric",
    minute: "numeric" as "numeric",
    hour12: true,
  };

  const time = new Date(`1970-01-01T${timeString}`);
  if (isNaN(time.getTime())) {
    console.error("Invalid time string:", timeString);
    return "Invalid time";
  }

  return new Intl.DateTimeFormat("en-US", options).format(time);
}

export function roundDistanceToHundreds(distance: number) {
  return Math.round(distance * 100) / 100;
}

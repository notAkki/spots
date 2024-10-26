export const sendUserLocation = async (latitude: number, longitude: number) => {
  try {
    const res = await fetch(`/api/open-spots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lat: latitude,
        lng: longitude,
      }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch data from backend:", error);
  }
};

export const sendDefaultLocationData = async () => {
  const response = await fetch("/api/open-spots");
  const data = await response.json();
  return data;
};

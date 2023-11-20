import { Button, CircularProgress } from "@mui/material";
import { useState } from "react";

type FormProps = {
  onNextStep: () => void;
  userId: number;
  setGeolocationApi: (value: string) => void;
};

export default function FormTwo({
  onNextStep,
  userId,
  setGeolocationApi,
}: FormProps) {
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);

    const disasterEndpoint = `http://localhost:8082/disaster?userSessionId=${userId}`;

    try {
      const response = await fetch(disasterEndpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      setGeolocationApi(data);
      onNextStep();
    } catch (error) {
      console.error("Error calling API:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <CircularProgress />
      ) : (
        <Button variant="contained" onClick={handleNext}>
          Prove My Geolocation
        </Button>
      )}
    </div>
  );
}

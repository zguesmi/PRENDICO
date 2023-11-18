import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import FormOne from "./forms/formOne";
import FormTwo from "./forms/formTwo";
import FormThree from "./forms/formThree";

type FormProps = {
  onNextStep: () => void;
  userId: number;
};

export default function MultiStepForm() {
  const [step, setStep] = useState(0);
  const userId = Math.floor(Math.random() * 1_000_000) + 1;

  const handleNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const renderForm = () => {
    switch (step) {
      case 0:
        return <FormOne onNextStep={handleNextStep} userId={userId} />;
      case 1:
        return <FormTwo onNextStep={handleNextStep} userId={userId} />;
      case 2:
        return <FormThree onNextStep={handleNextStep} userId={userId} />;
      case 3:
        return <Success />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 6, maxWidth: 900, margin: "auto" }}>
      <Stepper activeStep={step} alternativeLabel sx={{ p: 2 }}>
        <Step>
          <StepLabel>Verify Phone Number</StepLabel>
        </Step>
        <Step>
          <StepLabel>verify Geolocation</StepLabel>
        </Step>
        <Step>
          <StepLabel>Claim Compensation</StepLabel>
        </Step>
        <Step>
          <StepLabel>Success</StepLabel>
        </Step>
      </Stepper>
      <Paper
        sx={{
          p: 3,
          margin: "auto",
          backgroundColor: "rgba(255, 255, 255, 0.4)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {renderForm()}
        </Box>
      </Paper>
    </Box>
  );
}

const Success = () => (
  <div>
    <Typography variant="h6" gutterBottom>
      Success
    </Typography>
    {/* Add your Success fields and logic here */}
  </div>
);

import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  CircularProgress,
} from "@mui/material";

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

const FormOne = ({ onNextStep, userId }: FormProps) => {
  const [identityNumber, setIdentityNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [haveVerificationCode, setHaveVerificationCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);

    const phoneNumber = identityNumber.trim();
    const firstEndpoint = `http://localhost:8081/verificationcode?phoneNumber=${phoneNumber}`;

    try {
      const firstResponse = await fetch(firstEndpoint);

      if (!firstResponse.ok) {
        throw new Error(`HTTP error! Status: ${firstResponse.status}`);
      }
      const firstData = await firstResponse.json();
      setHaveVerificationCode(true);
      console.log("First Response:", firstData);
    } catch (error) {
      console.error("Error calling API:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSecondEndpoint = async () => {
    const secondEndpoint = `http://localhost:8081/verifycode?verificationCode=${verificationCode}&userSessionId=${userId}&phoneNumber=${identityNumber.trim()}`;

    try {
      const secondResponse = await fetch(secondEndpoint);

      if (!secondResponse.ok) {
        throw new Error(`HTTP error! Status: ${secondResponse.status}`);
      }

      const secondData = await secondResponse.json();
      console.log("Second Response:", secondData);

      onNextStep(); // Move to the next step after calling the second endpoint
    } catch (error) {
      console.error("Error calling second API:", error);
    }
  };

  return (
    <Box sx={{ width: "100%", mx: 4 }}>
      <Typography variant="h6" gutterBottom>
        Fill it
      </Typography>
      <TextField
        label="Telephone Number"
        variant="outlined"
        fullWidth
        value={identityNumber}
        onChange={(e) => setIdentityNumber(e.target.value)}
        margin="normal"
      />
      {loading ? (
        <CircularProgress />
      ) : (
        <div>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!identityNumber.trim()} // Disable if verificationCode is empty
          >
            Get Verification Code
          </Button>
          {haveVerificationCode && (
            <div>
              <TextField
                label="Verification Code"
                variant="outlined"
                fullWidth
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                margin="normal"
              />
              <Button
                variant="contained"
                onClick={handleSecondEndpoint}
                disabled={!verificationCode.trim()} // Disable if verificationCode is empty
              >
                Verify My Code
              </Button>
            </div>
          )}
        </div>
      )}
    </Box>
  );
};

const FormTwo = ({ onNextStep, userId }: FormProps) => {
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);

    const disasterEndpoint = `http://localhost:8080/disaster?userSessionId=${userId}`;

    try {
      const response = await fetch(disasterEndpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
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
};

const FormThree = ({ onNextStep, userId }: FormProps) => {
  const handleNext = () => {
    //TODO: Call smart contract
    onNextStep();
  };

  return (
    <div>
      <Button variant="contained" onClick={handleNext} sx={{ mt: 2 }}>
        Claim Compensation
      </Button>
    </div>
  );
};

const Success = () => (
  <div>
    <Typography variant="h6" gutterBottom>
      Success
    </Typography>
    {/* Add your Success fields and logic here */}
  </div>
);

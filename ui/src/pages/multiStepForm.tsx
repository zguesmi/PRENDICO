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
} from "@mui/material";

type FormProps = {
  onNextStep: () => void;
};

export default function MultiStepForm() {
  const [step, setStep] = useState(0);

  const handleNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const renderForm = () => {
    switch (step) {
      case 0:
        return <FormOne onNextStep={handleNextStep} />;
      case 1:
        return <FormTwo onNextStep={handleNextStep} />;
      case 2:
        return <FormThree onNextStep={handleNextStep} />;
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
          <StepLabel>Form 1</StepLabel>
        </Step>
        <Step>
          <StepLabel>Form 2</StepLabel>
        </Step>
        <Step>
          <StepLabel>Form 3</StepLabel>
        </Step>
        <Step>
          <StepLabel>Success</StepLabel>
        </Step>
      </Stepper>
      <Paper sx={{ p: 3, maxWidth: 700, margin: "auto" }}>{renderForm()}</Paper>
    </Box>
  );
}

const FormOne = ({ onNextStep }: FormProps) => {
  const [identityNumber, setIdentityNumber] = useState("");

  const handleNext = () => {
    // You can add validation logic here before moving to the next step
    onNextStep();
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Form 1
      </Typography>
      <TextField
        label="Identity Number"
        variant="outlined"
        fullWidth
        value={identityNumber}
        onChange={(e) => setIdentityNumber(e.target.value)}
        margin="normal"
      />
      <Button variant="contained" onClick={handleNext} sx={{ mt: 2 }}>
        Verify
      </Button>
    </div>
  );
};

const FormTwo = ({ onNextStep }: FormProps) => {
  const [fieldTwo, setFieldTwo] = useState("");

  const handleNext = () => {
    // You can add validation logic here before moving to the next step
    onNextStep();
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Form 2
      </Typography>
      <TextField
        label="Field Two"
        variant="outlined"
        fullWidth
        value={fieldTwo}
        onChange={(e) => setFieldTwo(e.target.value)}
        margin="normal"
      />
      <Button variant="contained" onClick={handleNext} sx={{ mt: 2 }}>
        Submit
      </Button>
    </div>
  );
};

const FormThree = ({ onNextStep }: FormProps) => {
  const [fieldThree, setFieldThree] = useState("");

  const handleNext = () => {
    // You can add validation logic here before moving to the next step
    onNextStep();
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Form 3
      </Typography>
      <TextField
        label="Field Three"
        variant="outlined"
        fullWidth
        value={fieldThree}
        onChange={(e) => setFieldThree(e.target.value)}
        margin="normal"
      />
      <Button variant="contained" onClick={handleNext} sx={{ mt: 2 }}>
        Claim
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

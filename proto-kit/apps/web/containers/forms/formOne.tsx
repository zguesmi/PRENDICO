import {
  TextField,
  Typography,
  Box,
  CircularProgress,
  Button,
} from "@mui/material";
import { useState } from "react";

type FormProps = {
  onNextStep: () => void;
  userId: number;
  setPhoneApi: (value: string) => void;
};

export default function FormOne({
  onNextStep,
  userId,
  setPhoneApi,
}: FormProps) {
  const [identityNumber, setIdentityNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [haveVerificationCode, setHaveVerificationCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [verificationCodeError, setVerificationCodeError] = useState("");

  const handleNext = async () => {
    setLoading(true);

    const phoneNumber = identityNumber.trim();

    // Validate phone number
    // Update the regular expression for phone number validation
    const isValidPhoneNumber =
      /^(\+\d{1,2}\s?)?(\(\d{1,4}\)|\d{1,4})\s?\d{1,15}$/.test(
        identityNumber.trim(),
      );
    if (!isValidPhoneNumber) {
      setPhoneNumberError("Invalid phone number");
      setLoading(false);
      return;
    }

    // Continue with API call
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
      setPhoneApi(secondData);

      onNextStep(); // Move to the next step after calling the second endpoint
    } catch (error) {
      console.error("Error calling second API:", error);
      setVerificationCodeError("Error verifying code. Please try again."); // Display validation error
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
        onChange={(e) => {
          setIdentityNumber(e.target.value);
          setPhoneNumberError("");
        }}
        margin="normal"
        error={!!phoneNumberError}
        helperText={phoneNumberError}
      />
      {loading ? (
        <CircularProgress />
      ) : (
        <div>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!identityNumber.trim() || !!phoneNumberError} // Disable if validation error or identityNumber is empty
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
                onChange={(e) => {
                  setVerificationCode(e.target.value);
                  setVerificationCodeError("");
                }}
                margin="normal"
                error={!!verificationCodeError}
                helperText={verificationCodeError}
              />
              <Button
                variant="contained"
                onClick={handleSecondEndpoint}
                disabled={!verificationCode.trim() || !!verificationCodeError} // Disable if validation error or verificationCode is empty
              >
                Verify My Code
              </Button>
            </div>
          )}
        </div>
      )}
    </Box>
  );
}

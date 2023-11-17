import React from "react";
import { Typography, Card, CardContent } from "@mui/material";
import MultiStepForm from "./multiStepForm";
import WarningIcon from "@mui/icons-material/Warning";

const WarningBox = ({ message }: { message: string }) => {
  return (
    <Card
      sx={{
        maxWidth: 400,
        margin: "auto",
        marginTop: 1,
        backgroundColor: "#ffcccb",
        display: "flex",
        alignItems: "center",
      }}
    >
      <WarningIcon color="error" sx={{ fontSize: 40, margin: 2 }} />
      <CardContent>
        <Typography variant="h6" align="center" color="error">
          {message}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default function Content() {
  return (
    <div>
      <WarningBox
        message={"Please be sure to create your Clorio wallet before signing"}
      />
      <MultiStepForm />
    </div>
  );
}

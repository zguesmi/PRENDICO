import { Button } from "@mui/material";

type FormProps = {
  onNextStep: () => void;
  userId: number;
};

export default function FormThree({ onNextStep, userId }: FormProps) {
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
}

import Head from "next/head";
import { useState } from "react";
import GradientBG from "../components/GradientBG.js";
import {
  AppBar,
  Button,
  Toolbar,
  createTheme,
  ThemeProvider,
  Snackbar,
  Alert,
} from "@mui/material";
import "../styles/Home.module.css";
import Content from "./content";
import Image from "next/image";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1eaae2", // UNICEF Blue
    },
    secondary: {
      main: "#c5352d", // UNICEF Red
    },
  },
});

export default function Home() {
  const [account, setAccount] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  const addInfo = {
    url: encodeURIComponent("https://proxy.devnet.minaexplorer.com"),
    name: "devnet",
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setErrorOpen(false);
    setSuccessOpen(false);
  };

  const connectWallet = async () => {
    try {
      if (window.mina) {
        console.log("Auro Wallet is installed!");

        // Get Account
        const accounts: string[] = await window.mina.requestAccounts();
        setAccount(accounts[0]);
        // Switch to Custom chain
        await window.mina?.addChain(addInfo);

        //auto detect chainChanged
        window.mina.on("chainChanged", async () => {
          console.log("chain changed");
          await window.mina?.addChain(addInfo);
        });
        //auto detect accountsChanged
        window.mina.on("accountsChanged", (updatedAccounts: string[]) => {
          console.log(updatedAccounts);
          setAccount(updatedAccounts[0]);
          setSuccessOpen(true);
        });
        setSuccessOpen(true);
      } else {
        setErrorMessage("Auro Wallet is not installed");
        setErrorOpen(true); // Show alert Snackbar
      }
    } catch (error: any) {
      console.error("Error connecting to wallet:", error);
      setErrorMessage(`Error connecting to wallet: ${error.message}`);
      setErrorOpen(true); // Show alert Snackbar
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>UNICEF</title>
        <meta name="description" content="built with o1js" />
        <link rel="icon" href="/assets/unicef.png" />
      </Head>
      <GradientBG>
        <Snackbar
          open={errorOpen}
          autoHideDuration={2_000}
          onClose={handleClose}
        >
          <Alert
            elevation={6}
            variant="filled"
            severity="error"
            onClose={handleClose}
            sx={{ width: "100%" }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
        <Snackbar
          open={successOpen}
          autoHideDuration={2_000}
          onClose={handleClose}
        >
          <Alert
            elevation={6}
            variant="filled"
            severity="success"
            onClose={handleClose}
            sx={{ width: "100%" }}
          >
            Account connected successfully!
          </Alert>
        </Snackbar>
        <AppBar position="static">
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Image
              src="/assets/UNICEF-logo.png"
              alt="UNICEF Logo"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "11%", height: "auto" }}
            />
            <div>
              {(account === null || account === "") && (
                <Button color="inherit" onClick={connectWallet}>
                  Login
                </Button>
              )}
              <a
                href="https://www.aurowallet.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button color="inherit">Sign up</Button>
              </a>
            </div>
          </Toolbar>
        </AppBar>
        <Content />
      </GradientBG>
    </ThemeProvider>
  );
}

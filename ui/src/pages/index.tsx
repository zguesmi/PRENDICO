import Head from "next/head";
import { useEffect } from "react";
import GradientBG from "../components/GradientBG.js";
import {
  AppBar,
  Button,
  Toolbar,
  createTheme,
  ThemeProvider,
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
  useEffect(() => {
    (async () => {
      const { Mina, PublicKey } = await import("o1js");
      const { Add } = await import("../../../contracts/build/src/");

      // Update this to use the address (public key) for your zkApp account.
      // To try it out, you can try this address for an example "Add" smart contract that we've deployed to
      // Berkeley Testnet B62qkwohsqTBPsvhYE8cPZSpzJMgoKn4i1LQRuBAtVXWpaT4dgH6WoA.
      const zkAppAddress = "";
      // This should be removed once the zkAppAddress is updated.
      if (!zkAppAddress) {
        console.error(
          'The following error is caused because the zkAppAddress has an empty string as the public key. Update the zkAppAddress with the public key for your zkApp account, or try this address for an example "Add" smart contract that we deployed to Berkeley Testnet: B62qkwohsqTBPsvhYE8cPZSpzJMgoKn4i1LQRuBAtVXWpaT4dgH6WoA'
        );
      }
      //const zkApp = new Add(PublicKey.fromBase58(zkAppAddress))
    })();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>UNICEF</title>
        <meta name="description" content="built with o1js" />
        <link rel="icon" href="/assets/unicef.png" />
      </Head>
      <GradientBG>
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
              <Button color="inherit">Login</Button>
              <Button color="inherit">Sign up</Button>
            </div>
          </Toolbar>
        </AppBar>
        <Content />
      </GradientBG>
    </ThemeProvider>
  );
}

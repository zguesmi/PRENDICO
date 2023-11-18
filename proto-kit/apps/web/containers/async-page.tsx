"use client";
import { Faucet } from "@/components/faucet";
import { useFaucet } from "@/lib/stores/balances";
import { useWalletStore } from "@/lib/stores/wallet";
import Content from "./content";

export default function Home() {
  const wallet = useWalletStore();
  const drip = useFaucet();

  return (
    <div>
      <Content />
    </div>
  );
}

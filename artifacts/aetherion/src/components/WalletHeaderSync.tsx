import { useEffect } from "react";
import { useAccount } from "wagmi";
import { setExtraHeaders } from "@workspace/api-client-react";

export function WalletHeaderSync() {
  const { address } = useAccount();

  useEffect(() => {
    if (address) {
      setExtraHeaders({ "x-wallet-address": address.toLowerCase() });
    } else {
      setExtraHeaders({});
    }
  }, [address]);

  return null;
}

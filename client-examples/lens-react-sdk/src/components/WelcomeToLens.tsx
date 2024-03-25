import {
  SessionType,
  useSession as useLensSession,
} from "@lens-protocol/react-web";
import { useAccount as useWagmiAccount } from "wagmi";

import { ConnectWalletButton } from "./ConnectWalletButton";
import { LoginForm } from "./LoginForm";
import { LogoutButton } from "./LogoutButton";
import { truncateEthAddress } from "@/utils/truncateEthAddress";
import { DisconnectWalletButton } from "./DisconnectWalletButton";

export function WelcomeToLens() {
  const { isConnected, address } = useWagmiAccount();
  const { data: session } = useLensSession();

  // step 1. connect wallet
  if (!isConnected) {
    return (
      <div className="mt-4 mb-8">
        <ConnectWalletButton />
      </div>
    );
  }

  // step 2. connect Lens Profile
  if (!session?.authenticated && address) {
    return (
      <>
        <LoginForm owner={address} />

        <div className="mt-8 mb-8">
          <DisconnectWalletButton />
        </div>

        <p className="mb-8 text-gray-200">
          Connected wallet: {truncateEthAddress(address)}
        </p>
      </>
    );
  }

  // step 3. show Profile details
  if (session && session.type === SessionType.WithProfile) {
    return (
      <>
        <div className="mt-6">
          <LogoutButton />
        </div>
        <p className="mb-8 mt-4 text-gray-200">
          You are logged in as{" "}
          <span className="text-gray-400 font-semibold">
            {session.profile.handle?.fullHandle ?? session.profile.id}
          </span>
          .
        </p>
      </>
    );
  }

  // you can handle other session types here
  return null;
}

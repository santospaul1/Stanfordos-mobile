import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import * as Network from "expo-network";
import { onlineManager } from "@tanstack/react-query";

interface NetworkContextValue {
  isOnline: boolean;
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}

const NetworkContext = createContext<NetworkContextValue>({
  isOnline: true,
  isConnected: null,
  isInternetReachable: null,
});

export function NetworkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [network, setNetwork] =
    useState<NetworkContextValue>({
      isOnline: true,
      isConnected: null,
      isInternetReachable: null,
    });

  useEffect(() => {
    let mounted = true;

    const updateNetwork = (
      state: Network.NetworkState
    ) => {
      if (!mounted) return;

      // Treat an explicitly disconnected or unreachable device
      // as offline. Unknown reachability is not proof of internet.
      const online =
        state.isConnected === true &&
        state.isInternetReachable !== false;

      setNetwork({
        isOnline: online,
        isConnected: state.isConnected ?? null,
        isInternetReachable:
          state.isInternetReachable ?? null,
      });

      onlineManager.setOnline(online);
    };

    Network.getNetworkStateAsync()
      .then(updateNetwork)
      .catch(() => {
        if (!mounted) return;

        setNetwork({
          isOnline: false,
          isConnected: false,
          isInternetReachable: false,
        });

        onlineManager.setOnline(false);
      });

    const subscription =
      Network.addNetworkStateListener(updateNetwork);

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return (
    <NetworkContext.Provider value={network}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useCallback, useState } from "react";
import sdk, {
  AddFrame,
  FrameNotificationDetails,
  SignIn as SignInCore,
  type Context,
} from "@farcaster/frame-sdk";
import {
  useAccount,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
  useWaitForTransactionReceipt,
  useDisconnect,
  useConnect,
  useSwitchChain,
  useChainId,
} from "wagmi";

import { config } from "~/components/providers/WagmiProvider";
import { PurpleButton } from "~/components/ui/PurpleButton";
import { truncateAddress } from "~/lib/truncateAddress";
import { base, optimism } from "wagmi/chains";
import { useSession } from "next-auth/react";
import { createStore } from "mipd";
import { Label } from "~/components/ui/label";
import { PROJECT_TITLE } from "~/lib/constants";

export default function Frame(
  { title }: { title?: string } = { title: PROJECT_TITLE }
) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const [added, setAdded] = useState(false);

  const [lastEvent, setLastEvent] = useState("");

  const [addFrameResult, setAddFrameResult] = useState("");

  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const {
    sendTransaction,
    error: sendTxError,
    isError: isSendTxError,
    isPending: isSendTxPending,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

  const {
    signTypedData,
    error: signTypedError,
    isError: isSignTypedError,
    isPending: isSignTypedPending,
  } = useSignTypedData();

  const { disconnect } = useDisconnect();
  const { connect } = useConnect();

  const {
    switchChain,
    error: switchChainError,
    isError: isSwitchChainError,
    isPending: isSwitchChainPending,
  } = useSwitchChain();

  const handleSwitchChain = useCallback(() => {
    switchChain({ chainId: chainId === base.id ? optimism.id : base.id });
  }, [switchChain, chainId]);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      if (!context) {
        return;
      }

      setContext(context);
      setAdded(context.client.added);

      sdk.on("frameAdded", ({ notificationDetails }) => {
        setLastEvent(
          `frameAdded${!!notificationDetails ? ", notifications enabled" : ""}`
        );

        setAdded(true);
      });

      sdk.on("frameAddRejected", ({ reason }) => {
        setLastEvent(`frameAddRejected, reason ${reason}`);
      });

      sdk.on("frameRemoved", () => {
        setLastEvent("frameRemoved");
        setAdded(false);
      });

      sdk.on("notificationsEnabled", ({ notificationDetails }) => {
        setLastEvent("notificationsEnabled");
      });
      sdk.on("notificationsDisabled", () => {
        setLastEvent("notificationsDisabled");
      });

      sdk.on("primaryButtonClicked", () => {
        console.log("primaryButtonClicked");
      });

      console.log("Calling ready");
      sdk.actions.ready({});

      // Set up a MIPD Store, and request Providers.
      const store = createStore();

      // Subscribe to the MIPD Store.
      store.subscribe((providerDetails) => {
        console.log("PROVIDER DETAILS", providerDetails);
        // => [EIP6963ProviderDetail, EIP6963ProviderDetail, ...]
      });
    };
    if (sdk && !isSDKLoaded) {
      console.log("Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);

  const handleAddFrameResult = useCallback((result: any) => {
    setAddFrameResult(
      result.notificationDetails
        ? `Added, got notificaton token ${result.notificationDetails.token} and url ${result.notificationDetails.url}`
        : "Added, got no notification details"
    );
  }, []);

  const handleAddFrameError = useCallback((error: any) => {
    if (error instanceof AddFrame.RejectedByUser) {
      setAddFrameResult(`Not added: ${error.message}`);
    } else if (error instanceof AddFrame.InvalidDomainManifest) {
      setAddFrameResult(`Not added: ${error.message}`);
    } else {
      setAddFrameResult(`Error: ${error}`);
    }
  }, []);

  const addFrame = useCallback(async () => {
    try {
      const result = await sdk.actions.addFrame();
      handleAddFrameResult(result);
    } catch (error) {
      handleAddFrameError(error);
    }
  }, [handleAddFrameResult, handleAddFrameError]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  const socialLinks = [
    {
      name: "Farcaster",
      url: "https://warpcast.com/onsenbot",
      icon: "🟣"
    },
    {
      name: "GitHub",
      url: "https://github.com/onsenbot",
      icon: "🐙"
    }
  ];

  const handleLinkClick = useCallback((url: string) => {
    sdk.actions.openUrl(url);
  }, []);

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="w-[300px] mx-auto py-2 px-2">
        <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>
        
        <div className="space-y-2">
          {socialLinks.map((link, index) => (
            <PurpleButton
              key={index}
              onClick={() => handleLinkClick(link.url)}
              className="w-full flex items-center justify-between px-4 py-2"
            >
              <span>{link.icon} {link.name}</span>
              <span>➔</span>
            </PurpleButton>
          ))}
        </div>

        {context?.client.recentLinks && context.client.recentLinks.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Recent Links</h2>
            <div className="space-y-2">
              {context.client.recentLinks.map((link, index) => (
                <PurpleButton
                  key={index}
                  onClick={() => handleLinkClick(link)}
                  className="w-full flex items-center justify-between px-4 py-2"
                >
                  <span className="truncate">{link}</span>
                  <span>➔</span>
                </PurpleButton>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

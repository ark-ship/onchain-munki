"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { mainnet } from "wagmi/chains";
import { parseEther } from "viem";

const CONTRACT_ADDRESS = "0xD8aa2893a6Ec4762B0b0f0456675BE435455B5C7";

const MINT_PRICE = "0.000039";
const MAX_SUPPLY = 3333;
const MAX_MINT = 10;

const PREVIEW_IMAGE_BASE_URI =
  "https://clever-guineafowl-soqcs.lighthouseweb3.xyz/ipfs/bafybeigz4hqgigpnv2uzsknqfw7tw44bqarelcknxscqqd7yetuujgki6i/";

const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "quantity",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalMinted",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export default function Home() {
  const { isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: mainnet.id });

  const { writeContract, data: hash, isPending } = useWriteContract();

  const [quantity, setQuantity] = useState(1);
  const [previewTokenId, setPreviewTokenId] = useState(1);
  const [minted, setMinted] = useState(0);
  const [mintedError, setMintedError] = useState(false);

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
      chainId: mainnet.id,
    });

  const totalPrice = Number(MINT_PRICE) * quantity;
  const progress = Math.min((minted / MAX_SUPPLY) * 100, 100);

  const fetchTotalMinted = async () => {
    try {
      if (!publicClient) return;

      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "totalMinted",
      });

      setMinted(Number(result));
      setMintedError(false);
    } catch (error) {
      console.error("Failed to read totalMinted:", error);
      setMintedError(true);
    }
  };

  useEffect(() => {
    fetchTotalMinted();

    const interval = setInterval(() => {
      fetchTotalMinted();
    }, 3000);

    return () => clearInterval(interval);
  }, [publicClient]);

  useEffect(() => {
    if (isConfirmed) {
      setTimeout(() => {
        fetchTotalMinted();
      }, 1500);
    }
  }, [isConfirmed]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPreviewTokenId((current) => {
        if (current >= 20) return 1;
        return current + 1;
      });
    }, 1600);

    return () => clearInterval(interval);
  }, []);

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (quantity < MAX_MINT) setQuantity(quantity + 1);
  };

  const handleMint = () => {
    if (!isConnected) return;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "mint",
      args: [BigInt(quantity)],
      value: parseEther(totalPrice.toString()),
      chainId: mainnet.id,
    });
  };

  return (
    <main className="page">
      <div className="glow glow-left" />
      <div className="glow glow-right" />

      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <img src="/munki.png" alt="MUNKI Logo" />
          </div>

          <div>
            <h2>MUNKI</h2>
            <p>Reject Humanity, return to munki.</p>
          </div>
        </div>

        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  "aria-hidden": true,
                  style: {
                    opacity: 0,
                    pointerEvents: "none",
                    userSelect: "none",
                  },
                })}
              >
                {!connected ? (
                  <button className="wallet-button" onClick={openConnectModal}>
                    CONNECT WALLET
                  </button>
                ) : chain.unsupported ? (
                  <button className="wallet-button" onClick={openChainModal}>
                    WRONG NETWORK
                  </button>
                ) : (
                  <button className="wallet-button" onClick={openAccountModal}>
                    {account.displayName}
                  </button>
                )}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <div className="live-badge">
            <span />
            MINT IS LIVE
          </div>

          <h1>
            onchain
            <br />
            munki
          </h1>

          <p className="hero-desc">Reject Humanity, return to munki.</p>

          <div className="stats">
            <div className="stat-card">
              <p>SUPPLY</p>
              <h3>{MAX_SUPPLY}</h3>
            </div>

            <div className="stat-card">
              <p>MAX</p>
              <h3>{MAX_MINT}</h3>
            </div>

            <div className="stat-card">
              <p>STATUS</p>
              <h3>LIVE</h3>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="mint-card">
            <div className="art-box">
              <div className="art-label left">
                #{String(previewTokenId).padStart(4, "0")}
              </div>
              <div className="art-label right">MUNKI</div>

              <div className="munki">
                <img
                  className="preview-munki"
                  src={`${PREVIEW_IMAGE_BASE_URI}${previewTokenId}.png`}
                  alt={`ONCHAIN MUNKI #${previewTokenId}`}
                  draggable={false}
                />
              </div>
            </div>

            <div className="progress-card">
              <div className="progress-top">
                <div>
                  <p>MINTED</p>
                  <h3>
                    {mintedError ? "ERROR" : minted} / {MAX_SUPPLY}
                  </h3>
                </div>

                <div className="percent">{progress.toFixed(1)}%</div>
              </div>

              <div className="progress-bar">
                <div style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="mint-box">
              <div className="quantity-row">
                <p>QUANTITY</p>

                <div className="quantity-control">
                  <button onClick={decreaseQuantity}>-</button>
                  <strong>{quantity}</strong>
                  <button onClick={increaseQuantity}>+</button>
                </div>
              </div>

              <button
                className="mint-button"
                onClick={handleMint}
                disabled={!isConnected || isPending || isConfirming}
              >
                {!isConnected
                  ? "CONNECT WALLET FIRST"
                  : isPending
                  ? "CONFIRM IN WALLET..."
                  : isConfirming
                  ? "MINTING..."
                  : `MINT ${quantity} MUNKI`}
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer>
<p>© 2026 MUNKI. ALL RIGHTS RESERVED.</p>
      </footer>
    </main>
  );
}
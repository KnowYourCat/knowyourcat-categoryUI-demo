import React, { useState, useEffect, useMemo } from "react";
import {
  useAccount,
  useNetwork,
  useSendTransaction,
  useWaitForTransaction,
} from "wagmi";
import moment from "moment";
import Image from "next/image";
import { ConnectKitButton } from "connectkit";
import styles from "../styles/BABTokenWeekGate.module.css";
import iconOk from "../images/icon_ok.svg";
import iconPending from "../images/icon_pending.svg";
import iconCheckMark from "../images/check-mark-icon.svg";
import iconAttention from "../images/attention.svg";
import logoBABT from "../images/logoBab.svg";
import skeletonData from "./skeletonData.json";

const providersConstants = {
  BABT: {
    logo: logoBABT,
    title: "Binance",
    baseURL:
      "https://www.binance.com/en/support/faq/bacaf9595b52440ea2b023195ba4a09c",
    buttonsTitle: "Pass KYC on Binance",
  },
};
const networksConstants = {
  137: {
    name: "Polygon",
    explorerURL: "https://polygonscan.com/",
  },
  11155111: {
    name: "Sepolia",
    explorerURL: "https://sepolia.etherscan.io/",
  },
};

async function fetchData(address) {
  const response = await fetch(
    `https://api.knowyourcat.id/v1/${address}/categories?category=babtokenweek`
  );
  return response.ok
    ? await response.json()
    : Promise.reject(new Error(response.message));
}
async function requestSyncData(address, sourceId, chainId) {
  const response = await fetch(
    `https://api.knowyourcat.id/v1/syncs/calldata?address=${address}&sourceId=${sourceId}&chainId=${chainId}`
  );
  return response.ok
    ? await response.json()
    : Promise.reject(new Error(response.message));
}

const getDateFromNow = (byChainIds) => {
  const timestamp = byChainIds.reduce((max, el, ind) => {
    return el.syncTimestamp > max ? el.syncTimestamp : max;
  }, 0);
  return moment.unix(timestamp).fromNow();
};

function BABTokenWeekGate({ checkAddress, loading, setLoading }) {
  const [categoryData, setCategoryData] = useState(skeletonData);
  const [syncRequestData, setSyncRequestData] = useState(null);
  const [error, setError] = useState(null);
  const [notify, setNotify] = useState(null);
  const [isSync, setIsSync] = useState(null);

  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();

  const isNoTrait = useMemo(() => {
    return !categoryData?.data?.providers?.find((el) => el.result)
      ? true
      : false;
  }, [categoryData]);
  const isNoSync = useMemo(() => {
    return !categoryData?.data?.providers?.find((el) =>
      el.sync.byChainIds.find((i) => i.timestamp !== 0)
    )
      ? true
      : false;
  }, [categoryData]);

  const { data, sendTransaction } = useSendTransaction({
    mode: "recklesslyUnprepared",
    chainId: syncRequestData?.chainId,
    onError(error) {
      setIsSync(false);
      setError(error);
    },
  });
  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    cacheTime: 2_000,
    onError(error) {
      setIsSync(false);
      setError(error);
    },
    onSuccess() {
      getApiData();
      setNotify("Success! Activity synced.");
      setTimeout(() => setNotify(null), 5000);
    },
  });

  const getApiData = async () => {
    setError(null);
    if (setLoading) {
      setLoading(true);
    }
    try {
      const responseCategory = await fetchData(address);
      if (responseCategory) {
        setCategoryData(responseCategory);
      }
      if (setLoading) {
        setLoading(false);
      }
    } catch (err) {
      setError("Error request");
      if (setLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // if (loading) {
    //   setCategoryData({});
    // }
    setIsSync(false);
    if (address) {
      getApiData();
    }
    // eslint-disable-next-line
  }, [address]);

  useEffect(() => {
    setError(null);
  }, [isConnected, chain]);

  const sync = async () => {
    setError(null);
    setIsSync(true);
    setNotify("Preparing data for sync...");
    if (!isConnected) {
      setError("Please, connect your wallet");
      setIsSync(false);
      return;
    }
    if (chain.id !== 137) {
      setError("You connected the wrong network. Expected network Polygon");
      setIsSync(false);
      return;
    }
    try {
      const { sourceId, chainId, address } = syncRequestData;
      const syncData = await requestSyncData(address, sourceId, chainId);
      sendTransaction?.({
        recklesslySetUnpreparedRequest: { ...syncData },
      });
      setNotify("Please, confirm to sync");
    } catch {
      setError("Unknown server response. Please try again later.");
      setIsSync(false);
    }
  };

  const getRenderStepper = () => (
    <div className={styles.stepper}>
      <div
        className={
          !isConnected
            ? styles.stepper_thumb_active
            : styles.stepper_thumb_inactive
        }
      >
        {!isConnected ? (
          "1"
        ) : (
          <Image src={iconCheckMark} alt={"icon check mark"} />
        )}
      </div>
      <div className={styles.connector}></div>
      <div
        className={
          isConnected && isNoTrait
            ? styles.stepper_thumb_active
            : styles.stepper_thumb_inactive
        }
      >
        {isConnected && !isNoTrait ? (
          <Image src={iconCheckMark} alt={"icon check mark"} />
        ) : (
          "2"
        )}
      </div>
      <div className={styles.connector}></div>
      <div
        className={
          isConnected && !isNoTrait && isNoSync
            ? styles.stepper_thumb_active
            : styles.stepper_thumb_inactive
        }
      >
        {isConnected && !isNoTrait && !isNoSync ? (
          <Image src={iconCheckMark} alt={"icon check mark"} />
        ) : (
          "3"
        )}
      </div>
    </div>
  );

  const getRenderTitle = () => (
    <h1 className={styles.title}>
      {!isConnected ? (
        <>
          <span>Connect your wallet and follow the steps below</span>
          <br />
          <span>to access the advanced limits.</span>
        </>
      ) : isNoTrait ? (
        <>
          <span>You don't have any traits.</span>
          <br />
          <span>Follow the link and get traits.</span>
        </>
      ) : isNoSync ? (
        <>
          <span>Your traits need to sync.</span>
        </>
      ) : (
        <>
          <span>You have synced traits</span>
          <br />
          <span>and you have access to advanced restrictions.</span>
        </>
      )}
    </h1>
  );

  const getRenderProviderButtons = (provider) => (
    <div className={styles.buttons_block}>
      {!provider.result && (
        <a
          href={providersConstants[provider.symbol].baseURL}
          rel="loosener noreferrer"
          className={styles.button_main}
          target="_blank"
        >
          {providersConstants[provider.symbol].buttonsTitle ||
            "Create activity"}
        </a>
      )}
      {provider.result &&
        provider.sync?.enabled &&
        provider.sync.byChainIds.length > 0 &&
        provider.sync.byChainIds.map((byChainId) =>
          byChainId.chainId === 137 && byChainId.required ? (
            <button
              key={byChainId.chainId}
              disabled={isSync}
              className={
                provider.sync.byChainIds.find((chain) => chain.timestamp !== 0)
                  ? styles.button_second
                  : styles.button_main
              }
              onClick={() => {
                setSyncRequestData({
                  sourceId: provider.sync.sourceId,
                  chainId: byChainId.chainId,
                  address,
                });
                sync();
              }}
            >
              {byChainId.timestamp === 0
                ? `Sync on ${networksConstants[byChainId.chainId].name}`
                : `Resync on ${networksConstants[byChainId.chainId].name}`}
            </button>
          ) : null
        )}
    </div>
  );

  const getRenderProviderInfo = (provider) => (
    <div className={styles.status}>
      <Image
        src={categoryData.result ? iconOk : iconPending}
        alt={`icon status`}
      />
      {categoryData.result ? (
        <span>
          &nbsp; Your activity was synchronized{" "}
          <span className={styles.text_bold}>
            {getDateFromNow(provider.sync.byChainIds)}
          </span>
          .
        </span>
      ) : (
        <span>
          &nbsp; Your activity was synchronized more then{" "}
          <span className={styles.text_bold}>14d ago</span>, please resync it.
        </span>
      )}
    </div>
  );

  const getRenderKyCatLink = () => (
    <a
      href={`https://knowyourcat.id/address/${address}`}
      className={styles.link}
      rel="noopener noreferrer"
      target="_blank"
    >
      You can also mint your <span>Cheshire NFT</span>
    </a>
  );

  useEffect(() => {
    if (isLoading) {
      setNotify("Waiting for request execution...");
    }
  }, [isLoading]);

  const syncNotify = () => (
    <div className={styles.status_box}>
      <div className={styles.status_tumb}>
        <Image
          src={iconAttention}
          alt={"icon check mark"}
          className={styles.status_img}
        />
      </div>
      <div className={styles.message}>
        {error && <p>{`Error! ${error}`}</p>}
        {!error && notify && <p>{notify}</p>}
      </div>
    </div>
  );

  const getRenderProvider = () => {
    return (
      <ul>
        {categoryData.data.providers.map((provider) => {
          return (
            <li key={provider.symbol} className={styles.provider}>
              <Image
                src={providersConstants[provider.symbol].logo}
                width="37px"
                height="37px"
                alt={`logo ${providersConstants[provider.symbol]?.title}`}
                className={
                  !categoryData.result && !provider.result && styles.inactive
                }
              />
              <div className={styles.provider_action}>
                <h2
                  className={
                    !categoryData.result && !provider.result
                      ? styles.subtitle_inactive
                      : styles.subtitle
                  }
                >
                  {providersConstants[provider.symbol]?.title ||
                    provider.symbol}
                </h2>
                {!isNoTrait && !isNoSync && getRenderProviderInfo(provider)}
                {getRenderProviderButtons(provider)}
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div>
      {/* {categoryData?.data?.providers?.length > 0 && ( */}
      <div className={styles.container}>
        {getRenderTitle()}
        <div className={styles.main}>
          {/* {!categoryData?.result && isNoSync && getRenderStepper()} */}
          {getRenderStepper()}
          <div className={styles.right_section}>
            <div className={styles.wallet_connect}>
              <ConnectKitButton />
            </div>
            {isConnected && getRenderProvider()}
          </div>
        </div>
        {!isNoTrait && !isNoSync && getRenderKyCatLink()}
        {((isSync && notify) || error) && syncNotify()}
      </div>
      {/* )} */}
    </div>
  );
}

export default BABTokenWeekGate;

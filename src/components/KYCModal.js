import React, { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import styled from "styled-components";
import { Oval } from "react-loader-spinner";
import Select from "react-select";
import Image from "next/image";

import iconCheckMark from "../images/checkmark.svg";
import iconClose from "../images/close.svg";
import iconVerified from "../images/modal_status_verified.svg";
import logoBABT from "../images/logoBab.svg";
import logoRealT from "../images/logoRealt.svg";
import logoGitcoin from "../images/logoGitcoin.svg";

// Styles
const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  position: relative;
  margin: 20px auto;
  padding: 29px;
  width: 480px;
  background-color: #ffffff;
  border-radius: 24px;
  font-family: Gilroy, Verdana, "Segoe UI", Tahoma, Geneva, sans-serif;
  font-size: 10px;
  color: #2a1b5b;
  transition: all 0.35s ease-out;
`;
const CloseButton = styled.div`
  position: absolute;
  right: 29px;
  top: 29px;
  width: 24px;
  height: 24px;
  cursor: pointer;
`;
const Title = styled.h1`
  margin: 0;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
`;
const Description = styled.p`
  margin: 0;
  text-align: center;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.56;
`;
const Stepper = styled.div`
  display: flex;
`;
const ProgressMark = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 26px;
  font-weight: 700;
  line-height: 30px;
  text-align: center;
  color: #ffffff;
  background-image: linear-gradient(135deg, #6d5cff, #e86eff, #ffd66e);
`;
const ConnectLine = styled.div`
  height: calc((100% - 144px) / 2);
  width: 1.2px;
  background-color: #cf6bff;
  margin-left: auto;
  margin-right: auto;
`;
const StepperRightSection = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-left: 10px;
`;
const StepperItem = styled.div`
  min-height: 48px;
  text-align: start;
  & h2 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    line-height: 24px;
  }
  & p {
    margin: 0;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    color: #6d6489;
  }
`;
const OptionLabel = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #6d6489;
`;
const MainButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  width: 100%;
  background-color: #1643ce;
  color: #ffffff;
  border-radius: 16px;
  border: none;
  font-size: 18px;
  line-height: 20px;
  font-weight: 600;
  & :disabled {
    background-color: #1643ce10;
  }
  & span {
    margin-left: 10px;
  }
`;
const Warning = styled.div`
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(239, 135, 38, 1);
  background-color: rgba(239, 135, 38, 0.1);
  color: rgba(239, 135, 38, 1);
  text-align: center;
  font-size: 12px;
  font-weight: 400;
  line-height: 20px;
  min-height: 48px;
  & a {
    color: rgba(117, 76, 255, 1);
  }
`;

// Utils
const getShortAddress = (address, quantityLeave = 6, quantityTrim = 32) => {
  const newAddress = [...address];
  newAddress.splice(quantityLeave, quantityTrim, ".", ".", ".").join("");
  return newAddress.join("");
};

// Constats
const credentialsEnum = [
  {
    value: "BAB token",
    label: (
      <OptionLabel>
        <Image src={logoBABT} height={24} width={24} alt={"icon close"} />
        <span>&nbsp;&nbsp;BAB token</span>
      </OptionLabel>
    ),
    warning: (
      <>
        <span>
          Seems you don't have &#60; BAB Token &#62;. Please select a different
          credential option. Learn more about&nbsp;
        </span>
        <a
          href={
            "https://www.binance.com/en/support/faq/how-to-mint-binance-account-bound-bab-token-bacaf9595b52440ea2b023195ba4a09c"
          }
          rel="noopener noreferrer"
          target="_blank"
        >
          BAB Token
        </a>
      </>
    ),
  },
  {
    value: "RealtT KYC Token",
    label: (
      <OptionLabel>
        <Image src={logoRealT} height={22} width={22} alt={"icon close"} />
        <span>&nbsp;RealtT KYC Token</span>
      </OptionLabel>
    ),
    warning: (
      <>
        <span>
          Seems you don't have &#60; RealtT KYC Token &#62;. Please select a
          different credential option. Learn more about&nbsp;
        </span>
        <a
          href={"https://dashboard.realt.community"}
          rel="noopener noreferrer"
          target="_blank"
        >
          RealtT KYC Token
        </a>
      </>
    ),
  },
  // {
  //   value: "Gitcoin score (more them 20)",
  //   label: (
  //     <OptionLabel>
  //       <Image src={logoGitcoin} height={22} width={22} alt={"icon close"} />
  //       &nbsp;Gitcoin score (more them 20)
  //     </OptionLabel>
  //   ),
  //   warning: (
  //     <>
  //       <span>
  //         Seems you Gitcoin score is less than 20. Please select a different
  //         credential option. Learn more about&nbsp;
  //       </span>
  //       <a
  //         href={"https://passport.gitcoin.co/"}
  //         rel="noopener noreferrer"
  //         target="_blank"
  //       >
  //         Gitcoin passport and score
  //       </a>
  //     </>
  //   ),
  // },
];

// API
async function fetchData(address) {
  const response = await fetch(
    `https://api.knowyourcat.id/v1/${address}/categories?category=verifiednonus`
  );
  return response.ok
    ? await response.json()
    : Promise.reject(new Error(response.message));
}

// Modal window component
function KYCModal({ closeModal }) {
  const [categoryData, setCategoryData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCredential, setSelectedCredential] = useState("Default");
  const [loading, setLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const { isConnected, address } = useAccount();

  const isConfirm = useMemo(
    () =>
      categoryData &&
      (selectedCredential?.value === "BAB token" ||
        selectedCredential?.value === "RealtT KYC Token")
        ? categoryData.result || false
        : false,
    [categoryData, selectedCredential]
  );

  const getCategoryData = async () => {
    setError(null);
    try {
      const responseCategory = await fetchData(address);
      if (responseCategory) {
        setCategoryData(responseCategory);
      }
    } catch (err) {
      setError("Error request");
    }
  };

  const handlerGetProof = async () => {
    setLoading(true);
    await getCategoryData();
    setLoading(false);
    setShowWarning(true);
  };

  const getRenderProgress = () => (
    <div>
      <ProgressMark
        style={
          isConnected
            ? {
                backgroundImage: "none",
                backgroundColor: "#3CB47A",
              }
            : {}
        }
      >
        {!isConnected ? (
          "1"
        ) : (
          <Image src={iconCheckMark} alt={"icon check mark"} />
        )}
      </ProgressMark>
      <ConnectLine style={isConnected ? { backgroundColor: "#3CB47A" } : {}} />
      <ProgressMark
        style={
          !isConnected
            ? { opacity: "20%" }
            : selectedCredential !== "Default"
            ? { backgroundImage: "none", backgroundColor: "#3CB47A" }
            : {}
        }
      >
        {selectedCredential !== "Default" ? (
          <Image src={iconCheckMark} alt={"icon check mark"} />
        ) : (
          "2"
        )}
      </ProgressMark>
      <ConnectLine
        style={
          !isConnected
            ? { opacity: "20%" }
            : selectedCredential !== "Default"
            ? { backgroundImage: "none", backgroundColor: "#3CB47A" }
            : {}
        }
      />
      <ProgressMark
        style={
          !isConnected || selectedCredential === "Default"
            ? { opacity: "20%" }
            : {}
        }
      >
        3
      </ProgressMark>
    </div>
  );

  const ConnectButton = () => {
    return (
      <ConnectKitButton.Custom>
        {({ show }) => {
          return <MainButton onClick={show}>Connect wallet</MainButton>;
        }}
      </ConnectKitButton.Custom>
    );
  };

  const Spinner = () => {
    return (
      <Oval
        height={20}
        width={20}
        color="#ffffff"
        wrapperStyle={{}}
        wrapperClass="mint-spinner"
        visible={true}
        ariaLabel="oval-loading"
        secondaryColor="#2A1B5B"
        strokeWidth={4}
        strokeWidthSecondary={5}
      />
    );
  };

  if (isConfirm) {
    return (
      <Container style={{ width: "420px" }}>
        <CloseButton onClick={() => closeModal()}>
          <Image src={iconClose} alt={"icon close"} />
        </CloseButton>
        <Title>Verified!</Title>
        <Image
          style={{ margin: "32px auto 0 auto" }}
          src={iconVerified}
          alt={"icon verified"}
        />
        <Description>You can use your extended deposits limits</Description>
      </Container>
    );
  }

  return (
    <Container>
      <CloseButton onClick={() => closeModal()}>
        <Image src={iconClose} alt={"icon close"} />
      </CloseButton>
      <Title>Increase deposit limits</Title>
      <Description>
        Add credentials to prove you are a unique, trustworthy human and access
        increased deposit limits. The process takes less than 3 minutes.
      </Description>

      <Stepper>
        {getRenderProgress()}
        <StepperRightSection>
          <StepperItem>
            <h2>Connect wallet</h2>
            {isConnected ? (
              <p>{getShortAddress(address)}</p>
            ) : (
              <p>Connect your wallet to ...</p>
            )}
          </StepperItem>
          <StepperItem style={!isConnected ? { opacity: "20%" } : {}}>
            <h2>Choose your credential option</h2>
            <Select
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  height: "40px",
                  paddingLeft: "4px",
                  borderRadius: "16px",
                  fontSize: "14px",
                }),
                indicatorSeparator: (baseStyles, state) => ({
                  ...baseStyles,
                  display: "none",
                }),
              }}
              defaultValue={selectedCredential}
              onChange={(option) => {
                setSelectedCredential(option);
                setShowWarning(false);
              }}
              options={credentialsEnum}
              placeholder={"Select option"}
            />
          </StepperItem>
          <StepperItem
            style={
              !isConnected || selectedCredential === "Default"
                ? { opacity: "20%", paddingTop: "12px" }
                : { paddingTop: "12px" }
            }
          >
            <h2>Confirm the selected credential</h2>
          </StepperItem>
        </StepperRightSection>
      </Stepper>

      {!isConnected ? (
        <div>
          <ConnectButton />
        </div>
      ) : !showWarning ? (
        <MainButton
          onClick={handlerGetProof}
          style={
            !isConnected || selectedCredential === "Default"
              ? { opacity: "20%" }
              : loading
              ? { color: "#2A1B5B", backgroundColor: "#1643ce20" }
              : {}
          }
        >
          {loading && <Spinner />}
          {!loading ? (
            "Get the human proof details"
          ) : (
            <span>Processing ...</span>
          )}
        </MainButton>
      ) : null}

      {showWarning && !isConfirm ? (
        <Warning>{selectedCredential.warning}</Warning>
      ) : null}
    </Container>
  );
}

export default KYCModal;

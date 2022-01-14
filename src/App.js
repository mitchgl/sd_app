import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import reactDom from "react-dom";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background: rgb(0,205,189);
  background: linear-gradient(45deg, rgba(0,205,189,1) 0%, rgba(198,251,193,1) 100%);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 2px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid var(--primary2);
  background-color: var(--accent);

  transform: rotate(-5deg);
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `You have your very own ${CONFIG.NFT_NAME} NFT! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 20) {
      newMintAmount = 20;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}

        style={{backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}

      >
        <StyledLogo alt={"logo"} src={"/config/images/logo.gif"} />
        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"example"} src={"/config/images/sd_l.gif"} />
          </s.Container>
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "var(--accent2)",
              padding: 24,
              borderRadius: 8,
              
              border: "1px solid var(--primary2)",
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.1)",

              
            }}
          >
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL}.
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  Excluding gas fees.
                </s.TextDescription>
                <s.SpacerSmall />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      Connect to the {CONFIG.NETWORK.NAME} network
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.1 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "BUY"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
          </s.Container>
          <s.SpacerLarge />
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg
              alt={"example"}
              src={"/config/images/sd_r.gif"}
              style={{ transform: "scaleX(1)",transform: "rotate(5deg)" }}
            />
          </s.Container>
        </ResponsiveWrapper>
        <s.SpacerMedium />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
            Once you make the purchase, you cannot undo this action.
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
            successfully mint your NFT. We recommend that you don't lower the
            gas limit.
          </s.TextDescription>
          <s.SpacerLarge />
          <s.SpacerLarge />
        </s.Container>
      </s.Container>

      <s.Container
        flex={1}
        ai={"left"}

        style={{backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bgsvg.svg" : null}

      >
        
        <s.SpacerSmall />


        <ResponsiveWrapper flex={2} style={{ padding: 24 }} test>
          <s.Container flex={1} jc={"left"} ai={"left"}>
            
          </s.Container>
          <s.SpacerLarge />
          


          <s.Container
            flex={1}
            jc={"left"}
            ai={"left"}
            style={{
              // backgroundColor: "var(--accent2)",
              // padding: 24,
              // borderRadius: 8,
              // border: "1px solid var(--primary2)",
              // boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.1)",
            }}
          >
            <s.TextTitle
              style={{
                textAlign: "left",
                fontSize: 50,
                fontWeight: "bold",
                // color: "white",
                width:"100%",
                lineHeight:"110%"
              }}
            >

            <s.SpacerLarge/>
            <s.SpacerLarge/>

              Every dog is special
            </s.TextTitle>
          <s.SpacerLarge/>
            <s.Container
              style={{
                lineHeight:"140%"
              }}
            >
           There’s 10,000 Silly Dogs in this run, with every single one being unique and an expression of affection for animals around the world, especially dogs. Ultimately, Silly Dogs aims to leverage non-fungible tokens (NFT’s) to benefit animals in some way. 
            </s.Container>
 
            <s.SpacerSmall/>

            <s.Container
              style={{
                lineHeight:"140%"
              }}
            >
              Each dog has a selection of traits; from faces, hair, hats, and more — Silly Dogs are friends to accompany you through the metaverse. Holding a SillyDog enables you to participate in the community - enabling you to vote on charities, merchandise, and possibly events. The more silly dogs out there, the more help and awareness we can bring. 
            </s.Container>
          <s.SpacerLarge/>

          <s.SpacerLarge/>
          
          <s.TextTitle
              style={{
                textAlign: "left",
                fontSize: 50,
                fontWeight: "bold",
                // color: "white",
                width:"100%",
                lineHeight:"140%"
              }}
            >
            The big reveal
            </s.TextTitle>
            
            <s.SpacerLarge/>

            <s.Container
              style={{
                lineHeight:"140%"
              }}
            >
            Silly Dogs will be revealed together simultaneously on [date], [time]. There’s 2 different kinds of Silly Dogs to unlock right now, with some special editions. In this initial run, the Silly Dogs will be similar to the ones shown on this page. In future, the aim is to represent even more of our friends on the blockchain.
            </s.Container>

            
            <s.SpacerLarge/>
            <s.SpacerLarge/>
          
          <s.TextTitle
              style={{
                textAlign: "left",
                fontSize: 50,
                fontWeight: "bold",
                // color: "white",
                width:"100%",
                lineHeight:"110%"
              }}
            >
            Roadmap
            </s.TextTitle>
            
            <s.SpacerLarge/>

            {/* <s.Container flex={1} jc={"center"} ai={"center"} style={{ marginTop:"20px", paddingTop:"10%"}}>
            <s.StyledImgV2
              alt={"example"}
              src={"/config/images/dog.jpeg"}
              style={{ transform: "scaleX(1)",transform: "rotate(0deg)" }}
            ></s.StyledImgV2> */}


          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"example"} src={"/config/images/bgsvg.svg"} 
              style={{
              textAlign: "left",
              fontSize: 50,
              fontWeight: "bold",
              // color: "white",
              width:"100%",
              lineHeight:"110%",
              borderColor: "none",
              transform: "rotate(0deg)",
              backgroundColor: "none"
            }}
            />
          {/* </s.Container> */}
            
        </s.Container>

            <s.Container>
            SillyDogs V1 (This launch!)
            </s.Container>
            <s.Container>
            SillyDogs V2
            </s.Container>
            <s.Container>
            SillyDogs V3
            </s.Container>
            <s.Container>
            ETH release
            </s.Container>
            <s.Container>
            NFT's to support Animal Charities
            </s.Container>
            Merchandise
            

            

            <s.SpacerLarge/>
            <s.SpacerLarge/>
            <s.SpacerLarge/>

          </s.Container>

            {/* middle conainer floating right dog */}
          <s.Container flex={1} jc={"center"} ai={"center"}>
            {/* <StyledImg
              alt={"example"}
              src={"/config/images/sd_r.gif"}
              style={{ transform: "scaleX(1)",transform: "rotate(5deg)" }}
            /> */}
          </s.Container>
        </ResponsiveWrapper>
        </s.Container>
        
        {/* bookmark mid container end footer */}

        

        <s.TextTitleFooter

              


              style={{
                textAlign: "center",
                fontSize: 16,
                fontWeight: "bold",
                // color: "white",
                width:"100%",
                lineHeight:"110%",
                padding: "10%",
               
              }}
            ><s.Container flex={1} jc={"center"} ai={"center"} style={{ }}>
            <StyledImg
              alt={"example"}
              src={"/config/images/sd_r.gif"}
              style={{ transform: "scaleX(1)",transform: "rotate(0deg)" }}
            />
            <s.SpacerLarge/>
            <s.SpacerLarge/>
        </s.Container>
             SillyDogs is a labor of love for animals everywhere ❤️
            </s.TextTitleFooter>

    </s.Screen>
    
  );
}

export default App;

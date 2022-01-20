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



// Styled image bookmark
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


export const StyledImg02 = styled.img`
  width: 220px;

  @media (min-width: 900px) {
    width: 220px;
  }
  @media (min-width: 1000px) {
    width: 220px;
  }
  transition: 0.5s;
`;

// link containers
export const StyledImg03 = styled.img`
  height: 100px;
  width: 150px;
  margin-top: 50px;
  float: left;
  opacity: 0.8;
  display: inline-block;
  vertical-align: top;
  transition: width 0.5s;
  text-align: center;
  background-color: red;

  @media (min-width: 900px) {
    width: 150px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;

  &:hover{
    transform: scale(1.1, 1.1);
    opacity: 1;
    transition: all .2s ease-in-out;
  }
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
  left:0;
  margin-top: 100px;
  font-size: 12px;
`;

export const StyledLink02 = styled.a`
  color: white;
  text-decoration: none;
  text-align: center;
  display: block;
  width: 150px;
  height: 100px;
  background-color: green;
`;

export const StyledLink03 = styled.a`
  color: white;
  font-size: 12px;
  weight: 600;
  text-decoration: none;
  text-align: center;

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
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/fullbg1.svg" : null}

      >
        <s.SpacerLarge/>
        <s.SpacerLarge/>



        <StyledLogo alt={"logo"} src={"/config/images/logowhite.gif"} />
        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} >
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg02 alt={"example"} src={"/config/images/sd_l_.gif"} />
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
                fontSize: "50px",
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
            {/* <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
                color: "white"
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription> */}
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
                  {CONFIG.NETWORK.SYMBOL}
                </s.TextTitle>
            
                {/* <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  (excluding gas fees)
                </s.TextDescription> */}
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
                      Connect to the {CONFIG.NETWORK.NAME} (MATIC) network
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
            <StyledImg02
              alt={"example"}
              src={"/config/images/sd_r_.gif"}
              style={{ transform: "scaleX(1)",transform: "rotate(5deg)" }}
            />
          </s.Container>
        </ResponsiveWrapper>
   
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "left",
              color: "white",
              width: "80%",
              fontSize: "12px"
            }}
          >
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} main net) and the correct address. Minting cannot be undone. 
          </s.TextDescription>
          <s.SpacerSmall />
          {/* <s.TextDescription
            style={{
              textAlign: "left",
              color: "var(--primary-text)",
              color: "white",
              width: "90%"
            }}
          >
            We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
            successfully mint your NFT. We recommend that you don't lower the
            gas limit.
          </s.TextDescription> */}

        </s.Container>

      </s.Container>
      <s.Container
        flex={1}
        ai={"left"}
        style={{backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/fullbg2.svg" : null}
      >
        
        <s.SpacerSmall />


        <ResponsiveWrapper flex={2} style={{ padding: 24 }} test>
          <s.Container flex={1} jc={"left"} ai={"left"}>
            
          </s.Container>
          


          <s.Container
            flex={1}
            jc={"left"}
            ai={"left"}
            style={{
            }}
          >
  
          {/* <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg02
              alt={"example"}
              src={"/config/images/sd_r_.gif"}
              style={{ transform: "scaleX(1)",transform: "rotate(5deg)" }}
            />
          </s.Container> */}
          
          
          <s.SpacerLarge/>

            <s.TextTitle
              style={{
                textAlign: "left",
                fontSize: 50,
                fontWeight: "bold",
                color: "white",
                width:"100%",
                lineHeight:"140%"
              }}
            >
              Every dog is special
            </s.TextTitle>

              <s.SpacerLarge/>
              <s.TextDivider/>
              <s.SpacerLarge/>

            <s.Container
              style={{
                lineHeight:"140%",
                color: "white"
              }}
            >
           10,000 Silly Dogs are waiting to be minted to find their home on the block chain. Each single SillyDog is a unique expression of affection for animals and pets around the world, especially dogs.  
            </s.Container>
 
            <s.SpacerSmall/>

            <s.Container
              style={{
                lineHeight:"140%",
                color: "white"
              }}
            >
              Each dog has a selection of traits; from faces, hair, hats, and more — Silly Dogs are friends to accompany you through the metaverse. Holding a SillyDog enables you to participate in the community - enabling you to vote on charities, merchandise, and possibly events. The more silly dogs out there, the more help and awareness we can bring. 
            </s.Container>
            <s.SpacerLarge/>
            <s.SpacerLarge/>
            <s.SpacerLarge/>
            <s.SpacerLarge/>
          
          <s.TextTitle
              style={{
                textAlign: "left",
                fontSize: 50,
                fontWeight: "bold",
                color: "white",
                width:"100%",
                lineHeight:"140%"
              }}
            >
            The big (silly) reveal
            </s.TextTitle>
              
              <s.SpacerMedium/>
              <s.TextDivider/>

            <s.SpacerLarge/>

            <s.Container
              style={{
                lineHeight:"140%",
                color: "white"
              }}
            >
            Silly Dogs will be revealed from their current storage on IPFS on [date], 12AM EST. There’s 2 different kinds of Silly Dogs to unlock right now, with some special editions. In this initial run, the Silly Dogs will be similar to some designs shown on this page. In future, one of the goals of Silly Dogs is to represent even more of our friends on the blockchain, in more ways, with improved artwork.
            </s.Container>
            
            <s.SpacerLarge/>
            <s.SpacerLarge/>
            <s.SpacerLarge/>
            <s.SpacerLarge/>
          
          <s.TextTitle
              style={{
                textAlign: "left",
                fontSize: 50,
                fontWeight: "bold",
                color: "white",
                width:"100%",
                lineHeight:"140%"
              }}
            >
            Roadmap
            </s.TextTitle>

            <s.SpacerMedium/>
            <s.TextDivider/>

            <s.SpacerLarge/>
            

            <s.Container
              style={{
                lineHeight:"140%",
                color: "white"
              }}>

            Ultimately, Silly Dogs aims to find a way to leverage non-fungible tokens (NFT’s) to benefit animals. Be it through donating to charities, acting as a token of love for dogs, or a means to draw attention to our love of pets everywhere -- on the blockchain. Given the direciton of Silly Dogs, these steps aren't in a particular order and act as an indication of the goals of Silly Dogs. 

            </s.Container>
            <s.SpacerLarge/>
              

              
          {/* roadmap containers */}

      

          <s.Container flex={1} flex={1} ai={"center"} style={{ }}>
            <StyledImg02 alt={"example"} src={"/config/images/roadmap1.svg"} 
              style={{
              width:"100%",
              float: "left"
            }}
            />
      

            <StyledImg02 alt={"example"} src={"/config/images/roadmap2.svg"} 
              style={{
              width:"100%",
              float: "right",
              marginTop: "30px"
            }}
            />

     
            <StyledImg02 alt={"example"} src={"/config/images/roadmap3.svg"} 
              style={{
              width:"100%",
              marginTop: "30px",
              float: "left",
            }}
            />


            <StyledImg02 alt={"example"} src={"/config/images/roadmap4.svg"} 
              style={{
              width:"100%",
              marginTop: "30px",
              float: "left",
            }}
            />


            <StyledImg02 alt={"example"} src={"/config/images/roadmap5.svg"} 
              style={{
              width:"100%",
              marginTop: "30px",
              float: "left",
            }}
            />


            <StyledImg02 alt={"example"} src={"/config/images/roadmap6.svg"} 
              style={{
              width:"100%",
              marginTop: "30px",
              float: "left",
            }}
            />
            
          </s.Container>

          <s.SpacerLarge/>
          <s.SpacerLarge/>
            
          <s.Container flex={1} jc={"center"} ai={"center"}
            style={{
              lineHeight:"140%",
              color: "white",
              fontWeight: "600",
              textAlign: "center"
            }}>
              Verified smart contract 
                      <s.TextDescription
                        style={{
                          color: "var(--primary-text)",
                          color: "white"
                        }}
                      >
                        <StyledLink03 target={"_blank"} href={CONFIG.SCAN_LINK}>
                          {truncate(CONFIG.CONTRACT_ADDRESS)}
                        </StyledLink03>
                      </s.TextDescription>       
          </s.Container>

          <s.SpacerLarge/>
          <s.SpacerLarge/>
          <s.SpacerLarge/>

          </s.Container>

            {/* middle conainer floating right dog */}
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg02
              alt={"example"}
              src={"/config/images/sd_r_.gif"}
              style={{ transform: "scaleX(1)",transform: "rotate(5deg)" }}
            />
          </s.Container>

         

        </ResponsiveWrapper>
        </s.Container>


        
        
        {/* bookmark mid container end footer */}

        
        <s.Container
        flex={1}
        ai={"center"}

        style={{backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/fullbg3.svg" : null}
      >
       <s.SpacerLarge/>
       <s.SpacerLarge/>
        <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg02 alt={"example"} src={"/config/images/heart.svg"} 
              style={{
              width:"10%",
              marginTop: "30px",
              marginBottom: "30px"
            }}
            /></s.Container>

        <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 30,
                fontWeight: "bold",
                color: "white",
                width:"100%",
                lineHeight:"120%",
                height: "800px",
                width: "60%"
              }}
            >
             Silly Dogs is a labor of love for all animals
            </s.TextTitle>

      </s.Container>

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
            <StyledImg02
              alt={"example"}
              src={"/config/images/sd_r_.gif"}
              style={{ transform: "scaleX(1)",transform: "rotate(0deg)" }}
            />
            <s.SpacerLarge/>
            <s.SpacerLarge/>
        </s.Container>

        <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg02 alt={"example"} src={"/config/images/heart.svg"} 
              style={{
              width:"5%",
              marginTop: "30px",
              marginBottom: "30px"
            }}
            /></s.Container>
             Thank you
            </s.TextTitleFooter>

    </s.Screen>
    
  );
}

export default App;

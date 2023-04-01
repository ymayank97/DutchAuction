import { useWeb3React } from "@web3-react/core";
import { Contract, ethers, Signer } from "ethers";
import {
  ChangeEvent,
  MouseEvent,
  ReactElement,
  useEffect,
  useState,
} from "react";
import styled from "styled-components";
import dutchArtifact from "../artifacts/contracts/DutchAuction.sol/DutchAuction.json";
import { Provider } from "../utils/provider";
import { SectionDivider } from "./SectionDivider";

const StyledDeployContractButton = styled.button`
  width: 180px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;

const StyledGreetingDiv = styled.div`
  display: grid;
  grid-template-rows: 1fr ;
  grid-template-columns: 135px 2.7fr 1fr;
  grid-gap: 10px;
  place-self: center;
  align-items: center;
`;

const InputDiv = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 20px;
  margin-bottom: 20px;
  place-self: center;
  align-items: center;
`;

const StyledLabel = styled.label`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
  font-weight: bold;
`;

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 45%;
  margin-bottom: 15px;
`;

const StyledEm = styled.em`
  color: gray;
`;

const Heading = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-top: 10px;
  margin-bottom: 15px;
  text-shadow: 1px 1px #ccc;
`;

const StyledInput = styled.input`
  padding: 0.4rem 0.6rem;
  line-height: 2fr;
`;

const StyledButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
`;

export function Greeter(): ReactElement {
  const context = useWeb3React<Provider>();
  const { library, active } = context;

  const [signer, setSigner] = useState<Signer>();
  const [auctionContract, setAuctionContract] = useState<Contract>();
  const [auctionContractAddr, setAuctionContractAddr] = useState<string>("");
  const [bidInput, setBidInput] = useState<string>("");

  const [state, setstate] = useState<string>("");
  const [price, setprice] = useState<string>("");
  const [seller, setseller] = useState<string>("");
  const [buyer, setbuyer] = useState<string>("");
  const [contract, setcontract] = useState<string>("");

  const [reserveprice, setreserveprice] = useState<string>("");
  const [blocksopen, setblocksopen] = useState<string>("");
  const [pricedecrement, setpricedecrement] = useState<string>("");

  useEffect((): void => {
    if (!library) {
      setSigner(undefined);
      return;
    }

    setSigner(library.getSigner());
  }, [library]);

  function handleDeployContract(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    if (auctionContract || !signer) {
      return;
    }
    async function deployAuctionContract(signer: Signer): Promise<void> {
      const dutchAuction = new ethers.Contract(
        auctionContractAddr,
        dutchArtifact.abi,
        signer
      );
      setAuctionContract(dutchAuction);
      setAuctionContractAddr(dutchAuction.address);

      var status = await dutchAuction.auctionOpenStatus();
      if (status === true) {
        setstate(`Auction is Open`);
      } else {
        setstate(`Auction is Closed`);
      }
      var price = await dutchAuction.calculateCurrentOffer();
      price = parseInt(price._hex, 16).toString();
      const seller = await dutchAuction.seller();
      const buyer = await dutchAuction.buyer();
      var reserve = await dutchAuction.reservePrice();
      reserve = parseInt(reserve._hex, 16).toString();
      var blocks = await dutchAuction.numBlocksAuctionOpen();
      blocks = parseInt(blocks._hex, 16).toString();
      var dec = await dutchAuction.offerPriceDecrement();
      dec = parseInt(dec._hex, 16).toString();

      setprice(price);
      setseller(seller);
      setbuyer(buyer);
      setreserveprice(reserve);
      setblocksopen(blocks);
      setpricedecrement(dec);
      setcontract(dutchAuction.address);
    }

    deployAuctionContract(signer);
  }

  function handleBidChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setBidInput(event.target.value);
  }

  function handleBidSubmit(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!auctionContract) {
      window.alert("Undefined Auction Contract");
      return;
    }

    if (!bidInput) {
      window.alert("Bid cannot be less than 0");
      return;
    }

    async function placeBid(auctionContract: Contract): Promise<void> {
      try {
        const dutchAuction = new ethers.Contract(
          auctionContractAddr,
          dutchArtifact.abi,
          signer
        );
        const biding = await dutchAuction.placeBid({ value: bidInput });
        const receipt = await biding.wait();

        const buyer1 = await dutchAuction.buyer();
        setbuyer(buyer1);
        console.log("bidInput", buyer);

        window.alert("Bid placed! Winner is " + buyer1);
        var status = await dutchAuction.auctionOpenStatus();
        if (status === true) {
          setstate(`Auction is Open`);
        } else {
          setstate(`Auction is Closed`);
        }
      } catch (error: any) {
        window.alert(
          "Error!" + (error && error.message ? `\n\n${error.message}` : "")
        );
      }
    }

    placeBid(auctionContract);
  }

  return (
    <>
    <Heading>Contract Information</Heading>
      <InputDiv>
        <StyledGreetingDiv>
          <StyledLabel htmlFor="Contract Address">Contract Address</StyledLabel>
          <StyledInput
            id="contractaddress"
            type="string"
            placeholder={"<Contract Address>"}
            onChange={(event) => setAuctionContractAddr(event.target.value)}
          ></StyledInput>

          <StyledDeployContractButton
            disabled={!active || auctionContract ? true : false}
            style={{
              cursor: !active || auctionContract ? "not-allowed" : "pointer",
              borderColor: !active || auctionContract ? "unset" : "blue",
            }}
            onClick={handleDeployContract}
          >
            Get info
          </StyledDeployContractButton>
        </StyledGreetingDiv>
        </InputDiv>

        <InputDiv>
        <StyledDiv>
          <StyledLabel>State</StyledLabel>
          <div>
            {state ? (
              state
            ) : (
              <StyledEm>{`<Contract not yet deployed>`}</StyledEm>
            )}
          </div>
        </StyledDiv>
        <StyledDiv>
          <StyledLabel>Price</StyledLabel>
          <div>
            {price ? (
              price
            ) : (
              <StyledEm>{`<Contract not yet deployed>`}</StyledEm>
            )}
          </div>
        </StyledDiv>
        <StyledDiv>
          <StyledLabel>Seller</StyledLabel>
          <div>
            {seller ? (
              seller
            ) : (
              <StyledEm>{`<Contract not yet deployed>`}</StyledEm>
            )}
          </div>
        </StyledDiv>
        <StyledDiv>
          <StyledLabel>Buyer</StyledLabel>
          <div>
            {buyer ? (
              buyer
            ) : (
              <StyledEm>{`<Contract not yet deployed>`}</StyledEm>
            )}
          </div>
        </StyledDiv>
        <StyledDiv>
          <StyledLabel>Contract</StyledLabel>
          <div>
            {contract ? (
              contract
            ) : (
              <StyledEm>{`<Contract not yet deployed>`}</StyledEm>
            )}
          </div>
        </StyledDiv>
        <StyledDiv>
          <StyledLabel>Reserve Price</StyledLabel>
          <div>
            {reserveprice ? (
              reserveprice
            ) : (
              <StyledEm>{`<Contract not yet deployed>`}</StyledEm>
            )}
          </div>
        </StyledDiv>
        <StyledDiv>
          <StyledLabel>Blocks Open</StyledLabel>
          <div>
            {blocksopen ? (
              blocksopen
            ) : (
              <StyledEm>{`<Contract not yet deployed>`}</StyledEm>
            )}
          </div>
        </StyledDiv>
        <StyledDiv>
          <StyledLabel>Price Decrement</StyledLabel>
          <div>
            {pricedecrement ? (
              pricedecrement
            ) : (
              <StyledEm>{`<Contract not yet deployed>`}</StyledEm>
            )}
          </div>
        </StyledDiv>
      </InputDiv>

      <SectionDivider />

      <StyledGreetingDiv>
        <StyledLabel htmlFor="bidprice">Bid Price</StyledLabel>
        <StyledInput
          id="greetingInput"
          type="text"
          placeholder={bidInput ? "" : "<Contract not yet deployed>"}
          onChange={handleBidChange}
          style={{ fontStyle: bidInput ? "normal" : "italic" }}
        ></StyledInput>
        <StyledButton
          disabled={!active || !auctionContract ? true : false}
          style={{
            cursor: !active || !auctionContract ? "not-allowed" : "pointer",
            borderColor: !active || !auctionContract ? "unset" : "blue",
          }}
          onClick={handleBidSubmit}
        >
          Submit Bid
        </StyledButton>
      </StyledGreetingDiv>

    
      <StyledGreetingDiv>
        <StyledLabel>WINNER </StyledLabel>
        <div>{buyer ? buyer : <em>{`<Auction is going on>`}</em>}</div>
      </StyledGreetingDiv>
    </>
  );
}

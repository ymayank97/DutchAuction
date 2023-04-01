import { useWeb3React } from "@web3-react/core";
import { Contract, ethers, Signer } from "ethers";
import { MouseEvent, ReactElement, useEffect, useState } from "react";
import styled from "styled-components";
import GreeterArtifact from "../artifacts/contracts/DutchAuction.sol/DutchAuction.json";
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

const Heading = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-top: 10px;
  margin-bottom: 15px;
  text-shadow: 1px 1px #ccc;
`;

const InputDiv = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-gap: 10px;

  justify-items: center;
  align-items: center;
  text-align: center;
  margin: 0;
`;

const StyledGreetingDiv = styled.div`
  display: grid;
  grid-gap: 20px;
  place-self: center;
  align-items: center;
  font-weight: bold;
`;


const StyledLabel = styled.label`
  font-weight: bold;
`;

const StyledInput = styled.input`
  padding: 0.4rem 0.6rem;
  line-height: 2fr;
`;

export function Deploy(): ReactElement {
  const context = useWeb3React<Provider>();
  const { library, active, account } = context;

  const [signer, setSigner] = useState<Signer>();
  const [greeterContract, setGreeterContract] = useState<Contract>();
  const [greeterContractAddr, setGreeterContractAddr] = useState<string>("");

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
    if (!library || !account) {
      window.alert("Wallet not connected");
      return;
    }

    event.preventDefault();

    // only deploy the Greeter contract one time, when a signer is defined
    if (greeterContract || !signer) {
      return;
    }

    async function deployGreeterContract(signer: Signer): Promise<void> {
      const Greeter = new ethers.ContractFactory(
        GreeterArtifact.abi,
        GreeterArtifact.bytecode,
        signer
      );
      console.log("Deploying Greeter contract...");
      try {
        const greeterContract = await Greeter.deploy(
          reserveprice,
          blocksopen,
          pricedecrement
        );

        await greeterContract.deployed();
        setGreeterContract(greeterContract);
        window.alert(`Greeter deployed to: ${greeterContract.address}`);

        setGreeterContractAddr(greeterContract.address);
      } catch (error: any) {
        window.alert(
          "Error!" + (error && error.message ? `\n\n${error.message}` : "")
        );
      }
    }

    deployGreeterContract(signer);
  }

  return (
    <>
      <Heading>Deploying Contract</Heading>
      <InputDiv>
        <StyledLabel htmlFor="Reserve Price">Reserve Price</StyledLabel>
        <StyledInput
          id="reserveprice"
          type="number"
          placeholder={"<100>"}
          onChange={(event) => setreserveprice(event.target.value)}
        ></StyledInput>

        <StyledLabel htmlFor="Blocks Open">Blocks Open</StyledLabel>
        <StyledInput
          id="blocksopen"
          type="number"
          placeholder={"<10>"}
          onChange={(event) => setblocksopen(event.target.value)}
        ></StyledInput>

        <StyledLabel htmlFor="Price Decrement">Price Decrement</StyledLabel>
        <StyledInput
          id="pricedecrement"
          type="number"
          placeholder={"<10>"}
          onChange={(event) => setpricedecrement(event.target.value)}
        ></StyledInput>
      </InputDiv>

      <StyledDeployContractButton
        style={{
          cursor: !active ? "not-allowed" : "pointer",
          borderColor: !active ? "unset" : "blue",
        }}
        onClick={handleDeployContract}
      >
        Deploy Contract
      </StyledDeployContractButton>

      <StyledGreetingDiv>
        <StyledLabel>Dutch Auction Contract Deployed At </StyledLabel>
        <div>
          {greeterContractAddr ? (
            greeterContractAddr
          ) : (
            <em>{`<Contract not yet deployed>`}</em>
          )}
        </div>
      </StyledGreetingDiv>
    </>
  );
}

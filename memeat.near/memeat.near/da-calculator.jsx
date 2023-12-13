const TGas = Big(10).pow(12);

State.init({
  tab: "DA Calculator", // Mint / Indexer / Transfer
  dataToSend: "346", // Added for the new input field
  result: null,
});

const FormInputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormInputLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: end;
`;

const FormInputRow = styled.div`
  display: flex;
  justify-content: space-between;
  height: 50px;
  margin-top: 12px;
  border-radius: 12px;
  padding: 0 16px;
  align-items: center;
`;

const FormInputTitle = styled.div`
  font-size: 18px;
  font-weight: bold;
`;

const UnitContent = styled.div`
  font-size: 18px;
  font-weight: bold;
`;

const Main = styled.div`
  width: 100%;
  min-height: 90vh;
  overflow: hidden;
  background: #101010;
  background-image: url(${ipfsPrefix}/bafkreiak6rio66kqjsobw25gtmy5a7fwwsa4hjn3d25a4tppfylbdepbjq);
  background-repeat: no-repeat;
  background-size: cover;
  padding: 0 16px;
  color: white;
  @media (min-width: 640px) {
    padding: 0 40px;
  }
`;

const Spacer = styled.div``;

const BodyContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 20px;
  margin: 40px 0;
`;

const HeaderContainer = styled.div`
  padding: 18px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 56px;
`;

const TabItem = styled.div`
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  ${(props) => !props.selected && "opacity: 0.4;"}
`;

const FormContainer = styled.div`
  max-width: 650px;
  width: 100%;
  background: #141414;
  border-radius: 4px;
  border: 1px solid #ffffff1a;
  display: flex;
  flex-direction: column;
  gap: 36px;

  padding: 16px;
  @media (min-width: 640px) {
    padding: 24px;
  }
`;

State.init({
  tab: "DA Calculator", // Mint / Indexer / Transfer
});

const fetchDACalculatorData = async (blobSizes) => {
  try {
    const response = await fetch(
      "https://da-calculator-697b837afec5.herokuapp.com/estimateFee",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blobSizes: [blobSizes] }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data; // This is the response data from the API
  } catch (error) {
    console.error("Could not fetch data from DA Calculator:", error);
  }
};

const handleSubmit = async (event) => {
  event.preventDefault(); // Prevent the default form submission behavior
  const result = await fetchDACalculatorData(dataSize);

  // Here you can set the state with the result or process it as needed
  State.update({ result });
  return result; // For demonstration purposes, we're just logging it
};

var { tab, dataToSend, result } = state;
return (
  <Main>
    <HeaderContainer>
      <TabContainer>
        <TabItem
          selected={tab === "DA Calculator"}
          onClick={() => State.update({ tab: "DA Calculator" })}
        >
          DA Calculator
        </TabItem>
      </TabContainer>
      <Spacer />
    </HeaderContainer>
    <BodyContainer>
      {tab === "DA Calculator" && (
        <>
          <FormInputContainer>
            <FormInputLabel>
              <FormInputTitle>Data to Send (Bytes)</FormInputTitle>
            </FormInputLabel>
            <FormInputRow
              style={{
                border: `1px solid ${varientColor}`,
              }}
            >
              <input
                type="number" // Ensures only numbers can be entered
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "0",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#FFFFFF", // Set text color to white
                  outline: "none",
                  boxShadow: "none",
                  marginRight: "16px",
                  WebkitAppearance: "none",
                  MozAppearance: "textfield",
                }}
                value={state.dataToSend}
                onChange={(e) => State.update({ dataToSend: e.target.value })}
                spellCheck="false"
              />
              <UnitContent>Bytes</UnitContent>
            </FormInputRow>
            {/* Submit Button */}
            <button
              type="submit"
              style={{
                padding: "12px 24px", // Slightly larger padding for a bigger button
                fontSize: "16px",
                fontWeight: "bold",
                color: "#FFFFFF", // White text color for contrast
                backgroundColor: "", // A shade of green that matches your design
                border: "none",
                borderRadius: "8px", // Rounded corners
                cursor: "pointer",
                marginTop: "20px",
                boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.25)", // Optional: adds a subtle shadow for depth
                transition: "background-color 0.3s", // Smooth transition for hover effect
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#16ab39")} // Darker shade on hover
              onMouseOut={(e) => (e.target.style.backgroundColor = "#21ba45")} // Original color on mouse out
              onClick={handleSubmit}
            >
              Submit
            </button>
          </FormInputContainer>
          {result && (
            <div>
              <h2>Result:</h2>
              <p>{JSON.stringify(result)}</p>
            </div>
          )}
        </>
      )}
    </BodyContainer>
  </Main>
);

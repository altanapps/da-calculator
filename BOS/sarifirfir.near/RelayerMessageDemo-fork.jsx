const contract = "guest-book.near";
const relayerAccountId = "relayer.pagodaplatform.near";
const messages = Near.view(contract, "getMessages", undefined, undefined, true)
  .reverse()
  .filter((message) => message.sender === context.accountId);

State.init({
  newMessage: "",
  inFlightMessage: "",
});

const addNewMessage = () => {
  if (state.newMessage.trim() == "") {
    return;
  }

  Near.call(contract, "addMessage", {
    text: state.newMessage,
  });

  State.update({
    newMessage: "",
  });
};

const userAccountStatus = fetch("https://rpc.mainnet.near.org", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: "dontcare",
    method: "query",
    params: {
      request_type: "view_account",
      finality: "final",
      account_id: context.accountId,
    },
  }),
});

const daCosts = fetch("http://localhost:3000/estimateFee", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    blobSize: [2000]
  }),
});

const relayerAccountStatus = fetch("https://rpc.mainnet.near.org", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: "dontcare",
    method: "query",
    params: {
      request_type: "view_account",
      finality: "final",
      account_id: relayerAccountId,
    },
  }),
});

const nearAmount = (yocto) => (parseInt(yocto) / Math.pow(10, 24)).toFixed(2);

const StyledContainer = styled.div`
  border-radius: 10px;
  padding: 40px;

  .wrapper {
    max-width: 850px;
    margin: 0 auto;
  }

  a,
  textarea {
    display: block;
  }

  h1 {
    margin: 40px 0;
    font-weight: bold;
  }

  h4 {
    font-weight: normal;
    line-height: 150%;
  }

  .relayer-balance {
    color: inherit;
    border: 1px solid #000;
    border-radius: 8px;
    padding: 10px 20px;
    width: fit-content;
    font-size: 12px;
    margin: 40px auto;
  }

  .your-balance {
    font-size: 14px;
    color: #3e3e3e;
  }

  textarea {
    width: 100%;
    border-radius: 8px;
    padding: 20px;
    border: 1px solid #d6d6d6;
    margin: 20px 0;
    font-size: 16px;
    placeholder {
      color: #818181;
    }
    :focus {
      border: 1px solid #61e5e2;
      outline: none;
    }
  }

  button {
    color: white;
    background-color: #000000;
    border-radius: 8px;
    padding: 14px 24px;
    border: none;
    font-size: 16px;
    margin-left: auto;
    display: block;
    :hover {
      color: white;
      background-color: #000000;
    }
  }

  .messages {
    margin: 40px 0;
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    li {
      margin: 20px 0;
      padding: 0;
      background-color: #61e5e2;
      border-radius: 40px;
      padding: 10px 20px;
      color: #000000;
      width: fit-content;
      font-size: 14px;
    }
  }

  .view-txs-btn {
    color: black;
    font-size: 14px;
    border: 1px solid #000;
    width: fit-content;
    border-radius: 8px;
    padding: 10px 20px;
  }

  .learn-more-links-wrapper {
    display: flex;
    align-items: center;
    margin: 15px 0;

    :first-of-type {
      margin-top: 0;
    }
  }

  .learn-more-links {
    color: black;
    text-decoration: underline;
    font-size: 22px;
  }

  .in-flight {
        animation: shimmer 1s infinite alternate;

        @keyframes shimmer {
        0% {
            opacity: 1;
        }
        100% {
            opacity: 0.2;
        }
    }
}

.disclaimer {
    a {
        color: #61e5e2;
        display: inline;
    }
}
`;

return (
  <StyledContainer>
    <div className="wrapper">
      <div className="disclaimer">
        Make sure you're on{" "}
        <a href="https://near.org/relayer-demo">near.org/relayer-demo</a>
      </div>
      <h1>Live DA cost comparison!</h1>
      <h4>
        Let's see how much it costs to post messages to each of the DA providers
      </h4>
      <div className="your-balance">
        Your balance: {nearAmount(userAccountStatus.body.result.amount)} NEAR
      </div>
      <textarea
        name=""
        id=""
        cols="30"
        rows="5"
        placeholder="Add your message to the guest book contract..."
        value={state.newMessage}
        onChange={(e) => State.update({ newMessage: e.target.value })}
      ></textarea>
      <button
        onClick={() => {
          State.update({
            inFlightMessage: state.newMessage,
          });
          addNewMessage();
        }}
      >
        Add Message
      </button>
      <div className="messages">
        New messages confirmed every 5 seconds
        {state.inFlightMessage &&
          !messages
            .map((data) => data.text)
            .includes(state.inFlightMessage) && (
            <ul className="in-flight">
              <li>{state.inFlightMessage}</li>
            </ul>
          )}
        <ul>
          {messages.map((data, key) => {
            return <li key={key}>{data.text}</li>;
          })}
        </ul>
      </div>
      <a
        className="view-txs-btn"
        href={daCosts.body.result}
      >
         <div className="your-balance">
        Your balance: {nearAmount(daCosts.body.result)} NEAR
      </div>
        View all transactions
      </a>
      <h1>Learn More</h1>
      <div className="learn-more-links-wrapper">
        <a
          className="learn-more-links"
          href="https://github.com/near/pagoda-relayer-rs"
          target="_blank"
        >
          Pagoda Relayer Github Repo
        </a>
        <i class="ph-bold ph-arrow-up-right"></i>
      </div>
      <div className="learn-more-links-wrapper">
        <a
          className="learn-more-links"
          href="https://wiki.near.org/overview/BOS/fast-auth"
          target="_blank"
        >
          Learn About FastAuth
        </a>
        <i class="ph-bold ph-arrow-up-right"></i>
      </div>
      <div className="learn-more-links-wrapper">
        <a
          className="learn-more-links"
          href="https://github.com/near/NEPs/pull/366"
          target="_blank"
        >
          Learn About Meta Transactions
        </a>
        <i class="ph-bold ph-arrow-up-right"></i>
      </div>
    </div>
  </StyledContainer>
);

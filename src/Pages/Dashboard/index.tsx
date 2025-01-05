import { Col, Container, Row, Table } from "react-bootstrap";
import BalanceModifier from "../../Components/BalanceModifier";
import { useEffect, useState } from "react";
import { Client, ResponseData } from "../../global";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase";
import {
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { PubSub } from "@google-cloud/pubsub";

const Dashboard: React.FC = () => {
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [clientele, setClientele] = useState<Client[]>([]);

  const getAllClients = () => {
    httpsCallable(functions, "getUsers")
      .call({})
      .then((d) => {
        console.log("clients", d.data);
        setClientele((d.data as ResponseData).data as Client[]);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const eventListener = () => {
    console.log("Listening for PubSub events!");
    // const pubsub = new PubSub({ projectId: "white-byway-374008" });
    // const topic = pubsub.topic("fintech");
    // const sub = topic.subscription(
    //   "projects/white-byway-374008/subscriptions/fintech-sub"
    // );
    // sub.on("message", (message) => {
    //   console.log(message.data);
    // });
    // sub.on("error", (error) => {
    //   console.error(error);
    // });
  };

  useEffect(() => {
    if (clientele.length === 0) {
      getAllClients();
    } else {
      console.log(clientele);
    }

    if (client !== undefined) {
      eventListener();
    }
  }, [clientele, client]);

  if (clientele.length === 0) {
    return <Container>Loading</Container>;
  } else {
    // setClient(clientele[0]);
  }

  if (client === undefined) {
    return (
      <ClientSelector
        clients={clientele}
        currentClient={client}
        onClientSelected={(cli) => {
          setClient(cli);
        }}
      />
    );
  }

  return (
    <>
      <ClientSelector
        clients={clientele}
        currentClient={client}
        onClientSelected={(cli) => {
          setClient(cli);
        }}
      />
      <Container>
        <Row>
          <Col md={7}>
            <label>As of {new Date().toDateString()}: Your balance:</label>
            <h1>ZAR {client?.balance}</h1>
            <BalanceModifier accountClient={client} withdrawal />
          </Col>
          <Col md={5}>
            <label htmlFor="previousTrans">Tools and Tech</label>
          </Col>
        </Row>
      </Container>
    </>
  );
};

type AccountSelect = {
  onClientSelected: (client: Client) => void;
  currentClient?: Client;
  clients: Client[];
};

const ClientSelector: React.FC<AccountSelect> = ({
  onClientSelected,
  currentClient,
  clients,
}) => {
  const [open, setOpen] = useState(false);

  const handleClientClick = (client: Client) => {
    onClientSelected(client);
    setOpen(false);
  };

  return (
    <>
      <Container
        fluid
        style={{ textAlign: "center", backgroundColor: "tomato", padding: 10 }}
      >
        {currentClient ? (
          <>
            <label onClick={() => setOpen(true)}>
              {currentClient.fullname}
            </label>
            <br />
            <label
              style={{ textDecoration: "underline" }}
              onClick={() => setOpen(true)}
            >
              Switch client
            </label>
          </>
        ) : (
          <label onClick={() => setOpen(true)}>
            Click here to select client
          </label>
        )}
      </Container>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Select Account</DialogTitle>
        <List sx={{ pt: 0 }}>
          {clients.map((client) => (
            <ListItem disablePadding key={client.uid}>
              <ListItemButton onClick={() => handleClientClick(client)}>
                <ListItemText primary={client.fullname} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Dialog>
    </>
  );
};

export default Dashboard;

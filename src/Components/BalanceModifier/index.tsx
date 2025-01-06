import {
  Box,
  Button,
  FormControl,
  Input,
  InputAdornment,
  InputLabel,
  Modal,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { CSSProperties } from "styled-components";
import { Client } from "../../global";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase";
import axios from "axios";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  padding: "50px",
} as CSSProperties;

type ModifierType = {
  accountClient: Client;
  withdrawal?: boolean;
  onSuccess: (newBalance: number) => void;
};

const BalanceModifier: React.FC<ModifierType> = ({
  accountClient,
  withdrawal,
  onSuccess,
}) => {
  const [open, setOpen] = React.useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [url, setUrl] = useState(
    `https://us-central1-white-byway-374008.cloudfunctions.net/withdrawV2?clientId=${accountClient.uid}&amount=${withdrawalAmount}`
  );
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleWithdrawal = () => {
    console.log(accountClient);
    axios
      .get(url)
      .then((x) => {
        console.log(x.data);
        onSuccess(x.data["balance"] as number);
        setOpen(false);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return (
    <div>
      <Button onClick={handleOpen}>Withdraw</Button>
      <Modal
        keepMounted
        open={open}
        onClose={handleClose}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
      >
        <Box sx={style}>
          <Typography id="keep-mounted-modal-title" variant="h6" component="h2">
            Withdraw
          </Typography>

          <FormControl fullWidth sx={{ m: 1 }} variant="standard">
            <InputLabel htmlFor="standard-adornment-amount">Amount</InputLabel>
            <Input
              type="number"
              id="standard-adornment-amount"
              onChange={(e) => {
                console.log(e.target.value);
                setUrl(
                  `https://us-central1-white-byway-374008.cloudfunctions.net/withdrawV2?clientId=${accountClient.uid}&amount=${e.target.value}`
                );
                setWithdrawalAmount(Number.parseInt(e.target.value));
              }}
              startAdornment={
                <InputAdornment position="start">ZAR</InputAdornment>
              }
            />
          </FormControl>
          <Button onClick={handleWithdrawal}>Process</Button>
          <Button onClick={handleClose}>Cancel</Button>
          <div style={{ padding: "30px" }}>
            <label>withdraw by HTTPS Request (like API)</label>
            <br />
            <a href={url}>{url}</a>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default BalanceModifier;

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
};

const BalanceModifier: React.FC<ModifierType> = ({
  accountClient,
  withdrawal,
}) => {
  const [open, setOpen] = React.useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleWithdrawal = () => {
    console.log(accountClient);
    httpsCallable(functions, "withdraw")
      .call({
        clientId: accountClient.uid,
        amount: withdrawalAmount,
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((e) => {
        console.warn(e);
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
                setWithdrawalAmount(Number.parseInt(e.target.value));
              }}
              startAdornment={
                <InputAdornment position="start">ZAR</InputAdornment>
              }
            />
          </FormControl>
          <Button onClick={handleWithdrawal}>Process</Button>
          <Button onClick={handleClose}>Cancel</Button>
        </Box>
      </Modal>
    </div>
  );
};

export default BalanceModifier;

/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest, onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { createPool, PoolOptions } from "mysql2/promise";
// const { PubSub } = require("@google-cloud/pubsub");

// const pubSubClient = new PubSub({
//   projectId: "white-byway-374008",
// });

// const topic = pubSubClient.topic("projects/white-byway-374008/topics/fintech");

const poolOptions = {
  database: "fintech",
  port: 3306,
  user: "admin",
  password: "huambo#1995",
  host: "fintech.chc48k60w3sf.af-south-1.rds.amazonaws.com",
  connectTimeout: 10 * 1000,
} as PoolOptions;

const pConnection = createPool(poolOptions);

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Sanlam Fintech!");
});

export const withdraw = onCall(async (request) => {
  logger.info("Request Data", request.data);
  const clientID = request.data.clientId;
  const amount = request.data.amount;

  const withdrawRequest = {
    amount: amount,
    clientID: clientID,
  } as WithdrawRequest;

  await pConnection
    .query(`SELECT balance FROM client WHERE uid = ${clientID}`)
    .then((v) => {
      withdrawRequest.balance = v[0] as any as number;
    })
    .catch((e) => {
      withdrawRequest.status = "FAIL";
      withdrawRequest.message = e;
    });

  if (withdrawRequest.balance < amount) {
    withdrawRequest.status = "FAIL";
    withdrawRequest.message = "Insufficient funds for withdrawal";
  }

  const newBalance = withdrawRequest.balance - amount;

  if (newBalance >= 0) {
    await pConnection
      .execute(`UPDATE client SET balance = ? WHERE uid = ?`, [
        newBalance,
        clientID,
      ])
      .then((exe) => {
        withdrawRequest.balance = newBalance;
        withdrawRequest.status = "SUCCESS";
        withdrawRequest.message = `Completed Withdrawal of ${amount}. Remaining balance ZAR ${withdrawRequest.balance}`;
      })
      .catch((e) => {
        logger.error("Failed to Complete Withdrawal Request due to ", e);
      });
  }

  publishTrasaction(withdrawRequest);

  return withdrawRequest;
});

export const withdrawV2 = onRequest(
  {
    cors: ["*"],
  },
  async (request, response) => {
    logger.info("Request Data", request.query);
    const clientID = request.query.clientId;
    const amount = parseFloat(request.query.amount as string);

    const withdrawRequest = {
      amount: amount,
      clientID: clientID,
      stage: "SELECT BALANCE",
    } as WithdrawRequest;
    withdrawRequest.updates = new Array<String>();
    withdrawRequest.updates.push("Selecting balance");

    await pConnection
      .execute(`SELECT balance FROM client WHERE uid = '${clientID}'`)
      .then((v) => {
        withdrawRequest.balance = (v[0] as any[])[0]["balance"] as number;
        withdrawRequest.updates.push(
          "Found Balance Data: " + withdrawRequest.balance
        );
      })
      .catch((e) => {
        withdrawRequest.status = "FAIL";
        withdrawRequest.message = e;
        withdrawRequest.updates.push("Failed Balance Data: " + e);
      });

    withdrawRequest.updates.push("Balance Verifier");
    if (withdrawRequest.balance < amount) {
      withdrawRequest.status = "FAIL";
      withdrawRequest.message = "Insufficient funds for withdrawal";
      withdrawRequest.updates.push("Insufficient funds for withdrawal");
    }

    withdrawRequest.stage = "UPDATE BALANCE";
    const newBalance = withdrawRequest.balance - amount;
    withdrawRequest.updates.push(
      "The New Balance should be: ZAR " + (withdrawRequest.balance - amount)
    );

    if (newBalance >= 0) {
      withdrawRequest.updates.push("Sufficient Balance");
      await pConnection
        .execute(
          `UPDATE client SET balance = ${newBalance} WHERE uid = '${clientID}'`
        )
        .then((exe) => {
          withdrawRequest.updates.push(exe[0] as any as String);
          withdrawRequest.balance = newBalance;
          withdrawRequest.status = "SUCCESS";
          withdrawRequest.message = `Completed Withdrawal of ${amount}. Remaining balance ZAR ${withdrawRequest.balance}`;
          withdrawRequest.updates.push(
            `Completed Withdrawal of ${amount}. Remaining balance ZAR ${withdrawRequest.balance}`
          );
        })
        .catch((e) => {
          logger.error("Failed to Complete Withdrawal Request due to ", e);
          withdrawRequest.updates.push(
            "Failed to Complete Withdrawal Request due to " + e
          );
        });
    }

    try {
      publishTrasaction(withdrawRequest);
    } catch (e) {
      logger.error("Failed to publish due to ", e);
    }

    response.json(withdrawRequest);
  }
);

const publishTrasaction = (wdRequest: WithdrawRequest) => {
  let success = false;

  //   topic
  //     .publishMessage({ data: Buffer.from(JSON.stringify(wdRequest)) })
  //     .then((x: any) => {
  //       success = true;
  //       logger.info("Successfully Sent Message", x);
  //     })
  //     .catch((e: any) => {
  //       success = false;
  //       logger.error("Failed to Send message due to", e);
  //     });

  logger.info("SNS Notification", success);
};

export const getUsers = onCall(async () => {
  const body = {} as ResponseBody;

  await pConnection
    .query("SELECT * FROM client")
    .then((v) => {
      body["data"] = v["0"];
      logger.info("Available users", body.data);
    })
    .catch((e) => {
      logger.error("Failed to get users due to ", e);
    });

  return body;
});

type ResponseBody = {
  data: any;
  error?: any;
};

type WithdrawRequest = {
  amount: number;
  balance: number;
  clientID: string;
  status: "SUCCESS" | "FAIL";
  message?: string;
  stage?: "SELECT BALANCE" | "UPDATE BALANCE";
  updates: Array<String>;
};

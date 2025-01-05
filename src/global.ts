export type Client = {
  uid: string;
  balance: number;
  fullname: string;
  phoneNumber?: string;
};

export type Transaction = {
  id: string;
  amount: number;
  status: "SUCCESS" | "FAILED";
  clientId: string;
};

export type ResponseData = {
  data: any;
};

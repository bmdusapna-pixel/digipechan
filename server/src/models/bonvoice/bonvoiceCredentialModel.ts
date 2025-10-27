import { Schema, model, Document } from "mongoose";

export interface BonvoiceCredentialDoc extends Document {
  username: string;
  password: string;
  did: string;
  token?: string;
}

const bonvoiceCredentialSchema = new Schema<BonvoiceCredentialDoc>(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    did: { type: String, required: true },
    token: { type: String, required: false },
  },
  { timestamps: true }
);

export const BonvoiceCredential = model<BonvoiceCredentialDoc>(
  "BonvoiceCredential",
  bonvoiceCredentialSchema
);

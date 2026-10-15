import { GoogleAuth } from "google-auth-library";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
export const headers = [
  "Order ID",
  "Date & Time",
  "Customer Name",
  "Phone Number",
  "Email Address",
  "Exact Location",
  "Product Name",
  "Quantity",
  "Price Per Piece",
  "Total Price",
  "Payment Method",
  "Order Status",
  "Notes",
  "Request Fingerprint",
  "Business Email Sent",
  "Customer Email Sent",
  "Delivery Fee",
  "Delivery Zone",
];
export function row(o) {
  return [
    o.id,
    o.date,
    o.name,
    o.phone,
    o.email,
    o.location,
    o.productName,
    o.quantity,
    o.price,
    o.total,
    o.paymentMethod,
    o.status,
    "",
    o.fingerprint,
    o.businessSent ? "Yes" : "No",
    o.customerSent ? "Yes" : "No",
    o.delivery,
    o.zone,
  ];
}
function fromRow(r, index) {
  return {
    id: r[0],
    date: r[1],
    name: r[2],
    phone: r[3],
    email: r[4],
    location: r[5],
    productName: r[6],
    quantity: Number(r[7]),
    price: Number(r[8]),
    total: Number(r[9]),
    paymentMethod: r[10],
    status: r[11],
    fingerprint: r[13],
    businessSent: r[14] === "Yes",
    customerSent: r[15] === "Yes",
    delivery: Number(r[16]),
    zone: r[17],
    row: index + 2,
  };
}
export function localRepository() {
  const dir = path.join(process.cwd(), ".local-orders");
  const file = (id) => path.join(dir, id + ".json");
  return {
    async find(id) {
      try {
        return JSON.parse(await readFile(file(id), "utf8"));
      } catch (e) {
        if (e.code === "ENOENT") return null;
        throw e;
      }
    },
    async save(o) {
      await mkdir(dir, { recursive: true });
      const temp = file(o.id) + ".tmp";
      await writeFile(temp, JSON.stringify(o, null, 2));
      await rename(temp, file(o.id));
    },
    async mark(o) {
      await this.save(o);
    },
  };
}
export async function sheetsRepository() {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const client = await auth.getClient();
  const base =
    "https://sheets.googleapis.com/v4/spreadsheets/" +
    encodeURIComponent(process.env.GOOGLE_SHEET_ID) +
    "/values/";
  const tab = "'" + process.env.GOOGLE_SHEET_TAB_NAME.replace(/'/g, "''") + "'";
  async function req(range, method = "GET", data, query = "") {
    return (
      await client.request({
        url:
          base +
          encodeURIComponent(tab + "!" + range) +
          (method === "GET" && !query
            ? "?valueRenderOption=UNFORMATTED_VALUE"
            : query),
        method,
        data,
        timeout: 15000,
      })
    ).data;
  }
  const first = await req("A1:R1");
  if (JSON.stringify(first.values?.[0]) !== JSON.stringify(headers))
    throw new Error("Spreadsheet headers do not match. Follow README setup.");
  return {
    async find(id) {
      const data = await req("A2:R");
      const index = (data.values || []).findIndex((r) => r[0] === id);
      return index < 0 ? null : fromRow(data.values[index], index);
    },
    async save(o) {
      const result = await req(
        "A:R",
        "POST",
        { values: [row(o)] },
        ":append?valueInputOption=RAW&insertDataOption=OVERWRITE",
      );
      const match = result.updates?.updatedRange?.match(/!A(\d+):/);
      if (!match) throw new Error("Unable to confirm spreadsheet write");
      o.row = Number(match[1]);
    },
    async mark(o, field) {
      const col = field === "businessSent" ? "O" : "P";
      await req(
        col + o.row,
        "PUT",
        { values: [["Yes"]] },
        "?valueInputOption=RAW",
      );
    },
  };
}

import { GoogleAuth } from "google-auth-library";
import { headers } from "../lib/repository.mjs";
import { formattingRequests } from "../lib/sheet-format.mjs";

async function setup() {
  for (const key of [
    "GOOGLE_SHEET_ID",
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
    "GOOGLE_SHEET_TAB_NAME",
  ])
    if (!process.env[key]) throw new Error("Missing " + key);
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const client = await auth.getClient();
  const url =
    "https://sheets.googleapis.com/v4/spreadsheets/" +
    encodeURIComponent(process.env.GOOGLE_SHEET_ID);
  const meta = (await client.request({ url, timeout: 15000 })).data;
  let tab = meta.sheets.find(
    (s) => s.properties.title === process.env.GOOGLE_SHEET_TAB_NAME,
  );
  if (!tab) {
    const created = (
      await client.request({
        url: url + ":batchUpdate",
        method: "POST",
        data: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: process.env.GOOGLE_SHEET_TAB_NAME,
                  gridProperties: { rowCount: 1000, columnCount: 18 },
                },
              },
            },
          ],
        },
        timeout: 15000,
      })
    ).data;
    tab = { properties: created.replies[0].addSheet.properties };
  }
  const id = tab.properties.sheetId;
  if (tab.properties.gridProperties.columnCount < 18) {
    await client.request({
      url: url + ":batchUpdate",
      method: "POST",
      data: {
        requests: [
          {
            appendDimension: {
              sheetId: id,
              dimension: "COLUMNS",
              length: 18 - tab.properties.gridProperties.columnCount,
            },
          },
        ],
      },
    });
  }
  const range =
    "'" + process.env.GOOGLE_SHEET_TAB_NAME.replace(/'/g, "''") + "'!A1:R1";
  const existing = (
    await client.request({
      url: url + "/values/" + encodeURIComponent(range),
      timeout: 15000,
    })
  ).data.values?.[0];
  if (existing?.length && JSON.stringify(existing) !== JSON.stringify(headers))
    throw new Error(
      "Existing header differs; refusing to overwrite. Set GOOGLE_SHEET_TAB_NAME to a new empty tab.",
    );
  await client.request({
    url: url + "/values/" + encodeURIComponent(range) + "?valueInputOption=RAW",
    method: "PUT",
    data: { values: [headers] },
    timeout: 15000,
  });
  await client.request({
    url: url + ":batchUpdate",
    method: "POST",
    data: { requests: formattingRequests(tab) },
    timeout: 15000,
  });
  console.log(
    "Order sheet ready: green header, alternating rows, frozen header, filters, rupee formats, status colours, dropdowns and hidden technical columns.",
  );
}
setup().catch((e) => {
  console.error(
    "Sheet setup failed:",
    e.response?.data?.error?.message || e.message,
  );
  process.exitCode = 1;
});

import test from "node:test";
import assert from "node:assert/strict";
import { formattingRequests, statuses } from "../lib/sheet-format.mjs";
test("sheet formatting includes rupee display, status dropdown, banding and frozen headers", () => {
  const requests = formattingRequests({ properties: { sheetId: 123 } });
  assert.equal(statuses.length, 5);
  assert.equal(
    requests.find((r) => r.updateSheetProperties).updateSheetProperties
      .properties.gridProperties.frozenRowCount,
    1,
  );
  assert.ok(requests.some((r) => r.addBanding));
  assert.equal(requests.filter((r) => r.addConditionalFormatRule).length, 5);
  assert.equal(
    requests.find((r) => r.setDataValidation).setDataValidation.rule.condition
      .values.length,
    5,
  );
  assert.ok(
    requests.some((r) =>
      r.repeatCell?.cell?.userEnteredFormat?.numberFormat?.pattern.includes(
        "Rs.",
      ),
    ),
  );
  assert.ok(
    !requests.some((r) => r.updateCells || r.deleteSheet || r.deleteRange),
  );
});
test("repeated formatting updates existing bands and status rules", () => {
  const tab = {
    properties: { sheetId: 123 },
    bandedRanges: [
      {
        bandedRangeId: 5,
        range: { startRowIndex: 0, startColumnIndex: 0, endColumnIndex: 18 },
      },
    ],
    conditionalFormats: statuses.map(([name]) => ({
      ranges: [{ startColumnIndex: 11 }],
      booleanRule: {
        condition: { type: "TEXT_EQ", values: [{ userEnteredValue: name }] },
      },
    })),
  };
  const requests = formattingRequests(tab);
  assert.ok(requests.some((r) => r.updateBanding));
  assert.ok(!requests.some((r) => r.addBanding));
  assert.equal(requests.filter((r) => r.updateConditionalFormatRule).length, 5);
  assert.ok(!requests.some((r) => r.addConditionalFormatRule));
});

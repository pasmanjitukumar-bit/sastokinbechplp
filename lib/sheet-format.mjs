const rgb = (r, g, b) => ({ red: r / 255, green: g / 255, blue: b / 255 });
export const statuses = [
  ["New Order", rgb(253, 238, 203), rgb(125, 82, 15)],
  ["Order Confirmed", rgb(220, 237, 254), rgb(28, 77, 123)],
  ["Order Ongoing", rgb(235, 226, 249), rgb(91, 51, 136)],
  ["Delivered", rgb(220, 240, 224), rgb(29, 91, 48)],
  ["Cancelled", rgb(250, 224, 224), rgb(138, 45, 45)],
];
export function formattingRequests(tab) {
  const id = tab.properties.sheetId;
  const body = {
    sheetId: id,
    startRowIndex: 1,
    startColumnIndex: 0,
    endColumnIndex: 18,
  };
  const column = (start, end) => ({
    ...body,
    startColumnIndex: start,
    endColumnIndex: end,
  });
  const request = [
    {
      updateSheetProperties: {
        properties: {
          sheetId: id,
          tabColorStyle: { rgbColor: rgb(232, 189, 99) },
          gridProperties: {
            frozenRowCount: 1,
            frozenColumnCount: 1,
            hideGridlines: true,
          },
        },
        fields:
          "tabColorStyle,gridProperties.frozenRowCount,gridProperties.frozenColumnCount,gridProperties.hideGridlines",
      },
    },
    {
      repeatCell: {
        range: body,
        cell: {
          userEnteredFormat: {
            textFormat: {
              fontFamily: "Calibri",
              fontSize: 11,
              foregroundColor: rgb(34, 61, 49),
            },
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
            padding: { top: 8, bottom: 8, left: 10, right: 10 },
          },
        },
        fields:
          "userEnteredFormat.textFormat,userEnteredFormat.verticalAlignment,userEnteredFormat.wrapStrategy,userEnteredFormat.padding",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: id,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 18,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: rgb(24, 62, 54),
            textFormat: {
              bold: true,
              fontFamily: "Calibri",
              fontSize: 11,
              foregroundColor: rgb(255, 255, 255),
            },
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
            padding: { top: 12, bottom: 12, left: 10, right: 10 },
          },
        },
        fields: "userEnteredFormat",
      },
    },
    {
      setBasicFilter: {
        filter: {
          range: {
            sheetId: id,
            startRowIndex: 0,
            startColumnIndex: 0,
            endColumnIndex: 18,
          },
        },
      },
    },
    {
      setDataValidation: {
        range: column(11, 12),
        rule: {
          condition: {
            type: "ONE_OF_LIST",
            values: statuses.map(([userEnteredValue]) => ({
              userEnteredValue,
            })),
          },
          strict: true,
          showCustomUi: true,
        },
      },
    },
    {
      repeatCell: {
        range: column(8, 10),
        cell: {
          userEnteredFormat: {
            numberFormat: { type: "NUMBER", pattern: '"Rs. "#,##0' },
            horizontalAlignment: "RIGHT",
          },
        },
        fields:
          "userEnteredFormat.numberFormat,userEnteredFormat.horizontalAlignment",
      },
    },
    {
      repeatCell: {
        range: column(16, 17),
        cell: {
          userEnteredFormat: {
            numberFormat: { type: "NUMBER", pattern: '"Rs. "#,##0' },
            horizontalAlignment: "RIGHT",
          },
        },
        fields:
          "userEnteredFormat.numberFormat,userEnteredFormat.horizontalAlignment",
      },
    },
    {
      repeatCell: {
        range: column(7, 8),
        cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
        fields: "userEnteredFormat.horizontalAlignment",
      },
    },
    {
      repeatCell: {
        range: column(9, 10),
        cell: {
          userEnteredFormat: {
            textFormat: {
              bold: true,
              fontFamily: "Calibri",
              fontSize: 11,
              foregroundColor: rgb(24, 62, 54),
            },
          },
        },
        fields: "userEnteredFormat.textFormat",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId: id, dimension: "ROWS", startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 54 },
        fields: "pixelSize",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId: id, dimension: "ROWS", startIndex: 1 },
        properties: { pixelSize: 48 },
        fields: "pixelSize",
      },
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId: id,
          dimension: "COLUMNS",
          startIndex: 13,
          endIndex: 16,
        },
        properties: { hiddenByUser: true },
        fields: "hiddenByUser",
      },
    },
  ];
  for (const [start, end, width] of [
    [0, 1, 290],
    [1, 2, 190],
    [2, 3, 175],
    [3, 4, 150],
    [4, 5, 235],
    [5, 6, 300],
    [6, 7, 230],
    [7, 8, 85],
    [8, 11, 145],
    [11, 12, 165],
    [12, 13, 230],
    [16, 18, 145],
  ])
    request.push({
      updateDimensionProperties: {
        range: {
          sheetId: id,
          dimension: "COLUMNS",
          startIndex: start,
          endIndex: end,
        },
        properties: { pixelSize: width },
        fields: "pixelSize",
      },
    });
  const band = {
    range: {
      sheetId: id,
      startRowIndex: 0,
      startColumnIndex: 0,
      endColumnIndex: 18,
    },
    rowProperties: {
      headerColor: rgb(24, 62, 54),
      firstBandColor: rgb(255, 255, 255),
      secondBandColor: rgb(243, 247, 240),
    },
  };
  const existingBand = (tab.bandedRanges || []).find(
    (b) =>
      b.range?.startRowIndex === 0 &&
      b.range?.startColumnIndex === 0 &&
      b.range?.endColumnIndex === 18,
  );
  if (existingBand)
    request.push({
      updateBanding: {
        bandedRange: { ...band, bandedRangeId: existingBand.bandedRangeId },
        fields: "range,rowProperties",
      },
    });
  else if (!(tab.bandedRanges || []).length)
    request.push({ addBanding: { bandedRange: band } });
  for (const [status, bg, fg] of statuses) {
    const rule = {
      ranges: [column(11, 12)],
      booleanRule: {
        condition: { type: "TEXT_EQ", values: [{ userEnteredValue: status }] },
        format: {
          backgroundColor: bg,
          textFormat: { bold: true, foregroundColor: fg },
        },
      },
    };
    const old = (tab.conditionalFormats || []).findIndex(
      (r) =>
        r.ranges?.[0]?.startColumnIndex === 11 &&
        r.booleanRule?.condition?.type === "TEXT_EQ" &&
        r.booleanRule.condition.values?.[0]?.userEnteredValue === status,
    );
    if (old >= 0)
      request.push({
        updateConditionalFormatRule: { sheetId: id, index: old, rule },
      });
    else
      request.push({
        addConditionalFormatRule: {
          rule,
          index: (tab.conditionalFormats || []).length,
        },
      });
  }
  return request;
}

import { IInvoice, IUser } from "@/interface";
import moment from "moment";

export default function generateInvoiceHTML(data: IInvoice, user: IUser) {
  // Total is just the amount (no tax)
  const total = +data.amount;
  const logo =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAS4AAACqCAYAAAATFqI5AAAACXBIWXMAAA7EAAAOxAGVKw4bAAALfmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDMgNzkuOTY5MGE4N2ZjLCAyMDI1LzAzLzA2LTIwOjUwOjE2ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczpBdHRyaWI9Imh0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHhtcDpDcmVhdG9yVG9vbD0iQ2FudmEgKFJlbmRlcmVyKSBkb2M9REFHNGF0dEIzZkUgdXNlcj1VQUdEMEZzUlNCNCBicmFuZD1CQUdEME5NQURHSSB0ZW1wbGF0ZT1CbGFjayBXaGl0ZSBNaW5pbWFsIFNpbXBsZSBCb2xkICBNb2Rlcm4gUHJvZmVzc2lvbmFsIFBob3RvZ3JhcGh5IExldHRlciBLIE11c2V1bSBMb2dvIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNS0xMS0xMlQxNzozMDowNSswMTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjUtMTEtMTJUMTc6NTk6MTMrMDE6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjUtMTEtMTJUMTc6NTk6MTMrMDE6MDAiIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo0ODM5MjcxNC1jMGUwLTVhNGQtYTBhZC0xNWU1Njc3MDEwNjAiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDdjMWZmMzctZTE5Yi00ZWY4LTkxNGUtNDRjNTNhNWQzYzZhIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MjExNWExNDctY2JhMy00OWYzLTk4ZTQtMWExNzVjMTA2NDAxIj4gPEF0dHJpYjpBZHM+IDxyZGY6U2VxPiA8cmRmOmxpIEF0dHJpYjpDcmVhdGVkPSIyMDI1LTExLTExIiBBdHRyaWI6RXh0SWQ9IjQ0YjBkN2E5LTAzMTktNDhlMS1iYmNjLWMyOTk2MjQyZjUyZiIgQXR0cmliOkZiSWQ9IjUyNTI2NTkxNDE3OTU4MCIgQXR0cmliOlRvdWNoVHlwZT0iMiIvPiA8L3JkZjpTZXE+IDwvQXR0cmliOkFkcz4gPGRjOnRpdGxlPiA8cmRmOkFsdD4gPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5GIC0gMTwvcmRmOmxpPiA8L3JkZjpBbHQ+IDwvZGM6dGl0bGU+IDxkYzpjcmVhdG9yPiA8cmRmOlNlcT4gPHJkZjpsaT5Xb3JsZCBCcmFpbiBUZWNobm9sb2d5PC9yZGY6bGk+IDwvcmRmOlNlcT4gPC9kYzpjcmVhdG9yPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJkZXJpdmVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJjb252ZXJ0ZWQgZnJvbSBpbWFnZS9wbmcgdG8gZG9jdW1lbnQvdm5kLmFkb2JlLmNwc2QrZGN4Ii8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoyMTE1YTE0Ny1jYmEzLTQ5ZjMtOThlNC0xYTE3NWMxMDY0MDEiIHN0RXZ0OndoZW49IjIwMjUtMTEtMTJUMTc6MzA6MTErMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBXZWIgKDIwMjUuMjIuMS4wIGY0OTNhZTExNzJlKSAoR29vZ2xlIENocm9tZSkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmRmY2QxMzE3LWE1NTQtNGMzYi1hZmZlLTEzZmQ0Y2ViNTI2OSIgc3RFdnQ6d2hlbj0iMjAyNS0xMS0xMlQxNzo1OToxMyswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIFdlYiAoMjAyNS4yMi4xLjAgZjQ5M2FlMTE3MmUpIChHb29nbGUgQ2hyb21lKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGRvY3VtZW50L3ZuZC5hZG9iZS5jcHNkK2RjeCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImRlcml2ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImNvbnZlcnRlZCBmcm9tIGRvY3VtZW50L3ZuZC5hZG9iZS5jcHNkK2RjeCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjA3YzFmZjM3LWUxOWItNGVmOC05MTRlLTQ0YzUzYTVkM2M2YSIgc3RFdnQ6d2hlbj0iMjAyNS0xMS0xMlQxNzo1OToxMyswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIFdlYiAoMjAyNS4yMi4xLjAgZjQ5M2FlMTE3MmUpIChHb29nbGUgQ2hyb21lKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpT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";

  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              color: #333;
              line-height: 1.6;
              padding: 40px;
              background: #ffffff;
            }

            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
            }

            /* Status-based theme styles */
            .invoice-container.status-paid .header {
              border-bottom-color: #2e7d32;
            }

            .invoice-container.status-paid .company-name,
            .invoice-container.status-paid .invoice-title {
              color: #2e7d32;
            }

            .invoice-container.status-paid .items-table th {
              border-bottom-color: #2e7d32;
            }

            .invoice-container.status-paid .total-row.grand-total {
              background-color: #2e7d32;
            }

            .invoice-container.status-paid .notes-section {
              border-left-color: #2e7d32;
            }

            .invoice-container.status-paid .footer strong {
              color: #2e7d32;
            }

            .invoice-container.status-paid .due-date-highlight {
              background: #e8f5e9;
              border-left-color: #2e7d32;
            }

            .invoice-container.status-pending .header {
              border-bottom-color: #f9a825;
            }

            .invoice-container.status-pending .company-name,
            .invoice-container.status-pending .invoice-title {
              color: #f9a825;
            }

            .invoice-container.status-pending .items-table th {
              border-bottom-color: #f9a825;
            }

            .invoice-container.status-pending .total-row.grand-total {
              background-color: #f9a825;
            }

            .invoice-container.status-pending .notes-section {
              border-left-color: #f9a825;
            }

            .invoice-container.status-pending .footer strong {
              color: #f9a825;
            }

            .invoice-container.status-pending .due-date-highlight {
              background: #fff8e1;
              border-left-color: #f9a825;
            }

            .invoice-container.status-overdue .header {
              border-bottom-color: #c62828;
            }

            .invoice-container.status-overdue .company-name,
            .invoice-container.status-overdue .invoice-title {
              color: #c62828;
            }

            .invoice-container.status-overdue .items-table th {
              border-bottom-color: #c62828;
            }

            .invoice-container.status-overdue .total-row.grand-total {
              background-color: #c62828;
            }

            .invoice-container.status-overdue .notes-section {
              border-left-color: #c62828;
            }

            .invoice-container.status-overdue .footer strong {
              color: #c62828;
            }

            .invoice-container.status-overdue .due-date-highlight {
              background: #ffebee;
              border-left-color: #c62828;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #2196F3;
            }

            .logo-section {
              flex: 1;
            }

            .logo {
              width: 120px;
              height: auto;
              margin-bottom: 10px;
            }

            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #2196F3;
              margin-bottom: 5px;
            }

            .company-details {
              font-size: 12px;
              color: #666;
              line-height: 1.4;
            }

            .invoice-title-section {
              text-align: right;
            }

            .invoice-title {
              font-size: 36px;
              font-weight: bold;
              color: #2196F3;
              margin-bottom: 10px;
            }

            .invoice-number {
              font-size: 14px;
              color: #666;
              margin-bottom: 5px;
            }

            .invoice-date {
              font-size: 14px;
              color: #666;
            }

            .invoice-status {
              margin-top: 10px;
            }

            .status-badge {
              display: inline-block;
              padding: 4px 10px;
              border-radius: 999px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .status-paid {
              background-color: #e8f5e9;
              color: #2e7d32;
              border: 1px solid #a5d6a7;
            }

            .status-pending {
              background-color: #fff8e1;
              color: #f9a825;
              border: 1px solid #ffe082;
            }

            .status-overdue {
              background-color: #ffebee;
              color: #c62828;
              border: 1px solid #ef9a9a;
            }

            .info-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 40px;
            }

            .client-info,
            .invoice-info {
              flex: 1;
            }

            .section-title {
              font-size: 12px;
              font-weight: bold;
              color: #999;
              text-transform: uppercase;
              margin-bottom: 10px;
              letter-spacing: 1px;
            }

            .client-name {
              font-size: 18px;
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
            }

            .client-details {
              font-size: 14px;
              color: #666;
              line-height: 1.5;
            }

            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
            }

            .info-label {
              font-weight: 600;
              color: #666;
            }

            .info-value {
              color: #333;
            }

            .due-date-highlight {
              background: #fff3cd;
              padding: 10px 15px;
              border-radius: 4px;
              border-left: 4px solid #ffc107;
              margin-top: 10px;
            }

            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }

            .items-table thead {
              background-color: #f5f5f5;
            }

            .items-table th {
              padding: 12px;
              text-align: left;
              font-size: 12px;
              font-weight: bold;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #2196F3;
            }

            .items-table td {
              padding: 15px 12px;
              border-bottom: 1px solid #e0e0e0;
              font-size: 14px;
            }

            .items-table tbody tr:hover {
              background-color: #f9f9f9;
            }

            .text-right {
              text-align: right;
            }

            .text-center {
              text-align: center;
            }

            .description-cell {
              color: #333;
            }

            .totals-section {
              margin-left: auto;
              width: 300px;
              margin-bottom: 30px;
            }

            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 15px;
              font-size: 14px;
            }

            .total-row.subtotal {
              background-color: #f9f9f9;
            }

            .total-row.tax {
              background-color: #f9f9f9;
            }

            .total-row.grand-total {
              background-color: #2196F3;
              color: white;
              font-size: 18px;
              font-weight: bold;
              margin-top: 5px;
              border-radius: 4px;
            }

            .notes-section {
              margin-top: 30px;
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 4px;
              border-left: 4px solid #2196F3;
            }

            .notes-title {
              font-size: 14px;
              font-weight: bold;
              color: #333;
              margin-bottom: 10px;
            }

            .notes-content {
              font-size: 13px;
              color: #666;
              line-height: 1.6;
            }

            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              text-align: center;
              font-size: 12px;
              color: black;
            }

            .footer strong {
              color: #2196F3;
            }

            @media print {
              body {
                padding: 0;
              }

              .invoice-container {
                border: none;
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container status-${data.status}">
            <!-- Header -->
            <div class="header">
              <div class="logo-section">
                ${`<img src="${logo}" alt="Company Logo" class="logo" />`}
                <div class="company-name">${user.business}</div>
                <div class="company-details">
                  ${user.contactAddress}<br>
                  ${user.email}<br>
                  ${user.contactPhone}
                </div>
              </div>
              <div class="invoice-title-section">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">#${data.invoiceNumber}</div>
                <div class="invoice-date">Date: ${new Date().toLocaleDateString()}</div>
                <div class="invoice-status">
                  <span class="status-badge status-${data.status}">${data.status.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <!-- Client & Invoice Info -->
            <div class="info-section">
              <div class="client-info">
                <div class="section-title">Bill To</div>
                <div class="client-name">${data.clientName}</div>
                <div class="client-details">
                  ${data.clientEmail}<br>
                  ${data.clientAddress}
                </div>
              </div>
              <div class="invoice-info">
                <div class="section-title">Payment Details</div>
                <div class="due-date-highlight">
                  <div class="info-row">
                    <span class="info-label">Due Date:</span>
                    <span class="info-value" style="font-weight: bold; color: #f57c00;">${moment((data.dueDate as any).seconds * 1000).format("MMMM Do, YYYY")}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 50%;">Item</th>
                  <th class="text-right" style="width: 17.5%;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${(() => {
      try {
        // Try to parse as JSON (new format with prices)
        const items = JSON.parse(data.items);
        return items
          .map(
            (item: { name: string; price: number }) => `
                  <tr>
                    <td class="description-cell">${item.name}</td>
                    <td class="text-right">$${item.price.toFixed(2)}</td>
                  </tr>
                `,
          )
          .join("");
      } catch {
        // Fallback to old format (comma-separated names)
        return data.items
          .split(",")
          .map(
            (item: string) => `
                  <tr>
                    <td class="description-cell">${item.trim()}</td>
                    <td class="text-right">Included in total</td>
                  </tr>
                `,
          )
          .join("");
      }
    })()}
              </tbody>
            </table>


            <!-- Totals -->
            <div class="totals-section">
              <div class="total-row grand-total">
                <span>TOTAL</span>
                <span>$${total.toFixed(2)}</span>
              </div>
            </div>

            <!-- Notes -->
            ${data.note
      ? `
              <div class="notes-section">
                <div class="notes-title">Notes</div>
                <div class="notes-content">${data.note}</div>
              </div>
            `
      : ""
    }

            <!-- Footer -->
            <div class="footer">
              <p>Thank you for your business!</p>
              <p>If you have any questions about this invoice, please contact <strong>support@freelancemate.com</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;
}
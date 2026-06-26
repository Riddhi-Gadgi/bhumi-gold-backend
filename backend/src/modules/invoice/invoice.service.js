const { jsPDF } = require("jspdf");
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const path = require("path");

const Order = require("../order/order.model");
const OrderItem = require("../orderItem/orderItem.model");
const Invoice = require("./invoice.model");

const FONT = "helvetica";

const COLORS = {
  deepSea: "#003049",
  steelBlue: "#669bbc",
};

// ---------- SAFE HELPERS ----------
const safeText = (val) => String(val ?? "");
const asciiNumber = (val) => {
  const n = Number(val || 0);
  if (isNaN(n)) return "0.00";
  return n.toFixed(2);
};
const formatINR = (val) => `INR ${asciiNumber(val)}`;

const getLogoBase64 = () => {
  const logoPath = path.join(__dirname, "../../assets/logo.png");

  if (!fs.existsSync(logoPath)) {
    console.log("Logo not found at:", logoPath);
    return null;
  }

  const img = fs.readFileSync(logoPath);
  return `data:image/png;base64,${img.toString("base64")}`;
};

const hexToRgb = (hex) => {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const drawGradient = (doc, x, y, width, height, startHex, endHex) => {
  const start = hexToRgb(startHex);
  const end = hexToRgb(endHex);
  const steps = 100;
  const stepWidth = width / steps;

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r = Math.round(start.r + (end.r - start.r) * t);
    const g = Math.round(start.g + (end.g - start.g) * t);
    const b = Math.round(start.b + (end.b - start.b) * t);
    doc.setFillColor(r, g, b);
    doc.rect(x + i * stepWidth, y, stepWidth, height, "F");
  }
};

// ---------- MAIN FUNCTION ----------
exports.generateInvoicePDF = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate({
      path: "customer_id",
      populate: { path: "user_id", select: "name email phone" },
    })
    .lean();

  if (!order) throw new Error("Order not found");

  const items = await OrderItem.find({ order_id: orderId })
    .populate("product_id")
    .lean();

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFont(FONT);

  const marginLeft = 20;
  const marginRight = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;
  const top = 15;

  // ---------- LOGO (1:1 Square) ----------
  const logoSize = 30;
  const logo = getLogoBase64();
  if (logo) {
    doc.addImage(logo, "PNG", marginLeft, top, logoSize, logoSize);
  }

  // ---------- COMPANY ----------
  doc.setFont(FONT, "bold");
  doc.setFontSize(18);
  const color = hexToRgb(COLORS.deepSea);
  doc.setTextColor(color.r, color.g, color.b);
  doc.text("Bhumi Gold", pageWidth - marginRight, top + 6, { align: "right" });

  doc.setFont(FONT, "normal");
  doc.setFontSize(9);
  doc.setTextColor(80);

  const addressBlock = [
    "Metro pillar No. 141 Avadh Pride Shop No 12 12/A,",
    "Vastral Road, Ahmedabad, Gujarat 382418",
    "GST: 27ABCDE1234F1Z5",
    "support@bhumigold.com | +91 9876543210",
  ];

  let addressY = top + 14;
  addressBlock.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, 70);
    wrapped.forEach((l) => {
      doc.text(l, pageWidth - marginRight, addressY, { align: "right" });
      addressY += 5;
    });
  });

  // ---------- GRADIENT LINE ----------
  const gradientY = top + Math.max(logoSize, addressY - top) + 5;
  drawGradient(
    doc,
    marginLeft,
    gradientY,
    contentWidth,
    3,
    COLORS.deepSea,
    COLORS.steelBlue,
  );

  // ---------- TITLE ----------
  doc.setFont(FONT, "bold");
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text("TAX INVOICE", pageWidth / 2, gradientY + 18, { align: "center" });

  // ---------- ORDER DETAILS ----------
  doc.setFont(FONT, "normal");
  doc.setFontSize(10);

  let detailsY = gradientY + 30;
  doc.text(
    safeText(
      `Invoice No: ${order.invoice_number || `INV-${order.order_number}`}`,
    ),
    marginLeft,
    detailsY,
  );
  detailsY += 6;

  doc.text(safeText(`Order No: ${order.order_number}`), marginLeft, detailsY);
  detailsY += 6;

  const date = new Date(order.created_at || Date.now()).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
  doc.text(safeText(`Date: ${date}`), marginLeft, detailsY);
  detailsY += 6;

  doc.text(
    safeText(`Payment Status: ${String(order.payment_status).toUpperCase()}`),
    marginLeft,
    detailsY,
  );

  // ---------- CUSTOMER ----------
  const name = safeText(order?.customer_id?.user_id?.name || "Customer");
  const email = safeText(order?.customer_id?.user_id?.email || "");
  const phone = safeText(order?.customer_id?.user_id?.phone || "");

  doc.setFont(FONT, "bold");
  doc.text("Bill To:", pageWidth - marginRight - 80, gradientY + 30);
  doc.setFont(FONT, "normal");
  doc.text(name, pageWidth - marginRight - 80, gradientY + 36);
  if (email) doc.text(email, pageWidth - marginRight - 80, gradientY + 42);
  if (phone) doc.text(phone, pageWidth - marginRight - 80, gradientY + 48);

  // ---------- TABLE ----------
  const tableStart = gradientY + 60;

  const body =
    items && items.length > 0
      ? items.map((it, index) => {
          const qty = Number(it.quantity || 0);
          const price = Number(it.price_at_purchase || 0);
          const total = qty * price;
          return [
            safeText(index + 1),
            safeText(it.product_id?.name || "Product"),
            safeText(qty),
            formatINR(price),
            formatINR(total),
          ];
        })
      : [["-", "No items", "-", "-", "-"]];

  autoTable(doc, {
    startY: tableStart,
    head: [["#", "Product", "Qty", "Price (INR)", "Total (INR)"]],
    body,
    styles: { font: FONT, fontSize: 10 },
    headStyles: {
      fillColor: hexToRgb(COLORS.deepSea),
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: contentWidth * 0.5 },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
    },
    margin: { left: marginLeft, right: marginRight },
  });

  const finalY = doc.lastAutoTable?.finalY
    ? doc.lastAutoTable.finalY + 10
    : tableStart + 20;

  // ---------- TOTALS ----------
  const totalsLabelX = pageWidth - marginRight - 60;
  const totalsValueX = pageWidth - marginRight;

  doc.text("Total Amount:", totalsLabelX, finalY);
  doc.text(formatINR(order.total_amount), totalsValueX, finalY, {
    align: "right",
  });

  doc.text("Advance Paid:", totalsLabelX, finalY + 8);
  doc.text(formatINR(order.advance_paid || 0), totalsValueX, finalY + 8, {
    align: "right",
  });

  doc.setFont(FONT, "bold");
  if ((order.remaining_amount || 0) > 0) {
    doc.text("Remaining:", totalsLabelX, finalY + 16);
    doc.text(formatINR(order.remaining_amount), totalsValueX, finalY + 16, {
      align: "right",
    });
  } else {
    doc.setTextColor(0, 120, 0);
    doc.text("Paid in Full", totalsValueX, finalY + 16, { align: "right" });
    doc.setTextColor(0, 0, 0);
  }

  // ---------- FOOTER ----------
  doc.setFontSize(8);
  doc.setFont(FONT, "normal");
  doc.setTextColor(120);
  doc.text(
    "This is a computer-generated invoice. No signature required.",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" },
  );

  const buffer = doc.output("arraybuffer");
  return Buffer.from(buffer);
};

// Optional helpers
exports.getInvoiceById = async (id) => {
  return await Invoice.findById(id).populate("order_id");
};
exports.updateInvoice = async (id, data) => {
  return await Invoice.findByIdAndUpdate(id, data, { new: true });
};
exports.deleteInvoice = async (id) => {
  await Invoice.findByIdAndDelete(id);
  return { success: true };
};
exports.markAsSent = async (id) => {
  return await Invoice.findByIdAndUpdate(id, { status: "sent" }, { new: true });
};
exports.markAsPaid = async (id) => {
  return await Invoice.findByIdAndUpdate(id, { status: "paid" }, { new: true });
};

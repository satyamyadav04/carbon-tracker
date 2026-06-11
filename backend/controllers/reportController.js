// const fs = require('fs');
// const path = require('path');
// const PDFDocument = require('pdfkit');
// const nodemailer = require('nodemailer');
// const mongoose = require('mongoose');
// const Activity = require('../models/Activity');
// const Report = require('../models/Report');
// const User = require('../models/User');

// const getDateRange = (period) => {
//   const end = new Date();
//   end.setHours(23, 59, 59, 999);
//   const start = new Date(end);

//   switch (period) {
//     case 'today':
//       start.setHours(0, 0, 0, 0);
//       break;
//     case 'weekly':
//       start.setDate(end.getDate() - 6);
//       start.setHours(0, 0, 0, 0);
//       break;
//     case 'monthly':
//       start.setDate(end.getDate() - 29);
//       start.setHours(0, 0, 0, 0);
//       break;
//     default:
//       start.setDate(end.getDate() - 29);
//       start.setHours(0, 0, 0, 0);
//       break;
//   }

//   return { start, end };
// };

// const buildReportSummary = async (userId, start, end) => {
//   const userObjectId = new mongoose.Types.ObjectId(userId);
//   const endInclusive = new Date(end);
//   endInclusive.setHours(23, 59, 59, 999);

//   const totalStats = await Activity.aggregate([
//     { $match: { user: userObjectId, date: { $gte: start, $lte: endInclusive } } },
//     {
//       $group: {
//         _id: null,
//         totalCarbonKg: { $sum: '$carbonEmissionKg' },
//         activityCount: { $sum: 1 },
//       },
//     },
//   ]);

//   const breakdown = await Activity.aggregate([
//     { $match: { user: userObjectId, date: { $gte: start, $lte: endInclusive } } },
//     {
//       $group: {
//         _id: '$activityType',
//         carbonKg: { $sum: '$carbonEmissionKg' },
//         count: { $sum: 1 },
//       },
//     },
//     { $sort: { carbonKg: -1 } },
//   ]);

//   return {
//     totalCarbonKg: Number((totalStats[0]?.totalCarbonKg || 0).toFixed(3)),
//     activityCount: totalStats[0]?.activityCount || 0,
//     breakdown: breakdown.map((item) => ({
//       activityType: item._id,
//       carbonKg: Number(item.carbonKg.toFixed(3)),
//       count: item.count,
//     })),
//   };
// };

// // Helper: draw footer without triggering new page
// const drawFooter = (doc, pageW, pageH, margin, contentW, DARK, GRAY, pageLabel) => {
//   doc.save();
//   doc.rect(0, pageH - 36, pageW, 36).fill(DARK);
//   doc.fillColor(GRAY).fontSize(8).font('Helvetica')
//     .text('Carbon Tracker  •  Sustainability Report', margin, pageH - 22, {
//       lineBreak: false,
//     });
//   doc.fillColor(GRAY).fontSize(8).font('Helvetica')
//     .text(pageLabel, pageW - margin - 60, pageH - 22, {
//       lineBreak: false,
//       width: 60,
//       align: 'right',
//     });
//   doc.restore();
// };

// const generatePdfReport = async (user, reportId, reportData, summary) => {
//   const reportsDir = path.join(__dirname, '..', 'reports');
//   await fs.promises.mkdir(reportsDir, { recursive: true });

//   const fileName = `report-${reportId}.pdf`;
//   const filePath = path.join(reportsDir, fileName);

//   const doc = new PDFDocument({ margin: 50, size: 'A4', autoFirstPage: true });
//   const stream = fs.createWriteStream(filePath);
//   doc.pipe(stream);

//   const GREEN  = '#1D9E75';
//   const DARK   = '#1a1a2e';
//   const GRAY   = '#6b7280';
//   const LGRAY  = '#f3f4f6';
//   const WHITE  = '#ffffff';
//   const ACCENT = '#e8f5f0';

//   const pageW    = doc.page.width;
//   const pageH    = doc.page.height;
//   const margin   = 50;
//   const contentW = pageW - margin * 2;

//   // ── PAGE 1: HEADER ───────────────────────────────────
//   doc.rect(0, 0, pageW, 110).fill(DARK);
//   doc.rect(0, 0, 6, 110).fill(GREEN);

//   doc.fillColor(WHITE).fontSize(22).font('Helvetica-Bold')
//     .text('Carbon Tracker', margin + 10, 28, { lineBreak: false });
//   doc.fillColor(GREEN).fontSize(11).font('Helvetica')
//     .text('Sustainability Report', margin + 10, 54, { lineBreak: false });

//   doc.fillColor(GREEN).fontSize(10).font('Helvetica-Bold')
//     .text(reportData.reportType.toUpperCase(), pageW - margin - 80, 38, {
//       width: 80, align: 'right', lineBreak: false,
//     });
//   doc.fillColor(GRAY).fontSize(9).font('Helvetica')
//     .text(`Generated: ${new Date().toDateString()}`, pageW - margin - 140, 54, {
//       width: 140, align: 'right', lineBreak: false,
//     });

//   // ── USER INFO CARD ───────────────────────────────────
//   doc.rect(margin, 128, contentW, 58).fill(ACCENT).stroke(GREEN);
//   doc.fillColor(DARK).fontSize(11).font('Helvetica-Bold')
//     .text(user.name, margin + 14, 140, { lineBreak: false });
//   doc.fillColor(GRAY).fontSize(9).font('Helvetica')
//     .text(user.email, margin + 14, 156, { lineBreak: false });
//   doc.fillColor(GRAY).fontSize(9)
//     .text(
//       `${reportData.periodStart.toDateString()}  to  ${reportData.periodEnd.toDateString()}`,
//       margin + 14, 172, { lineBreak: false }
//     );

//   // ── STATS BOXES ──────────────────────────────────────
//   const statsY = 210;
//   const boxW   = (contentW - 16) / 2;

//   doc.rect(margin, statsY, boxW, 72).fill(LGRAY);
//   doc.rect(margin, statsY, boxW, 4).fill(GREEN);
//   doc.fillColor(GRAY).fontSize(9).font('Helvetica')
//     .text('TOTAL CO2 EMITTED', margin + 12, statsY + 14, { lineBreak: false });
//   doc.fillColor(DARK).fontSize(24).font('Helvetica-Bold')
//     .text(`${summary.totalCarbonKg} kg`, margin + 12, statsY + 30, { lineBreak: false });

//   const box2X = margin + boxW + 16;
//   doc.rect(box2X, statsY, boxW, 72).fill(LGRAY);
//   doc.rect(box2X, statsY, boxW, 4).fill(GREEN);
//   doc.fillColor(GRAY).fontSize(9).font('Helvetica')
//     .text('TOTAL ACTIVITIES', box2X + 12, statsY + 14, { lineBreak: false });
//   doc.fillColor(DARK).fontSize(24).font('Helvetica-Bold')
//     .text(`${summary.activityCount}`, box2X + 12, statsY + 30, { lineBreak: false });

//   // ── EXECUTIVE SUMMARY ────────────────────────────────
//   const sumY = statsY + 90;
//   doc.fillColor(GREEN).fontSize(13).font('Helvetica-Bold')
//     .text('Executive Summary', margin, sumY, { lineBreak: false });
//   doc.rect(margin, sumY + 18, contentW, 1).fill(GREEN);

//   doc.fillColor(DARK).fontSize(10).font('Helvetica')
//     .text(
//       `During this period, you logged ${summary.activityCount} ${summary.activityCount === 1 ? 'activity' : 'activities'} ` +
//       `and emitted a total of ${summary.totalCarbonKg} kg CO2e. ` +
//       `Tracking your carbon footprint is the first step toward meaningful change. ` +
//       `Review the breakdown below to identify your biggest emission sources.`,
//       margin, sumY + 28, { width: contentW, lineGap: 4 }
//     );

//   // ── TOP CARBON SOURCES TABLE ─────────────────────────
//   const tableY = sumY + 95;
//   doc.fillColor(GREEN).fontSize(13).font('Helvetica-Bold')
//     .text('Top Carbon Sources', margin, tableY, { lineBreak: false });
//   doc.rect(margin, tableY + 18, contentW, 1).fill(GREEN);

//   if (summary.breakdown.length === 0) {
//     doc.fillColor(GRAY).fontSize(10).font('Helvetica')
//       .text('No activity data available for this period.', margin, tableY + 30);
//   } else {
//     const thY = tableY + 24;
//     doc.rect(margin, thY, contentW, 24).fill(DARK);
//     doc.fillColor(WHITE).fontSize(9).font('Helvetica-Bold')
//       .text('Activity Type',         margin + 12,  thY + 8, { lineBreak: false })
//       .text('Emissions (kg CO2e)',   margin + 200, thY + 8, { lineBreak: false })
//       .text('Activities',            margin + 360, thY + 8, { lineBreak: false })
//       .text('Share',                 margin + 450, thY + 8, { lineBreak: false });

//     const total = summary.totalCarbonKg || 1;
//     let rowY = thY + 24;

//     summary.breakdown.forEach((item, i) => {
//       doc.rect(margin, rowY, contentW, 26).fill(i % 2 === 0 ? WHITE : LGRAY);
//       if (i === 0) doc.rect(margin, rowY, 4, 26).fill(GREEN);

//       const pct    = ((item.carbonKg / total) * 100).toFixed(1);
//       const barW   = 55;
//       const filled = Math.max(4, (item.carbonKg / total) * barW);

//       doc.fillColor(DARK).fontSize(10).font('Helvetica')
//         .text(item.activityType,    margin + 12,  rowY + 8, { lineBreak: false })
//         .text(`${item.carbonKg}`,   margin + 200, rowY + 8, { lineBreak: false })
//         .text(`${item.count}`,      margin + 360, rowY + 8, { lineBreak: false });

//       doc.rect(margin + 440, rowY + 9, barW, 8).fill('#e5e7eb');
//       doc.rect(margin + 440, rowY + 9, filled, 8).fill(GREEN);
//       doc.fillColor(GRAY).fontSize(8)
//         .text(`${pct}%`, margin + 500, rowY + 9, { lineBreak: false });

//       rowY += 26;
//     });

//     doc.rect(margin, thY, contentW, rowY - thY).stroke('#d1d5db');
//   }

//   // ── FOOTER PAGE 1 ────────────────────────────────────
//   drawFooter(doc, pageW, pageH, margin, contentW, DARK, GRAY, 'Page 1 of 2');

//   // ══ PAGE 2: CERTIFICATE ══════════════════════════════
//   doc.addPage();

//   doc.rect(0, 0, pageW, 110).fill(DARK);
//   doc.rect(0, 0, 6, 110).fill(GREEN);
//   doc.fillColor(WHITE).fontSize(22).font('Helvetica-Bold')
//     .text('Carbon Tracker', margin + 10, 28, { lineBreak: false });
//   doc.fillColor(GREEN).fontSize(11).font('Helvetica')
//     .text('Sustainability Certificate', margin + 10, 54, { lineBreak: false });

//   // Certificate border
//   doc.rect(margin, 135, contentW, 345).lineWidth(1.5).stroke(GREEN);
//   doc.rect(margin + 4, 139, contentW - 8, 337).lineWidth(0.5).stroke('#a7f3d0');

//   doc.fillColor(GREEN).fontSize(11).font('Helvetica-Bold')
//     .text('THIS CERTIFICATE IS AWARDED TO', 0, 168, { align: 'center', lineBreak: false });

//   doc.fillColor(DARK).fontSize(26).font('Helvetica-Bold')
//     .text(user.name, 0, 192, { align: 'center', lineBreak: false });

//   doc.rect(margin + 60, 228, contentW - 120, 1).fill(GREEN);

//   doc.fillColor(GRAY).fontSize(10).font('Helvetica')
//     .text(
//       'For diligently tracking sustainability actions\nand measuring carbon impact using Carbon Tracker.',
//       0, 240, { align: 'center', lineGap: 4 }
//     );

//   // Cert stats
//   const cStatY = 290;
//   const cBoxW  = (contentW - 32) / 2;

//   doc.rect(margin + 12, cStatY, cBoxW, 65).fill(ACCENT);
//   doc.fillColor(GRAY).fontSize(9).font('Helvetica')
//     .text('Total Carbon Emitted', margin + 22, cStatY + 10, { lineBreak: false });
//   doc.fillColor(DARK).fontSize(20).font('Helvetica-Bold')
//     .text(`${summary.totalCarbonKg} kg`, margin + 22, cStatY + 28, { lineBreak: false });
//   doc.fillColor(GRAY).fontSize(8)
//     .text('CO2e', margin + 22, cStatY + 50, { lineBreak: false });

//   const cBox2X = margin + cBoxW + 20;
//   doc.rect(cBox2X, cStatY, cBoxW, 65).fill(ACCENT);
//   doc.fillColor(GRAY).fontSize(9).font('Helvetica')
//     .text('Activities Tracked', cBox2X + 10, cStatY + 10, { lineBreak: false });
//   doc.fillColor(DARK).fontSize(20).font('Helvetica-Bold')
//     .text(`${summary.activityCount}`, cBox2X + 10, cStatY + 28, { lineBreak: false });

//   doc.fillColor(GRAY).fontSize(9).font('Helvetica')
//     .text(
//       'Keep up the momentum by choosing low-carbon options\nand reducing emissions month over month.',
//       0, 378, { align: 'center', lineGap: 4 }
//     );

//   doc.fillColor(GRAY).fontSize(9)
//     .text(
//       `Period: ${reportData.periodStart.toDateString()} — ${reportData.periodEnd.toDateString()}`,
//       0, 425, { align: 'center', lineBreak: false }
//     );

//   // ── FOOTER PAGE 2 ────────────────────────────────────
//   drawFooter(doc, pageW, pageH, margin, contentW, DARK, GRAY, 'Page 2 of 2');

//   doc.end();

//   await new Promise((resolve, reject) => {
//     stream.on('finish', resolve);
//     stream.on('error', reject);
//   });

//   return filePath;
// };

// const createReport = async (req, res, next) => {
//   try {
//     const { reportType = 'monthly', title, description, customStart, customEnd } = req.body;
//     const { start, end } = customStart && customEnd
//       ? { start: new Date(customStart), end: new Date(customEnd) }
//       : getDateRange(reportType);

//     const summary = await buildReportSummary(req.user.id, start, end);
//     const reportTitle = title || `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Sustainability Report`;
//     const user = await User.findById(req.user.id);

//     const tempId = new mongoose.Types.ObjectId();
//     const reportData = { title: reportTitle, reportType, periodStart: start, periodEnd: end };
//     const filePath = await generatePdfReport(user, tempId, reportData, summary);

//     const report = await Report.create({
//       _id: tempId,
//       user: req.user.id,
//       title: reportTitle,
//       description: description || '',
//       reportType,
//       periodStart: start,
//       periodEnd: end,
//       totalCarbonKg: summary.totalCarbonKg,
//       activityCount: summary.activityCount,
//       pdfPath: filePath,
//     });

//     res.status(201).json({
//       reportId: report._id,
//       title: report.title,
//       totalCarbonKg: report.totalCarbonKg,
//       activityCount: report.activityCount,
//       periodStart: report.periodStart,
//       periodEnd: report.periodEnd,
//       downloadUrl: `/api/reports/download/${report._id}`,
//     });
//   } catch (error) {
//     console.error('REPORT CREATE ERROR:', error.message);
//     next(error);
//   }
// };

// const getReportHistory = async (req, res, next) => {
//   try {
//     const reports = await Report.find({ user: req.user.id }).sort({ createdAt: -1 });
//     res.json(reports.map((report) => ({
//       id: report._id,
//       title: report.title,
//       description: report.description,
//       reportType: report.reportType,
//       periodStart: report.periodStart,
//       periodEnd: report.periodEnd,
//       totalCarbonKg: report.totalCarbonKg,
//       activityCount: report.activityCount,
//       createdAt: report.createdAt,
//       emailSent: report.emailSent,
//       emailTo: report.emailTo,
//       emailSentAt: report.emailSentAt,
//       downloadUrl: `/api/reports/download/${report._id}`,
//     })));
//   } catch (error) {
//     next(error);
//   }
// };

// const downloadReport = async (req, res, next) => {
//   try {
//     const report = await Report.findById(req.params.id);
//     if (!report || report.user.toString() !== req.user.id) {
//       res.status(404);
//       throw new Error('Report not found');
//     }
//     if (!report.pdfPath || !fs.existsSync(report.pdfPath)) {
//       res.status(404);
//       throw new Error('Report file not found');
//     }
//     res.download(report.pdfPath, path.basename(report.pdfPath));
//   } catch (error) {
//     next(error);
//   }
// };

// const emailReport = async (req, res, next) => {
//   try {
//     const report = await Report.findById(req.params.id).populate('user');
//     if (!report || report.user._id.toString() !== req.user.id) {
//       res.status(404);
//       throw new Error('Report not found');
//     }
//     if (!report.pdfPath || !fs.existsSync(report.pdfPath)) {
//       res.status(404);
//       throw new Error('Report file not found');
//     }

//     const emailTo = req.body.email || report.user.email;
//     if (!emailTo) {
//       res.status(400);
//       throw new Error('Email address is required');
//     }

//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: Number(process.env.EMAIL_PORT) || 587,
//       secure: process.env.EMAIL_SECURE === 'true',
//       auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//       },
//     });

//     await transporter.sendMail({
//       from: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME,
//       to: emailTo,
//       subject: `Your Sustainability Report: ${report.title}`,
//       text: `Hi ${report.user.name},\n\nPlease find attached your sustainability report.\n\nBest,\nCarbon Tracker Team`,
//       attachments: [{ filename: path.basename(report.pdfPath), path: report.pdfPath }],
//     });

//     report.emailSent = true;
//     report.emailTo = emailTo;
//     report.emailSentAt = new Date();
//     await report.save();

//     res.json({ message: 'Report emailed successfully', emailTo });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   createReport,
//   getReportHistory,
//   downloadReport,
//   emailReport,
// };


const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Report = require('../models/Report');
const User = require('../models/User');

const getDateRange = (period) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  switch (period) {
    case 'today':  start.setHours(0, 0, 0, 0); break;
    case 'weekly': start.setDate(end.getDate() - 6); start.setHours(0, 0, 0, 0); break;
    case 'monthly': start.setDate(end.getDate() - 29); start.setHours(0, 0, 0, 0); break;
    default: start.setDate(end.getDate() - 29); start.setHours(0, 0, 0, 0); break;
  }
  return { start, end };
};

const buildReportSummary = async (userId, start, end) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const endInclusive = new Date(end);
  endInclusive.setHours(23, 59, 59, 999);

  const totalStats = await Activity.aggregate([
    { $match: { user: userObjectId, date: { $gte: start, $lte: endInclusive } } },
    { $group: { _id: null, totalCarbonKg: { $sum: '$carbonEmissionKg' }, activityCount: { $sum: 1 } } },
  ]);

  const breakdown = await Activity.aggregate([
    { $match: { user: userObjectId, date: { $gte: start, $lte: endInclusive } } },
    { $group: { _id: '$activityType', carbonKg: { $sum: '$carbonEmissionKg' }, count: { $sum: 1 } } },
    { $sort: { carbonKg: -1 } },
  ]);

  return {
    totalCarbonKg: Number((totalStats[0]?.totalCarbonKg || 0).toFixed(3)),
    activityCount: totalStats[0]?.activityCount || 0,
    breakdown: breakdown.map((item) => ({
      activityType: item._id,
      carbonKg: Number(item.carbonKg.toFixed(3)),
      count: item.count,
    })),
  };
};

const generatePdfReport = async (user, reportId, reportData, summary) => {
  const reportsDir = path.join(__dirname, '..', 'reports');
  await fs.promises.mkdir(reportsDir, { recursive: true });

  const fileName = `report-${reportId}.pdf`;
  const filePath = path.join(reportsDir, fileName);

  // buffered:true is key — lets us use switchToPage after addPage
  const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const GREEN  = '#1D9E75';
  const DARK   = '#1a1a2e';
  const GRAY   = '#6b7280';
  const LGRAY  = '#f3f4f6';
  const WHITE  = '#ffffff';
  const ACCENT = '#e8f5f0';

  const pageW    = doc.page.width;
  const pageH    = doc.page.height;
  const margin   = 50;
  const contentW = pageW - margin * 2;

  // ── PAGE 1 CONTENT ───────────────────────────────────
  doc.rect(0, 0, pageW, 110).fill(DARK);
  doc.rect(0, 0, 6, 110).fill(GREEN);
  doc.fillColor(WHITE).fontSize(22).font('Helvetica-Bold')
    .text('Carbon Tracker', margin + 10, 28, { lineBreak: false });
  doc.fillColor(GREEN).fontSize(11).font('Helvetica')
    .text('Sustainability Report', margin + 10, 54, { lineBreak: false });
  doc.fillColor(GREEN).fontSize(10).font('Helvetica-Bold')
    .text(reportData.reportType.toUpperCase(), pageW - margin - 80, 38, { width: 80, align: 'right', lineBreak: false });
  doc.fillColor(GRAY).fontSize(9).font('Helvetica')
    .text(`Generated: ${new Date().toDateString()}`, pageW - margin - 140, 54, { width: 140, align: 'right', lineBreak: false });

  doc.rect(margin, 128, contentW, 58).fill(ACCENT).stroke(GREEN);
  doc.fillColor(DARK).fontSize(11).font('Helvetica-Bold')
    .text(user.name, margin + 14, 140, { lineBreak: false });
  doc.fillColor(GRAY).fontSize(9).font('Helvetica')
    .text(user.email, margin + 14, 156, { lineBreak: false });
  doc.fillColor(GRAY).fontSize(9)
    .text(`${reportData.periodStart.toDateString()}  to  ${reportData.periodEnd.toDateString()}`, margin + 14, 172, { lineBreak: false });

  const statsY = 210;
  const boxW   = (contentW - 16) / 2;
  doc.rect(margin, statsY, boxW, 72).fill(LGRAY);
  doc.rect(margin, statsY, boxW, 4).fill(GREEN);
  doc.fillColor(GRAY).fontSize(9).font('Helvetica')
    .text('TOTAL CO2 EMITTED', margin + 12, statsY + 14, { lineBreak: false });
  doc.fillColor(DARK).fontSize(24).font('Helvetica-Bold')
    .text(`${summary.totalCarbonKg} kg`, margin + 12, statsY + 30, { lineBreak: false });

  const box2X = margin + boxW + 16;
  doc.rect(box2X, statsY, boxW, 72).fill(LGRAY);
  doc.rect(box2X, statsY, boxW, 4).fill(GREEN);
  doc.fillColor(GRAY).fontSize(9).font('Helvetica')
    .text('TOTAL ACTIVITIES', box2X + 12, statsY + 14, { lineBreak: false });
  doc.fillColor(DARK).fontSize(24).font('Helvetica-Bold')
    .text(`${summary.activityCount}`, box2X + 12, statsY + 30, { lineBreak: false });

  const sumY = statsY + 90;
  doc.fillColor(GREEN).fontSize(13).font('Helvetica-Bold')
    .text('Executive Summary', margin, sumY, { lineBreak: false });
  doc.rect(margin, sumY + 18, contentW, 1).fill(GREEN);
  doc.fillColor(DARK).fontSize(10).font('Helvetica')
    .text(
      `During this period, you logged ${summary.activityCount} ${summary.activityCount === 1 ? 'activity' : 'activities'} ` +
      `and emitted a total of ${summary.totalCarbonKg} kg CO2e. ` +
      `Tracking your carbon footprint is the first step toward meaningful change. ` +
      `Review the breakdown below to identify your biggest emission sources.`,
      margin, sumY + 28, { width: contentW, lineGap: 4 }
    );

  const tableY = sumY + 95;
  doc.fillColor(GREEN).fontSize(13).font('Helvetica-Bold')
    .text('Top Carbon Sources', margin, tableY, { lineBreak: false });
  doc.rect(margin, tableY + 18, contentW, 1).fill(GREEN);

  if (summary.breakdown.length === 0) {
    doc.fillColor(GRAY).fontSize(10).font('Helvetica')
      .text('No activity data available for this period.', margin, tableY + 30, { lineBreak: false });
  } else {
    const thY = tableY + 24;
    doc.rect(margin, thY, contentW, 24).fill(DARK);
    doc.fillColor(WHITE).fontSize(9).font('Helvetica-Bold')
      .text('Activity Type',       margin + 12,  thY + 8, { lineBreak: false })
      .text('Emissions (kg CO2e)', margin + 200, thY + 8, { lineBreak: false })
      .text('Activities',          margin + 360, thY + 8, { lineBreak: false })
      .text('Share',               margin + 450, thY + 8, { lineBreak: false });

    const total = summary.totalCarbonKg || 1;
    let rowY = thY + 24;
    summary.breakdown.forEach((item, i) => {
      doc.rect(margin, rowY, contentW, 26).fill(i % 2 === 0 ? WHITE : LGRAY);
      if (i === 0) doc.rect(margin, rowY, 4, 26).fill(GREEN);
      const pct    = ((item.carbonKg / total) * 100).toFixed(1);
      const barW   = 55;
      const filled = Math.max(4, (item.carbonKg / total) * barW);
      doc.fillColor(DARK).fontSize(10).font('Helvetica')
        .text(item.activityType,  margin + 12,  rowY + 8, { lineBreak: false })
        .text(`${item.carbonKg}`, margin + 200, rowY + 8, { lineBreak: false })
        .text(`${item.count}`,    margin + 360, rowY + 8, { lineBreak: false });
      doc.rect(margin + 440, rowY + 9, barW, 8).fill('#e5e7eb');
      doc.rect(margin + 440, rowY + 9, filled, 8).fill(GREEN);
      doc.fillColor(GRAY).fontSize(8)
        .text(`${pct}%`, margin + 500, rowY + 9, { lineBreak: false });
      rowY += 26;
    });
    doc.rect(margin, thY, contentW, rowY - thY).stroke('#d1d5db');
  }

  // ── PAGE 2 CONTENT ───────────────────────────────────
  doc.addPage();

  doc.rect(0, 0, pageW, 110).fill(DARK);
  doc.rect(0, 0, 6, 110).fill(GREEN);
  doc.fillColor(WHITE).fontSize(22).font('Helvetica-Bold')
    .text('Carbon Tracker', margin + 10, 28, { lineBreak: false });
  doc.fillColor(GREEN).fontSize(11).font('Helvetica')
    .text('Sustainability Certificate', margin + 10, 54, { lineBreak: false });

  doc.rect(margin, 135, contentW, 345).lineWidth(1.5).stroke(GREEN);
  doc.rect(margin + 4, 139, contentW - 8, 337).lineWidth(0.5).stroke('#a7f3d0');

  doc.fillColor(GREEN).fontSize(11).font('Helvetica-Bold')
    .text('THIS CERTIFICATE IS AWARDED TO', 0, 168, { align: 'center', lineBreak: false });
  doc.fillColor(DARK).fontSize(26).font('Helvetica-Bold')
    .text(user.name, 0, 192, { align: 'center', lineBreak: false });
  doc.rect(margin + 60, 228, contentW - 120, 1).fill(GREEN);
  doc.fillColor(GRAY).fontSize(10).font('Helvetica')
    .text(
      'For diligently tracking sustainability actions\nand measuring carbon impact using Carbon Tracker.',
      0, 240, { align: 'center', lineGap: 4 }
    );

  const cStatY = 290;
  const cBoxW  = (contentW - 32) / 2;
  doc.rect(margin + 12, cStatY, cBoxW, 65).fill(ACCENT);
  doc.fillColor(GRAY).fontSize(9).font('Helvetica')
    .text('Total Carbon Emitted', margin + 22, cStatY + 10, { lineBreak: false });
  doc.fillColor(DARK).fontSize(20).font('Helvetica-Bold')
    .text(`${summary.totalCarbonKg} kg`, margin + 22, cStatY + 28, { lineBreak: false });
  doc.fillColor(GRAY).fontSize(8)
    .text('CO2e', margin + 22, cStatY + 50, { lineBreak: false });

  const cBox2X = margin + cBoxW + 20;
  doc.rect(cBox2X, cStatY, cBoxW, 65).fill(ACCENT);
  doc.fillColor(GRAY).fontSize(9).font('Helvetica')
    .text('Activities Tracked', cBox2X + 10, cStatY + 10, { lineBreak: false });
  doc.fillColor(DARK).fontSize(20).font('Helvetica-Bold')
    .text(`${summary.activityCount}`, cBox2X + 10, cStatY + 28, { lineBreak: false });

  doc.fillColor(GRAY).fontSize(9).font('Helvetica')
    .text(
      'Keep up the momentum by choosing low-carbon options\nand reducing emissions month over month.',
      0, 378, { align: 'center', lineGap: 4 }
    );
  doc.fillColor(GRAY).fontSize(9)
    .text(
      `Period: ${reportData.periodStart.toDateString()} - ${reportData.periodEnd.toDateString()}`,
      0, 425, { align: 'center', lineBreak: false }
    );

  // ── FOOTERS — switchToPage taaki naye page na bane ───
  const totalPages = doc.bufferedPageRange().count;

  // Page 1 footer
  doc.switchToPage(0);
  doc.rect(0, pageH - 36, pageW, 36).fill(DARK);
  doc.fillColor(GRAY).fontSize(8).font('Helvetica')
    .text('Carbon Tracker  •  Sustainability Report', margin, pageH - 22, { lineBreak: false });
  doc.fillColor(GRAY).fontSize(8)
    .text('Page 1 of 2', pageW - margin - 55, pageH - 22, { lineBreak: false });

  // Page 2 footer
  doc.switchToPage(1);
  doc.rect(0, pageH - 36, pageW, 36).fill(DARK);
  doc.fillColor(GRAY).fontSize(8).font('Helvetica')
    .text('Carbon Tracker  •  Sustainability Report', margin, pageH - 22, { lineBreak: false });
  doc.fillColor(GRAY).fontSize(8)
    .text('Page 2 of 2', pageW - margin - 55, pageH - 22, { lineBreak: false });

  doc.flushPages();
  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return filePath;
};

const createReport = async (req, res, next) => {
  try {
    const { reportType = 'monthly', title, description, customStart, customEnd } = req.body;
    const { start, end } = customStart && customEnd
      ? { start: new Date(customStart), end: new Date(customEnd) }
      : getDateRange(reportType);

    const summary = await buildReportSummary(req.user.id, start, end);
    const reportTitle = title || `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Sustainability Report`;
    const user = await User.findById(req.user.id);

    const tempId = new mongoose.Types.ObjectId();
    const reportData = { title: reportTitle, reportType, periodStart: start, periodEnd: end };
    const filePath = await generatePdfReport(user, tempId, reportData, summary);

    const report = await Report.create({
      _id: tempId,
      user: req.user.id,
      title: reportTitle,
      description: description || '',
      reportType,
      periodStart: start,
      periodEnd: end,
      totalCarbonKg: summary.totalCarbonKg,
      activityCount: summary.activityCount,
      pdfPath: filePath,
    });

    res.status(201).json({
      reportId: report._id,
      title: report.title,
      totalCarbonKg: report.totalCarbonKg,
      activityCount: report.activityCount,
      periodStart: report.periodStart,
      periodEnd: report.periodEnd,
      downloadUrl: `/api/reports/download/${report._id}`,
    });
  } catch (error) {
    console.error('REPORT CREATE ERROR:', error.message);
    next(error);
  }
};

const getReportHistory = async (req, res, next) => {
  try {
    const reports = await Report.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(reports.map((report) => ({
      id: report._id,
      title: report.title,
      description: report.description,
      reportType: report.reportType,
      periodStart: report.periodStart,
      periodEnd: report.periodEnd,
      totalCarbonKg: report.totalCarbonKg,
      activityCount: report.activityCount,
      createdAt: report.createdAt,
      emailSent: report.emailSent,
      emailTo: report.emailTo,
      emailSentAt: report.emailSentAt,
      downloadUrl: `/api/reports/download/${report._id}`,
    })));
  } catch (error) {
    next(error);
  }
};

const downloadReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report || report.user.toString() !== req.user.id) {
      res.status(404);
      throw new Error('Report not found');
    }
    if (!report.pdfPath || !fs.existsSync(report.pdfPath)) {
      res.status(404);
      throw new Error('Report file not found');
    }
    res.download(report.pdfPath, path.basename(report.pdfPath));
  } catch (error) {
    next(error);
  }
};

const emailReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate('user');
    if (!report || report.user._id.toString() !== req.user.id) {
      res.status(404);
      throw new Error('Report not found');
    }
    if (!report.pdfPath || !fs.existsSync(report.pdfPath)) {
      res.status(404);
      throw new Error('Report file not found');
    }
    const emailTo = req.body.email || report.user.email;
    if (!emailTo) {
      res.status(400);
      throw new Error('Email address is required');
    }
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user: process.env.EMAIL_USERNAME, pass: process.env.EMAIL_PASSWORD },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME,
      to: emailTo,
      subject: `Your Sustainability Report: ${report.title}`,
      text: `Hi ${report.user.name},\n\nPlease find attached your sustainability report.\n\nBest,\nCarbon Tracker Team`,
      attachments: [{ filename: path.basename(report.pdfPath), path: report.pdfPath }],
    });
    report.emailSent = true;
    report.emailTo = emailTo;
    report.emailSentAt = new Date();
    await report.save();
    res.json({ message: 'Report emailed successfully', emailTo });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReport, getReportHistory, downloadReport, emailReport };

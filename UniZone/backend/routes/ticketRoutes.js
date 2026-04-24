const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Get all tickets (admin only)
router.get('/', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Raise a ticket (student)
router.post('/', authenticate, async (req, res) => {
  try {
    const { eventId, eventTitle, name, email, phone } = req.body;

    // Check if ticket already raised for this event
    const existing = await Ticket.findOne({ eventId, email });
    if (existing) {
      return res.status(400).json({ message: "You have already raised a ticket for this event" });
    }

    const ticket = await Ticket.create({ eventId, eventTitle, name, email, phone });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Confirm a ticket (admin) - sends email to student
router.put('/:id/confirm', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed' },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // Send confirmation email to student
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: ticket.email,
      subject: `🎟️ Your Event Ticket Confirmed - ${ticket.eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #0a0f2c, #0d1b4b); padding: 30px; border-radius: 12px; text-align: center;">
            <h1 style="color: white; margin: 0;">🎟️ Ticket Confirmed!</h1>
            <p style="color: #93c5fd; margin-top: 8px;">UniZone Event Management</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 12px; margin-top: 16px;">
            <p style="font-size: 16px; color: #333;">Dear <strong>${ticket.name}</strong>,</p>
            <p style="color: #555;">Your ticket for the following event has been <strong style="color: green;">confirmed</strong>!</p>
            <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1e40af;">📅 ${ticket.eventTitle}</p>
              <p style="margin: 8px 0 0; color: #555;">Ticket ID: <strong>#${ticket._id.toString().slice(-6).toUpperCase()}</strong></p>
            </div>
            <p style="color: #555;">Details:</p>
            <ul style="color: #555;">
              <li>Name: ${ticket.name}</li>
              <li>Email: ${ticket.email}</li>
              <li>Phone: ${ticket.phone}</li>
            </ul>
            <p style="color: #888; font-size: 14px; margin-top: 20px;">Please bring this email as proof of your registration.</p>
          </div>
          <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 16px;">UniZone University Platform</p>
        </div>
      `
    };

    /*await transporter.sendMail(mailOptions);
    res.json({ message: 'Ticket confirmed and email sent!', ticket });*/
    const info = await transporter.sendMail(mailOptions);
console.log('Email sent:', info.response);
res.json({ message: 'Ticket confirmed and email sent!', ticket });
  } catch (error) {
    
    console.error('Confirm ticket error:', error);

  
    res.status(500).json({ message: error.message });
  }
});
// Test email route
router.get('/test-email', async (req, res) => {
  try {
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test Email',
      text: 'Email is working!'
    });
    console.log('Test email sent:', info.response);
    res.json({ message: 'Email sent!', response: info.response });
  } catch (error) {
    console.error('Test email error:', error.message);
    res.json({ error: error.message });
  }
});

module.exports = router;


const Equipment = require('../models/Equipment');
const EquipmentBooking = require('../models/EquipmentBooking');

// --- Equipment Management (Admin) ---

// ADD new equipment
exports.addEquipment = async (req, res) => {
  try {
    const { name, sportCategory, totalQuantity, description } = req.body;
    
    // Check if equipment already exists
    const existing = await Equipment.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Equipment with this name already exists' });
    }

    const newEquipment = await Equipment.create({
      name,
      sportCategory,
      totalQuantity,
      availableQuantity: totalQuantity, // initially all available
      description
    });

    res.status(201).json(newEquipment);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to add equipment' });
  }
};

// GET all equipment
exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find().sort({ createdAt: -1 });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch equipment' });
  }
};

// EDIT equipment
exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sportCategory, totalQuantity, description } = req.body;
    
    const equipment = await Equipment.findById(id);
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });

    // Calculate new available quantity based on the change in total
    const difference = totalQuantity - equipment.totalQuantity;
    const newAvailable = equipment.availableQuantity + difference;

    if (newAvailable < 0) {
      return res.status(400).json({ message: 'Cannot reduce total quantity below currently booked amount' });
    }

    const updated = await Equipment.findByIdAndUpdate(
      id,
      {
        name,
        sportCategory,
        totalQuantity,
        availableQuantity: newAvailable,
        description
      },
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update equipment' });
  }
};

// DELETE equipment
exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Optional: Check if there are active bookings
    const activeBookings = await EquipmentBooking.findOne({
      equipment: id,
      status: { $in: ['Pending', 'Approved'] }
    });
    if (activeBookings) {
      return res.status(400).json({ message: 'Cannot delete equipment with active or pending bookings' });
    }

    const deleted = await Equipment.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Equipment not found' });
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete equipment' });
  }
};

// --- Booking Management ---

// CREATE a booking (Student)
exports.createBooking = async (req, res) => {
  try {
    const { equipmentId, quantity, bookingDate, pickupTime, returnDate, returnTime, notes } = req.body;

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });

    if (equipment.availableQuantity < quantity) {
      return res.status(400).json({ message: 'Not enough equipment available' });
    }

    const newBooking = await EquipmentBooking.create({
      user: req.user._id,
      equipment: equipmentId,
      quantity,
      bookingDate,
      pickupTime,
      returnDate,
      returnTime,
      notes,
      status: 'Pending'
    });

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create booking' });
  }
};

// GET all bookings (Admin/Staff)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await EquipmentBooking.find()
      .populate('user', 'name email studentId')
      .populate('equipment', 'name sportCategory')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// GET my bookings (Student)
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await EquipmentBooking.find({ user: req.user._id })
      .populate('equipment', 'name sportCategory')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your bookings' });
  }
};

// UPDATE booking status (Admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Pending, Approved, Rejected, Returned

    const booking = await EquipmentBooking.findById(id).populate('equipment');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const equip = await Equipment.findById(booking.equipment._id);
    if (!equip) return res.status(404).json({ message: 'Associated equipment not found' });

    // Handle state transitions
    if (status === 'Approved' && booking.status !== 'Approved') {
      // Approving: deduct stock
      if (equip.availableQuantity < booking.quantity) {
        return res.status(400).json({ message: 'Not enough stock to approve this booking' });
      }
      equip.availableQuantity -= booking.quantity;
      await equip.save();
    } else if (status === 'Returned' && booking.status === 'Approved') {
      // Returning: restore stock
      equip.availableQuantity += booking.quantity;
      await equip.save();
    } else if (status === 'Rejected' && booking.status === 'Approved') {
      // Rejecting an already approved booking: restore stock
      equip.availableQuantity += booking.quantity;
      await equip.save();
    } // Other transitions (e.g., Pending -> Rejected) require no stock change.

    booking.status = status;
    const updated = await booking.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update booking status' });
  }
};

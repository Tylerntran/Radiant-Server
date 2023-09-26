import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Service from "../models/Service.js";
import { sendSMS } from "../utility/sms.js";

/* CREATE */
//WORKING FOR STRAIGHTFORWARD CASES
export const scheduleAppointment = async (req, res) => {
  try {
    const { services, length, date, time, notes } = req.body;
    const { userId } = req.params;

    //front end will deal with the scheduling date and time
    const user = await User.findById(userId);
    const phone = user.phoneNumber;
    const email = user.email;

    const newAppointment = new Appointment({
      userId,
      phoneNumber: phone,
      email: email,
      services,
      length,
      date,
      time,
      notes,
      status: "Waiting for approval",
    });
    const savedAppointment = await newAppointment.save();

    user.appointments.push(savedAppointment);
    await user.save();

    //add to service booking

    for (let i = 0; i < services.length; i++) {
      const service = await Service.findById(services[i]);
      service.bookings.push(date);
      await service.save();
    }

    res.status(201).json(savedAppointment);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const noLoginAppointment = async (req, res) => {
  try {
    const { name, phoneNumber, services, length, date, time, notes } = req.body;

    const newAppointment = new Appointment({
      userId: name,
      phoneNumber,
      services,
      length,
      date,
      time,
      notes,
      status: "Waiting for approval",
    });
    const savedAppointment = await newAppointment.save();
    //generate a jwt token containing appointment ID -> skip for now
    //we can exclude email for the time being
    //send out an email

    for (let i = 0; i < services.length; i++) {
      const service = await Service.findById(services[i]);
      service.bookings.push(date);
      await service.save();
    }
    const message = `Thank you for booking an appointment with Radiant Nails for ${time} on ${date}. Please call ---------- to cancel or change your appointment.`;
    // Using request
    sendSMS("8018951204", message);

    res.status(201).json(savedAppointment);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* READ */
export const getAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    res.status(200).json(appointment);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getServices = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    const services = await Promise.all(
      appointment.services.map((id) => Service.findById(id))
    );
    const formattedService = services.map(
      ({ _id, user, services, estimatedTime, date, time, notes, status }) => {
        return {
          _id,
          user,
          services,
          estimatedTime,
          date,
          time,
          notes,
          status,
        };
      }
    );
    res.status(200).json(formattedService);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const appointment = await Appointment.find();
    res.status(200).json(appointment);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getAppointmentsPage = async (req, res) => {
  try {
    // sort: { "field": "userId", "sort: "desc"}
    const { page = 1, pageSize = 20, sort = null, search = "" } = req.query;
    //const appointment = await Appointment.find();

    const generateSort = () => {
      const sortParsed = JSON.parse(sort);
      const sortFormatted = {
        [sortParsed.field]: (sortParsed.sort = "asc" ? 1 : -1),
      };
      return sortFormatted;
    };
    //check if sort exists, then sort or do nothing
    const sortFormatted = Boolean(sort) ? generateSort() : {};

    //
    const appointments = await Appointment.find({
      $or: [
        { name: { $regex: new RegExp(search, "i") } },
        { phoneNumber: { $regex: new RegExp(search, "i") } },
      ],
    })
      .sort(sortFormatted)
      .skip(page * pageSize)
      .limit(pageSize);

    const total = await Appointment.countDocuments({
      name: { $regex: search, $options: "i" },
    });

    res.status(200).json({ appointments, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE */
//only able to change the time and services, which are handled in frontend
export const changeAppointment = async (req, res) => {
  try {
    const { services, length, date, time, notes, status } = req.body;
    //take new time and update it
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.status(200).json(appointment);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//change only the status
export const changeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    appointment.status = status;

    await appointment.save();

    res.status(200).json(appointment);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* DELETE */
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id);

    res.status(200).json(appointment);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

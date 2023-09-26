import Appointment from "../models/Appointment.js";
import Service from "../models/Service.js";
import User from "../models/User.js";

/* READ */
export const getService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    res.status(200).json(service);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//categories including nails, eyebrows, waxing
export const getServiceByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    const appointments = await Promise.all(
      user.appointments.map((id) => Appointment.findById(id))
    );
    const formattedAppointment = appointments.map(
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
    res.status(200).json(formattedAppointment);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//query by keywords to display in front end
//look at name and category
export const getServiceByKeyword = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    res.status(200).json(service);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//CREATE SERVICE
export const newService = async (req, res) => {
  try {
    const { serviceName, cost, length, info } = req.body;

    const newService = new Service({
      serviceName,
      cost,
      length,
      info,
    });
    const savedService = await newService.save();

    res.status(201).json(savedService);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// //ADD BOOKING DATE TO SERVICE
// export const addBooking = async (req, res) => {
//   try {
//     const { date } = req.body;
//     const { serviceId } = req.params;

//     const service = await Service.findById(serviceId);
//     service.bookings.push(date);
//     await service.save();

//     res.status(200).json(service);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

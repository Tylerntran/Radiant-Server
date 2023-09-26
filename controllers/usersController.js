import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getAppointments = async (req, res) => {
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

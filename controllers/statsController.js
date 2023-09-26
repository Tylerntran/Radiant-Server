import Appointment from "../models/Appointment.js";
import Service from "../models/Service.js";

//gets main information for today
export const getDashboardStats = async (req, res) => {
  try {
    //get current date
    let date = new Date();
    const currentMonth = ("0" + (date.getMonth() + 1)).slice(-2);
    const currentYear = date.getFullYear();
    const currentDay = ("0" + date.getDate()).slice(-2);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    //todays appointments data grid
    const appointmentsToday = await Appointment.find({ date: currentDay });

    //top services of this month based on number of bookings

    //total appointments booked
    const query = {
      date: {
        $gte: firstDay,
        $lt: lastDay,
      },
    };
    const numMonthAppointments = await Appointment.countDocuments(query);

    //service bar graph

    //calendar on the side??

    res.status(200).json({
      revenue,
    });
  } catch (err) {
    res.status(500).json({ message: err.essage });
  }
};

export const availability = async (req, res) => {
  try {
    //returns all availability of time
    const appointments = await Appointment.find();

    const bookedSlots = appointments.map((appointment) => {
      const { _id, userId, date, time, length } = appointment;

      const dateObj = new Date(date);

      // Calculate start time
      const startTime = new Date(
        dateObj.setHours(time.split(":")[0], time.split(":")[1])
      );
      const endTime = new Date(startTime.getTime() + length * 60000);

      return {
        id: _id,
        title: userId,
        start: startTime,
        end: endTime,
      };
    });

    //sort
    bookedSlots.sort((a, b) => {
      return a.start - b.start;
    });

    res.status(200).json(bookedSlots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//outputs serviceName,bookingcount and revenue for top 5 based on no bookings
export const topServices = async (req, res) => {
  try {
    const currentDate = new Date();
    const topServices = await Service.aggregate([
      {
        $unwind: "$bookings",
      },
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: [
                  { $month: { $toDate: "$bookings" } },
                  { $month: { $toDate: currentDate } },
                ],
              },
              {
                $eq: [
                  { $year: { $toDate: "$bookings" } },
                  { $year: { $toDate: currentDate } },
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          serviceName: { $first: "$serviceName" },

          bookingCountMonth: {
            $sum: {
              $cond: [
                // booking is this month
                {
                  $eq: [
                    { $month: { $toDate: "$bookings" } },
                    { $month: currentDate },
                  ],
                },
                1,
                0,
              ],
            },
          },

          bookingCountYear: {
            $sum: {
              $cond: [
                // booking is this year
                {
                  $eq: [
                    { $year: { $toDate: "$bookings" } },
                    { $year: currentDate },
                  ],
                },
                1,
                0,
              ],
            },
          },

          revenueMonth: {
            $sum: {
              $cond: [
                // booking is this month
                {
                  $eq: [
                    { $month: { $toDate: "$bookings" } },
                    { $month: currentDate },
                  ],
                },
                "$cost",
                0,
              ],
            },
          },

          revenueYear: {
            $sum: {
              $cond: [
                // booking is this year
                {
                  $eq: [
                    { $year: { $toDate: "$bookings" } },
                    { $year: currentDate },
                  ],
                },
                "$cost",
                0,
              ],
            },
          },
        },
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json(topServices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//outputs number of appointments within the year, or total revenue
export const overview = async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const prevYear = currentYear - 1;
    const prevMonths = now.getMonth() - 11;

    const revenueData = await Service.aggregate([
      { $unwind: "$bookings" },

      {
        $project: {
          year: { $year: { $toDate: "$bookings" } },
          month: { $month: { $toDate: "$bookings" } },
          revenue: { $multiply: ["$cost", 1] },
        },
      },

      {
        $match: {
          $or: [
            {
              year: prevYear,
              month: { $gte: now.getMonth() + 1 },
            },
            {
              year: currentYear,
              month: { $lte: now.getMonth() + 1 },
            },
          ],
        },
      },

      {
        $group: {
          _id: {
            monthDate: "$year" + "$month",
            year: "$year",
            month: "$month",
          },

          revenue: { $sum: "$revenue" },
        },
      },

      {
        $project: {
          _id: 0,
          monthDate: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: 1,
            },
          },
          monthYear: {
            $concat: [
              {
                $switch: {
                  branches: [
                    { case: { $eq: ["$_id.month", 1] }, then: "Jan" },
                    { case: { $eq: ["$_id.month", 2] }, then: "Feb" },
                    { case: { $eq: ["$_id.month", 3] }, then: "Mar" },
                    { case: { $eq: ["$_id.month", 4] }, then: "Apr" },
                    { case: { $eq: ["$_id.month", 5] }, then: "May" },
                    { case: { $eq: ["$_id.month", 6] }, then: "June" },
                    { case: { $eq: ["$_id.month", 7] }, then: "July" },
                    { case: { $eq: ["$_id.month", 8] }, then: "Aug" },
                    { case: { $eq: ["$_id.month", 9] }, then: "Sep" },
                    { case: { $eq: ["$_id.month", 10] }, then: "Oct" },
                    { case: { $eq: ["$_id.month", 11] }, then: "Nov" },
                    { case: { $eq: ["$_id.month", 12] }, then: "Dec" },
                    //...cases for all months
                  ],
                  default: "Invalid Month",
                },
              },

              "'",

              { $toString: { $substr: ["$_id.year", 2, 2] } },
            ],
          },

          revenue: 1,
        },
      },

      {
        $sort: {
          monthDate: 1,
        },
      },

      {
        $group: {
          _id: 1,
          monthlyData: { $push: "$$ROOT" },
        },
      },
    ]);

    const appointmentData = await Appointment.aggregate([
      {
        $project: {
          year: { $year: { $toDate: "$date" } },
          month: { $month: { $toDate: "$date" } },
        },
      },

      {
        $match: {
          $or: [
            {
              year: prevYear,
              month: { $gte: now.getMonth() + 1 },
            },
            {
              year: currentYear,
              month: { $lte: now.getMonth() + 1 },
            },
          ],
        },
      },

      {
        $group: {
          _id: {
            monthDate: "$year" + "$month",
            year: "$year",
            month: "$month",
          },

          appointmentCount: { $sum: 1 },
        },
      },

      {
        $project: {
          _id: 0,
          monthDate: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: 1,
            },
          },
          monthYear: {
            $concat: [
              {
                $switch: {
                  branches: [
                    { case: { $eq: ["$_id.month", 1] }, then: "Jan" },
                    { case: { $eq: ["$_id.month", 2] }, then: "Feb" },
                    { case: { $eq: ["$_id.month", 3] }, then: "Mar" },
                    { case: { $eq: ["$_id.month", 4] }, then: "Apr" },
                    { case: { $eq: ["$_id.month", 5] }, then: "May" },
                    { case: { $eq: ["$_id.month", 6] }, then: "June" },
                    { case: { $eq: ["$_id.month", 7] }, then: "July" },
                    { case: { $eq: ["$_id.month", 8] }, then: "Aug" },
                    { case: { $eq: ["$_id.month", 9] }, then: "Sep" },
                    { case: { $eq: ["$_id.month", 10] }, then: "Oct" },
                    { case: { $eq: ["$_id.month", 11] }, then: "Nov" },
                    { case: { $eq: ["$_id.month", 12] }, then: "Dec" },
                    //...cases for all months
                  ],
                  default: "Invalid Month",
                },
              },

              "'",

              { $toString: { $substr: ["$_id.year", 2, 2] } },
            ],
          },

          appointmentCount: 1,
        },
      },

      {
        $sort: {
          monthDate: 1,
        },
      },

      {
        $group: {
          _id: 1,
          monthlyData: { $push: "$$ROOT" },
        },
      },
    ]);

    const combined = [];

    revenueData[0].monthlyData.forEach((rev) => {
      const appointment = appointmentData[0].monthlyData.find(
        (appt) => appt.monthYear === rev.monthYear
      );

      if (appointment) {
        combined.push({
          monthYear: rev.monthYear,
          revenue: rev.revenue,
          appointments: appointment.appointmentCount,
        });
      } else {
        // Handle missing appointment
        combined.push({
          ...rev,
          appointments: 0,
        });
      }
    });

    const result = {
      monthlyData: combined,
      totalRevenue: combined.reduce((total, m) => total + m.revenue, 0),
      totalAppointments: combined.reduce(
        (total, m) => total + m.appointments,
        0
      ),
    };

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

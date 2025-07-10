import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Clocking } from "../models/clockSummaryModel";
import { BadRequestError } from "../errors/badRequest-error";
import dayjs from "dayjs";
import cron from "node-cron";

// Clock In Logic
const clockIn = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check if the user is already clocked in
    const existingClocking = await Clocking.findOne({ employeeId: id });

    if (existingClocking) {
        // If the user is already clocked in, return an error message
        const lastClockRecord =
            existingClocking.clockRecords[existingClocking.clockRecords.length - 1];
        if (!lastClockRecord.clockOutTime) {
            throw new BadRequestError("You are already clocked in.");
        }
    }

    // If the user is not clocked in, create a new clock-in record
    const clockInRecord = {
        clockInTime: new Date(),
        clockOutTime: null, // Initially set to null
        totalHours: 0, // Initially set to 0
    };

    if (existingClocking) {
        // Add new clock-in record to the array of clockRecords
        existingClocking.clockRecords.push(clockInRecord);
        await existingClocking.save();
    } else {
        // If no clocking records exist, create a new Clocking document
        const newClocking = new Clocking({
            employeeId: id,
            clockRecords: [clockInRecord], // Initialize with the clock-in record
        });

        await newClocking.save();
    }

    // Format the clock-in time
    const formattedClockInTime = dayjs(clockInRecord.clockInTime).format(
        "h:mm A"
    );

    res.status(201).json({
        message: "Clock-in successful",
        clockedIn: true,
        clockInRecord: {
            clockInTime: formattedClockInTime,
            totalHours: clockInRecord.totalHours,
        },
    });
});

// Clock Out Logic
const clockOut = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Find the user's current clock-in record (where clockOutTime is null)
    const existingClocking = await Clocking.findOne({ employeeId: id });

    if (!existingClocking) {
        throw new BadRequestError("No clock-in record found.");
    }

    const lastClockRecord =
        existingClocking.clockRecords[existingClocking.clockRecords.length - 1];

    if (!lastClockRecord || lastClockRecord.clockOutTime) {
        throw new BadRequestError("You have already clocked out..");
    }

    // Set clock-out time and calculate total hours worked
    lastClockRecord.clockOutTime = new Date();
    const clockOutTime = lastClockRecord.clockOutTime;
    const clockInTime = lastClockRecord.clockInTime;

    // Calculate total hours worked
    const totalHours =
        (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60); // In hours

    lastClockRecord.totalHours = totalHours;

    // Save the updated clocking record
    await existingClocking.save();

    // Format the clock-in and clock-out times
    const formattedClockInTime = dayjs(clockInTime).format("h:mm A");
    const formattedClockOutTime = dayjs(clockOutTime).format("h:mm A");

    res.status(200).json({
        message: "Clock-out successful",
        clockedOut: true,
        clockInRecord: {
            clockInTime: formattedClockInTime,
            clockOutTime: formattedClockOutTime,
            totalHours,
        },
    });
});

const getUserClockSummary = async (req: Request, res: Response) => {
    const { id } = req.params; // Get userID from URL parameters

    try {
        // Get today's date (start and end of today)
        const startOfDay = dayjs().startOf("day").toDate(); // Start of today (midnight)
        const endOfDay = dayjs().endOf("day").toDate(); // End of today (11:59:59 PM)

        // Fetch clock records for the specific user on today's date
        const clockingRecords = await Clocking.find({
            employeeId: id,
            "clockRecords.clockInTime": { $gte: startOfDay, $lt: endOfDay }, // Filter clock-in times within today
        })
            .populate("employeeId", "name userID") // Populate employee details (name, userID)
            .select("clockRecords name"); // Select relevant fields

        const clockSummary = clockingRecords
            .map((record) => {
                return record.clockRecords.map((clockRecord) => {
                    // Format the clock-in and clock-out times
                    const formattedClockInTime = dayjs(clockRecord.clockInTime).format(
                        "h:mm A"
                    );
                    const formattedClockOutTime = dayjs(clockRecord.clockOutTime).format(
                        "h:mm A"
                    );
                    const totalHours = clockRecord.totalHours;

                    return {
                        employeeName: record.employeeId, // Employee name
                        clockInTime: formattedClockInTime, // Formatted clock-in time
                        clockOutTime: formattedClockOutTime, // Formatted clock-out time
                        totalHours: totalHours, // Total hours worked
                    };
                });
            })
            .flat();

        res.status(200).json(clockSummary); // Return clock summary for the user on the current day
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to fetch clock summary for user" });
        return;
    }
};

const getClockSummary = async (req: Request, res: Response) => {
    try {
        // Get today's date (start and end of today)
        const startOfDay = dayjs().startOf("day").toDate(); // Start of today
        const endOfDay = dayjs().endOf("day").toDate(); // End of today

        // Fetch all clocking records for today
        const clockingRecords = await Clocking.find({
            "clockRecords.clockInTime": { $gte: startOfDay, $lt: endOfDay },
        })
            .populate("employeeId", "name userID") // Populate employee details (name, userID)
            .select("clockRecords name"); // Select relevant fields

        const clockSummary = clockingRecords
            .map((record) => {
                return record.clockRecords.map((clockRecord) => {
                    // Format the clock-in and clock-out times
                    const formattedClockInTime = dayjs(clockRecord.clockInTime).format(
                        "h:mm A"
                    );
                    const formattedClockOutTime = dayjs(clockRecord.clockOutTime).format(
                        "h:mm A"
                    );
                    const totalHours = clockRecord.totalHours;

                    return {
                        employeeName: record.employeeId,
                        clockInTime: formattedClockInTime,
                        clockOutTime: formattedClockOutTime,
                        totalHours: totalHours,
                    };
                });
            })
            .flat();

        res.status(200).json(clockSummary);
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to fetch clock summary" });
        return;
    }
};

cron.schedule("0 19 * * *", async () => {
    try {
        const clockingRecords = await Clocking.find({
            "clockRecords.clockOutTime": null,
        });

        for (let clocking of clockingRecords) {
            const lastClockRecord =
                clocking.clockRecords[clocking.clockRecords.length - 1];

            if (lastClockRecord && !lastClockRecord.clockOutTime) {
                // Automatically set clock-out time to 7 PM
                lastClockRecord.clockOutTime = dayjs()
                    .set("hour", 19)
                    .set("minute", 0)
                    .set("second", 0)
                    .toDate();
                const clockOutTime = lastClockRecord.clockOutTime;
                const clockInTime = lastClockRecord.clockInTime;

                // Calculate total hours worked
                const totalHours =
                    (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60); // In hours

                lastClockRecord.totalHours = totalHours;

                await clocking.save(); // Save the updated clocking record

                // Optionally, log or notify when an automatic clock-out happens
                console.log(`Clock-out automatic for user ID: ${clocking.employeeId}`);
            }
        }
    } catch (error) {
        console.error("Error in automatic clock-out task:", error);
    }
});

export { clockIn, clockOut, getClockSummary, getUserClockSummary };

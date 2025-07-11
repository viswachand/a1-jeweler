import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Clocking } from "../models/clockSummaryModel";
import { BadRequestError } from "../errors/badRequest-error";
import dayjs from "dayjs";
import cron from "node-cron";

// Plugins
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

const TIMEZONE = "America/New_York";


// Clock In Logic
const clockIn = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingClocking = await Clocking.findOne({ employeeId: id });

    if (existingClocking) {
        const lastRecord = existingClocking.clockRecords.at(-1);
        if (!lastRecord?.clockOutTime) throw new BadRequestError("You are already clocked in.");
    }

    const now = dayjs().tz(TIMEZONE).toDate();

    const clockInRecord = {
        clockInTime: now,
        clockOutTime: null,
        totalHours: 0,
    };

    if (existingClocking) {
        existingClocking.clockRecords.push(clockInRecord);
        await existingClocking.save();
    } else {
        await new Clocking({ employeeId: id, clockRecords: [clockInRecord] }).save();
    }

    res.status(201).json({
        message: "Clock-in successful",
        clockedIn: true,
        clockInRecord: {
            clockInTime: dayjs(now).tz(TIMEZONE).format("h:mm A"),
            totalHours: 0,
        },
    });
});


// Clock Out Logic
const clockOut = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingClocking = await Clocking.findOne({ employeeId: id });
    if (!existingClocking) throw new BadRequestError("No clock-in record found.");

    const lastRecord = existingClocking.clockRecords.at(-1);
    if (!lastRecord || lastRecord.clockOutTime) throw new BadRequestError("You have already clocked out.");

    const now = dayjs().tz(TIMEZONE).toDate();
    lastRecord.clockOutTime = now;
    lastRecord.totalHours = (now.getTime() - lastRecord.clockInTime.getTime()) / (1000 * 60 * 60);

    await existingClocking.save();

    res.status(200).json({
        message: "Clock-out successful",
        clockedOut: true,
        clockInRecord: {
            clockInTime: dayjs(lastRecord.clockInTime).tz(TIMEZONE).format("h:mm A"),
            clockOutTime: dayjs(now).tz(TIMEZONE).format("h:mm A"),
            totalHours: lastRecord.totalHours,
        },
    });
});


const getUserClockSummary = async (req: Request, res: Response) => {
    const { id } = req.params;
    const startOfDay = dayjs().tz(TIMEZONE).startOf("day").toDate();
    const endOfDay = dayjs().tz(TIMEZONE).endOf("day").toDate();

    try {
        const clockingRecords = await Clocking.find({
            employeeId: id,
            "clockRecords.clockInTime": { $gte: startOfDay, $lt: endOfDay },
        })
            .populate("employeeId", "name userID")
            .select("clockRecords employeeId");

        const clockSummary = clockingRecords.flatMap((record) =>
            record.clockRecords.map((clockRecord) => ({
                employeeName: record.employeeId,
                clockInTime: dayjs(clockRecord.clockInTime).tz(TIMEZONE).format("h:mm A"),
                clockOutTime: clockRecord.clockOutTime
                    ? dayjs(clockRecord.clockOutTime).tz(TIMEZONE).format("h:mm A")
                    : null,
                totalHours: clockRecord.totalHours,
            }))
        );

        res.status(200).json(clockSummary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Unable to fetch clock summary for user" });
    }
};


const getClockSummary = async (req: Request, res: Response) => {
    const startOfDay = dayjs().tz(TIMEZONE).startOf("day").toDate();
    const endOfDay = dayjs().tz(TIMEZONE).endOf("day").toDate();

    try {
        const clockingRecords = await Clocking.find({
            "clockRecords.clockInTime": { $gte: startOfDay, $lt: endOfDay },
        })
            .populate("employeeId", "name userID")
            .select("clockRecords employeeId");

        const summary: Record<string, {
            user: { userID: number; name: string };
            clockedIn: boolean;
            clockInTime: string | null;
            clockOutTime: string | null;
            punches: { clockInTime: string | null; clockOutTime: string | null; totalHours: number }[];
        }> = {};

        clockingRecords.forEach((record) => {
            const populatedUser = record.employeeId as unknown as {
                _id: string;
                userID: number;
                name: string;
            };

            const userIDStr = populatedUser._id.toString();
            const todayRecords = record.clockRecords.filter((r) =>
                dayjs(r.clockInTime).isBetween(startOfDay, endOfDay, null, "[]")
            );

            if (todayRecords.length === 0) return;

            const latest = todayRecords[todayRecords.length - 1];

            const punches = todayRecords.map((r) => ({
                clockInTime: r.clockInTime ? dayjs(r.clockInTime).tz(TIMEZONE).format("h:mm A") : null,
                clockOutTime: r.clockOutTime ? dayjs(r.clockOutTime).tz(TIMEZONE).format("h:mm A") : null,
                totalHours: r.totalHours ?? 0,
            }));

            summary[userIDStr] = {
                user: {
                    userID: populatedUser.userID,
                    name: populatedUser.name,
                },
                clockedIn: latest.clockOutTime == null,
                clockInTime: latest.clockInTime ? dayjs(latest.clockInTime).tz(TIMEZONE).format("h:mm A") : null,
                clockOutTime: latest.clockOutTime ? dayjs(latest.clockOutTime).tz(TIMEZONE).format("h:mm A") : null,
                punches,
            };
        });

        res.status(200).json(summary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Unable to fetch clock summary" });
    }
};




cron.schedule("0 19 * * *", async () => {
    try {
        const clockingRecords = await Clocking.find({ "clockRecords.clockOutTime": null });

        for (const clocking of clockingRecords) {
            const lastRecord = clocking.clockRecords.at(-1);
            if (lastRecord && !lastRecord.clockOutTime) {
                const autoClockOut = dayjs().tz(TIMEZONE).set("hour", 19).set("minute", 0).set("second", 0).toDate();
                lastRecord.clockOutTime = autoClockOut;
                lastRecord.totalHours = (autoClockOut.getTime() - lastRecord.clockInTime.getTime()) / (1000 * 60 * 60);

                await clocking.save();
                console.log(`Auto clock-out for user: ${clocking.employeeId}`);
            }
        }
    } catch (err) {
        console.error("Auto clock-out error:", err);
    }
});


export { clockIn, clockOut, getClockSummary, getUserClockSummary };

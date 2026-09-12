import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const getTripBudget = async (req: AuthRequest, res: Response) => {
  try {
    const { id: tripId } = req.params;
    const customThreshold = req.query.threshold ? Number(req.query.threshold) : null;

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          include: {
            city: true,
            stop_activities: {
              include: { activity: true },
            },
          },
          orderBy: { order_index: 'asc' },
        },
        budget_items: true,
      },
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    // Compute trip duration in days
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    // Initial Category totals
    const categoryTotals: Record<string, number> = {
      Transport: 0,
      Stay: 0,
      Activities: 0,
      Food: 0,
      Other: 0,
    };

    // Calculate activities total from stops
    let totalActivitiesCost = 0;
    for (const stop of trip.stops) {
      for (const sa of stop.stop_activities) {
        const cost = sa.cost_override ?? sa.activity?.cost ?? 0;
        totalActivitiesCost += cost;
        categoryTotals.Activities += cost;
      }
    }

    // Process manual logged budget items
    let manualTotal = 0;
    for (const item of trip.budget_items) {
      const cost = item.actual_cost ?? item.estimated_cost ?? 0;
      manualTotal += cost;
      const cat = item.category in categoryTotals ? item.category : 'Other';
      categoryTotals[cat] += cost;
    }

    // Proportional baseline estimates for Stays, Food, and Transport if not explicitly logged
    const avgCityCostIndex =
      trip.stops.length > 0
        ? trip.stops.reduce((sum, s) => sum + s.city.cost_index, 0) / trip.stops.length
        : 3.5;

    if (categoryTotals.Stay === 0) {
      // Estimate based on city cost index (~₹1,500 - ₹3,500/night baseline per cost index point)
      categoryTotals.Stay = Math.round(durationDays * avgCityCostIndex * 450);
    }

    if (categoryTotals.Food === 0) {
      // Estimate meals (~₹400 - ₹900/day baseline)
      categoryTotals.Food = Math.round(durationDays * avgCityCostIndex * 220);
    }

    if (categoryTotals.Transport === 0) {
      // Baseline local & transit transport
      categoryTotals.Transport = Math.round(trip.stops.length * 800 + durationDays * 200);
    }

    const grandTotal =
      categoryTotals.Transport +
      categoryTotals.Stay +
      categoryTotals.Activities +
      categoryTotals.Food +
      categoryTotals.Other;

    const dailyAverage = Math.round((grandTotal / durationDays) * 100) / 100;
    const effectiveThreshold = customThreshold || Math.max(5000, durationDays * 2500);

    // Build Day-by-Day breakdown across the entire trip
    const dayWiseBreakdown: Array<{
      dayNumber: number;
      date: string;
      city: string;
      activitiesCost: number;
      stayCost: number;
      foodCost: number;
      transportCost: number;
      totalCost: number;
      isOverbudget: boolean;
      activitiesList: string[];
    }> = [];

    const dailyTargetBudget = Math.round(effectiveThreshold / durationDays);

    for (let d = 0; d < durationDays; d++) {
      const currentDate = new Date(startDate.getTime() + d * (24 * 60 * 60 * 1000));
      const dateStr = currentDate.toISOString().split('T')[0];

      // Find which stop corresponds to this day
      let activeStopForDay = trip.stops.find((s) => {
        const arr = new Date(s.arrival_date);
        const dep = new Date(s.departure_date);
        return currentDate >= arr && currentDate <= dep;
      });

      if (!activeStopForDay && trip.stops.length > 0) {
        activeStopForDay = trip.stops[Math.min(d, trip.stops.length - 1)];
      }

      const cityName = activeStopForDay?.city?.name || 'In Transit';
      const cityCostIndex = activeStopForDay?.city?.cost_index || avgCityCostIndex;

      // Activities on this day or distributed across stop days
      let dayActivitiesCost = 0;
      const dayActivitiesList: string[] = [];

      if (activeStopForDay) {
        const stopDays = Math.max(
          1,
          Math.ceil(
            (new Date(activeStopForDay.departure_date).getTime() -
              new Date(activeStopForDay.arrival_date).getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
        );

        // Check for specific scheduled date or distribute
        const specificDayActs = activeStopForDay.stop_activities.filter((sa) => {
          if (!sa.scheduled_date) return false;
          return new Date(sa.scheduled_date).toISOString().split('T')[0] === dateStr;
        });

        if (specificDayActs.length > 0) {
          for (const sa of specificDayActs) {
            const cost = sa.cost_override ?? sa.activity?.cost ?? 0;
            dayActivitiesCost += cost;
            dayActivitiesList.push(sa.activity?.name || 'Activity');
          }
        } else {
          // Proportionally assign unassigned activities
          const unassigned = activeStopForDay.stop_activities.filter((sa) => !sa.scheduled_date);
          const stopTotalUnassigned = unassigned.reduce(
            (sum, sa) => sum + (sa.cost_override ?? sa.activity?.cost ?? 0),
            0
          );
          dayActivitiesCost = Math.round(stopTotalUnassigned / stopDays);
          unassigned.forEach((u) => dayActivitiesList.push(u.activity?.name || 'Experience'));
        }
      }

      const dayStayCost = Math.round(cityCostIndex * 450);
      const dayFoodCost = Math.round(cityCostIndex * 220);
      const dayTransportCost = Math.round(categoryTotals.Transport / durationDays);

      const dayTotalCost = dayActivitiesCost + dayStayCost + dayFoodCost + dayTransportCost;
      const isDayOverbudget = dayTotalCost > dailyTargetBudget * 1.15; // 15% margin above daily target

      dayWiseBreakdown.push({
        dayNumber: d + 1,
        date: dateStr,
        city: cityName,
        activitiesCost: dayActivitiesCost,
        stayCost: dayStayCost,
        foodCost: dayFoodCost,
        transportCost: dayTransportCost,
        totalCost: dayTotalCost,
        isOverbudget: isDayOverbudget,
        activitiesList: dayActivitiesList.slice(0, 3),
      });
    }

    const overbudgetDays = dayWiseBreakdown.filter((day) => day.isOverbudget);

    // Chart Data for Pie Chart
    const pieChartData = [
      { name: 'Stay (Hotels)', value: categoryTotals.Stay, color: '#3b82f6' },
      { name: 'Activities & Tours', value: categoryTotals.Activities, color: '#0ea5e9' },
      { name: 'Meals & Dining', value: categoryTotals.Food, color: '#f59e0b' },
      { name: 'Transport & Flights', value: categoryTotals.Transport, color: '#8b5cf6' },
      { name: 'Other Expenses', value: categoryTotals.Other, color: '#10b981' },
    ].filter((item) => item.value > 0);

    // Stop-by-Stop Breakdown
    const stopBreakdown = trip.stops.map((stop) => {
      const stopActivitiesCost = stop.stop_activities.reduce(
        (sum, sa) => sum + (sa.cost_override ?? sa.activity?.cost ?? 0),
        0
      );
      const stopDays = Math.max(
        1,
        Math.ceil(
          (new Date(stop.departure_date).getTime() - new Date(stop.arrival_date).getTime()) /
            (1000 * 3600 * 24)
        ) + 1
      );
      const stayCost = Math.round(stopDays * stop.city.cost_index * 450);
      const foodCost = Math.round(stopDays * stop.city.cost_index * 220);

      return {
        city: stop.city.name,
        country: stop.city.country,
        days: stopDays,
        activitiesCost: stopActivitiesCost,
        stayCost,
        foodCost,
        totalCost: stopActivitiesCost + stayCost + foodCost,
      };
    });

    return res.json({
      summary: {
        tripId,
        tripName: trip.name,
        durationDays,
        grandTotal,
        dailyAverage,
        categoryTotals,
        isOverBudget: grandTotal > effectiveThreshold,
        threshold: effectiveThreshold,
        dailyTargetBudget,
        overbudgetDaysCount: overbudgetDays.length,
      },
      overbudgetDays,
      pieChartData,
      dayWiseBreakdown,
      stopBreakdown,
      budgetItems: trip.budget_items,
    });
  } catch (error) {
    console.error('Error calculating budget:', error);
    return res.status(500).json({ message: 'Error calculating trip budget.' });
  }
};

export const addBudgetItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id: tripId } = req.params;
    const { category, name, estimated_cost, actual_cost, notes } = req.body;

    if (!category || !name || estimated_cost === undefined) {
      return res.status(400).json({ message: 'Category, item name, and estimated cost are required.' });
    }

    const item = await prisma.budgetItem.create({
      data: {
        trip_id: tripId,
        category,
        name,
        estimated_cost: Number(estimated_cost),
        actual_cost: actual_cost !== undefined && actual_cost !== '' ? Number(actual_cost) : null,
        notes: notes || null,
      },
    });

    return res.status(201).json({ item });
  } catch (error) {
    console.error('Error adding budget item:', error);
    return res.status(500).json({ message: 'Error adding budget item.' });
  }
};

export const deleteBudgetItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.budgetItem.delete({ where: { id } });
    return res.json({ message: 'Budget item removed.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting budget item.' });
  }
};

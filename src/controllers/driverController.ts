import { Request, Response } from 'express'
import * as DriverServices from '../services/driverService'

export const createDriverController = async (req: Request, res: Response) => {
  try {
    const driver = await DriverServices.registerDriverService(req.body)
    res.status(201).json({
      success: true,
      data: driver,
      message: 'Driver registration successful',
    })
  } catch (err) {
    console.error('Error creating driver:', err)

    if (err instanceof Error) {
      // If it's a known error with a message, send that message in the response
      res.status(400).json({ success: false, message: err.message })
    } else {
      // If it's an unknown error, send a generic error message
      res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
  }
}

// Get Driver Details
export const getDriverDetailsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { driverId } = req.params
    const driver = await DriverServices.getDriverService(driverId)
    res.status(200).json({ success: true, data: driver })
  } catch (err) {
    console.error('Error getting driver details:', err)
    res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
}

// Update Driver Details
export const updateDriverDetailsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { driverId } = req.params
    const updatedDriver = await DriverServices.updateDriverService(
      driverId,
      req.body
    )
    res.status(200).json({
      success: true,
      data: updatedDriver,
      message: 'Driver details updated successfully',
    })
  } catch (err) {
    console.error('Error updating driver details:', err)
    res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
}

export const deleteDriverController = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params
    await DriverServices.deleteDriverService(driverId)
    res
      .status(200)
      .json({ success: true, message: 'Driver account deleted successfully' })
  } catch (err) {
    console.error('Error deleting driver account:', err)
    res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
}

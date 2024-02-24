//Driver accepts job
//Driver update current locations
//Driver pick up package
//Driver drop off package
//Driver update status of availability
//Driver body
/**
 * -driver
 */

//CRUD Driver
import db from '../util/db'
import argon2 from 'argon2'
import DriverModel from '../models/users/driver'
import { generateJwtToken } from '../util/generateJwtToken'
export const registerDriverService = async (driverData: IDriver) => {
  const existingDriver = await db.drivers.findOne({ email: driverData.email })
  if (existingDriver) {
    throw new Error(
      `Driver with email ${driverData.email} is already registered. Please login.`
    )
  }
  if (driverData) {
    try {
      const hashedPassword = await argon2.hash(driverData.password!)
      const username: string = driverData.fullname
        ?.replace(/\s+/g, '_')
        .toLowerCase()!
      const newDriver = new DriverModel({
        ...driverData,
        username,
        password: hashedPassword,
      })
      await newDriver.save()
      return newDriver
    } catch (error) {
      throw new Error('Error creating a new driver.')
    }
  }
}

export const loginDriverService = async (
  username: string,
  password: string
) => {
  const driver = await DriverModel.findOne({ username })
  if (!driver) {
    throw new Error('Driver not found')
  }

  const isPasswordMatch = await argon2.verify(driver.password!, password)

  if (!isPasswordMatch) {
    throw new Error('Incorrect password.')
  }

  const token = await generateJwtToken(driver.driverId!)
  return {
    token,
    driver,
  }
}

export const getDriverService = async (driverId: string) => {
  const driver = await DriverModel.findById(driverId)

  if (!driver) {
    throw new Error(`Driver with ID ${driverId} not found.`)
  }

  return driver
}

export const getAllDriversService = async () => {
  try {
    let drivers = await DriverModel.find()
    return drivers
  } catch (error) {}
}

export const updateDriverService = async (
  driverId: string,
  updatedData: Partial<IDriver>
) => {
  const driver = await DriverModel.findById(driverId)

  if (!driver) {
    throw new Error(`Driver with ID ${driverId} not found.`)
  }

  Object.assign(driver, updatedData)

  await driver.save()

  return driver
}

export const deleteDriverService = async (driverId: string) => {
  const driver = await DriverModel.findById(driverId)

  if (!driver) {
    throw new Error(`Driver with ID ${driverId} not found.`)
  }

  await DriverModel.deleteOne({ _id: driverId })

  return { message: 'Driver deleted successfully.' }
}

/**
 * Checks if a driver is available.
 * @param driverId The ID of the driver to check.
 * @returns True if the driver is available, false otherwise.
 */
// Example usage within isDriverAvailableService
export const isDriverAvailableService = async (
  driverId: string
): Promise<boolean> => {
  const driver = (await DriverModel.findById(driverId)) as Document & IDriver

  if (!driver) {
    throw new Error(`Driver with ID ${driverId} not found.`)
  }

  const isAvailable = driver.availability === 'available'
  return isAvailable
}

/**
 * Fetches all available drivers.
 * @returns A promise that resolves with an array of available drivers.
 */
export const getAllAvailableDriversService = async (): Promise<any[]> => {
  try {
    // Assuming 'available' is the value indicating availability in the 'availability' field
    const availableDrivers = await DriverModel.find({
      availability: 'available',
    })

    return availableDrivers
  } catch (error: any) {
    throw new Error(`Failed to fetch available drivers: ${error.message}`)
  }
}

/**
 * Asynchronously assigns an available driver within a specified zone.
 * @param pickupZone The zone from which a driver is to be assigned.
 * @returns A promise that resolves with the assigned driver or undefined if no available driver is found.
 */
export const assignDriverService = async (
  pickupZone: string
): Promise<IDriver | undefined | any> => {
  try {
    // Find all available drivers in the specified zone
    const availableDrivers = await DriverModel.find({
      zone: pickupZone,
      availability: 'available', // Adjust based on how availability is tracked
    })

    if (availableDrivers.length === 0) {
      // No available drivers found
      return undefined
    }

    // For simplicity, assign the first available driver
    // In a real application, you might want to use more sophisticated logic here
    const assignedDriver = availableDrivers[0]

    // Update the assigned driver's availability or any other relevant status in the database
    // For example, marking them as not available
    await DriverModel.updateOne(
      { _id: assignedDriver._id },
      {
        availability: 'unavailable', // Adjust based on your model
      }
    )

    return assignedDriver
  } catch (error) {
    console.error('Failed to assign a driver:', error)
    throw error // Or handle it according to your application's error handling policy
  }
}

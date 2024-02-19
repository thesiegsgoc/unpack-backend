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

  const token = await generateJwtToken(driver.userId!)
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

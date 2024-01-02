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
export const createRegistrationService = async (userData: IDriver) => {
  const existingDriver = await db.drivers.findOne({ email: userData.email })

  if (existingDriver) {
    throw new Error(
      `Driver with email ${userData.email} is already registered. Please login.`
    )
  }

  if (userData) {
    try {
      const hashedPassword = await argon2.hash(userData.password!)

      const username: string = userData.fullname
        ?.replace(/\s+/g, '_')
        .toLowerCase()!

      const newDriver = new DriverModel({
        ...userData,
        username,
        password: hashedPassword,
      })

      console.log('New Driver', newDriver)

      await newDriver.save()
      return newDriver
    } catch (error) {
      // Handle any errors that might occur during password hashing or saving the new driver.
      throw new Error('Error creating a new driver.')
    }
  }
}

export const getDriverService = async (driverId: string) => {
  const driver = await DriverModel.findById(driverId)

  if (!driver) {
    throw new Error(`Driver with ID ${driverId} not found.`)
  }

  return driver
}

export const updateDriverService = async (
  driverId: string,
  updatedData: Partial<IDriver>
) => {
  const driver = await DriverModel.findById(driverId)

  if (!driver) {
    throw new Error(`Driver with ID ${driverId} not found.`)
  }

  // Update only the provided fields in updatedData
  Object.assign(driver, updatedData)

  // Save the updated driver
  await driver.save()

  return driver
}

export const deleteDriverService = async (driverId: string) => {
  const driver = await DriverModel.findById(driverId)

  if (!driver) {
    throw new Error(`Driver with ID ${driverId} not found.`)
  }

  // Delete the driver
  await DriverModel.deleteOne({ _id: driverId })

  return { message: 'Driver deleted successfully.' }
}

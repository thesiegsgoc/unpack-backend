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

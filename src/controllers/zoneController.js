const Zone = require("../models/Zone");
const db = require('../util/db');
const { distanceTo } = require('geolocation-utils');
const util = require('../util/scheduling');

module.exports = {
    registerZone: async (req, res) => {
        const { zoneName, rate, centralLocation } = req.body;
        if (!zoneName || !rate || !centralLocation.longitude || !centralLocation.latitude) {
            return res.json({
                success: false,
                message: 'A Zone should at-least have a name, transportation rate greater than 0, and valid central location.'
            });
        } else {
            try {
                const existingZone = await db.zones.findOne({ zoneName: zoneName });
                if (existingZone) {
                    return res.json({
                        success: false,
                        message: `Zone ${zoneName} already exists.`
                    });
                }
                const zone = new Zone({
                    zoneName,
                    rate,
                    zoneHandlers: [],
                    centralLocation: centralLocation
                });
                await zone.save();
                return res.json({
                    success: 'true',
                    message: `${zoneName} zone is added successfully.`
                })
            } catch (error) {
                return res.json({
                    success: false,
                    message: error.message
                });
            }
        }
    },

    updateZoneInfo: async (req, res) => {
        const { zoneName, rate } = req.body;

        if (!zoneName || zoneName === '') {
            return res.json({
                success: false,
                message: 'A Zone should at-least have a name.'
            });
        }

        if (!rate || rate <= 0) {
            return res.json({
                success: false,
                message: 'Transportation rate should be greater than 0.'
            });
        }

        const zone = await Zone.findOne({ zoneName: zoneName });

        if (!zone) {
            return res.json({
                success: false,
                message: `Invalid zone name: No zone is named ${zoneName}.`
            });
        }

        try {
            await db.zones.updateOne(
                { zoneName },
                {
                    $set: {
                        zoneName: zoneName,
                        rate: rate
                    }
                }
            );
            return res.json({
                success: true,
                message: `Zone ${zoneName}'s info is updated successfully.`
            });
        } catch (error) {
            return res.json({ success: false, message: error.message });
        }
    },

    deleteZone: async (req, res) => {
        const { zoneName } = req.body;

        if (!zoneName || zoneName === '') {
            return res.json({
                success: false,
                message: 'A Zone should at-least have a name.'
            });
        }

        const zone = await db.zones.findOne({ zoneName: zoneName });

        if (!zone) {
            return res.json({
                success: false,
                message: `Can't delete a non-existent zone: No zone is named ${zoneName}.`
            });
        }

        try {
            await db.zones.deleteOne({ zoneName: zoneName });
            return res.json({
                success: true,
                message: `Zone ${zoneName} is deleted successfully.`
            });
        } catch (error) {
            return res.json({ success: false, message: error.message });
        }
    },

    addZoneHandler: async (req, res) => {
        const { zoneName, handler } = req.body;

        if (!zoneName || zoneName === '') {
            return res.json({
                success: false,
                message: 'A Zone should at-least have a name.'
            });
        }

        if (!handler) {
            return res.json({
                success: false,
                message: 'Cannot have an empty handler'
            });
        }

        const zone = await db.zones.findOne({ zoneName: zoneName });

        if (!zone) {
            return res.json({
                success: false,
                message: `Invalid zone name: No zone is named ${zoneName}.`
            });
        }

        const user = await db.users.findOne({ username: handler });

        if (!user) {
            return res.json({
                success: false,
                message: `${handler} is not a registered user.`
            });
        }
        if (user.status.toLowerCase() === 'vendor' || user.status.toLowerCase() === 'consumer') {
            return res.json({
                success: false,
                message: `${handler} is not registered as a driver nor CPP.`
            });
        }

        try {
            await db.zones.updateOne(
                { zoneName: zoneName },
                {
                    $push: {
                        zoneHandlers: {
                            $each: [{ id: user._id, available: false }]
                        }
                    }
                }
            );
            return res.json({
                success: true,
                message: `${handler} is successfully added as a handler in zone ${zoneName}.`
            });
        } catch (error) {
            return res.json({ success: false, message: error.message });
        }
    },

    deleteZoneHandler: async (req, res) => {
        const { zoneName, handler } = req.body;

        if (!zoneName || zoneName === '') {
            return res.json({
                success: false,
                message: 'A Zone should at-least have a name.'
            });
        }

        if (!handler) {
            return res.json({
                success: false,
                message: 'Cannot have an empty handler'
            });
        }

        const zone = await db.zones.findOne({ zoneName: zoneName });

        if (!zone) {
            return res.json({
                success: false,
                message: `Invalid zone name: No zone is named ${zoneName}.`
            });
        }

        const { _id } = await db.users.findOne({ username: handler });

        if (!_id) {
            return res.json({
                success: false,
                message: `${handler} is not a registered--can't delete an unregistered user.`
            });
        }

        try {
            await db.zones.updateOne(
                { zoneName: zoneName },
                { $pull: { zoneHandlers: { id: handler } } }
            )
            return res.json({
                success: true,
                message: `Handler ${handler} is  successfully deleted as a ${zoneName} zone handler.`
            });
        } catch (error) {
            return res.json({ success: false, message: error.message });
        }
    },

    updateZoneHandlerAvailability: async (req, res) => {
        const { handler, available } = req.body;

        if (!handler) {
            return res.json({
                success: false,
                message: 'Cannot have an empty handler'
            });
        }

        const user = await db.users.findOne({ username: handler });

        if (!user._id) {
            return res.json({
                success: false,
                message: `${handler} is not a registered--can't update availability of an unregistered user.`
            });
        }

        try {
            await db.zones.updateMany(
                { zoneHandlers: { id: user._id, available: !available } },
                { $set: { "zoneHandlers.$": { id: user._id, available: available } } }
            )
            return res.json({
                success: true,
                message: `Handler ${handler}'s availability updated successfully.`
            });
        } catch (error) {
            return res.json({ success: false, message: error.message });
        }
    },

    assignHandler: async (req, res) => {
        const { location } = req.body;

        if (!location) {
            return res.json({
                success: false,
                message: `Can't pick-up nor drop a package at an unkonwon location.`
            })
        }

        const zones = await Zone.find({});

        let distanceToLocationFromZoneCenter;
        let prevDistance;
        let zoneHandlers;
        let zoneName;
        let handlerId;
        zones.forEach((zone) => {
            try {
                distanceToLocationFromZoneCenter = distanceTo(
                    {
                        lat: zone.centralLocation.latitude,
                        lon: zone.centralLocation.longitude
                    },
                    location
                );

                if (prevDistance === undefined) {
                    prevDistance = distanceToLocationFromZoneCenter;
                }

                if (distanceToLocationFromZoneCenter <= prevDistance) {
                    prevDistance = distanceToLocationFromZoneCenter;
                    zoneName = zone.zoneName;
                    zoneHandlers = zone.zoneHandlers;
                }
            } catch (error) {
                return res.json({
                    success: false,
                    message: error.message
                })
            }
        });

        if (!zoneHandlers) {
            return res.json({
                success: false,
                message: `Can't deliver to your location.`
            })
        }
        try {
            zoneHandlers.forEach(async (zoneHandler, index) => {
                if (zoneHandler.available) {
                    handlerId = zoneHandler.id;
                    // Remove the handler from the current position in the queue:
                    zoneHandlers.splice(index, 1);
                    // Since the handler is scheduled to take the task, put him/her
                    // back into the end of the array to ensure that handlers get
                    // other handlers get the chance to deliver packages if available
                    // to work:
                    zoneHandlers.push(zoneHandler);
                    await db.zones.updateOne(
                        { zoneName },
                        {
                            $set: {
                                zoneHandlers: zoneHandlers
                            }
                        }
                    );

                }
            });
        } catch (error) {
            return res.json({ success: false, message: error.message });
        }
        
        return res.json({
            success: true,
            body: {
                handlerId: handlerId ? handlerId : undefined
            },
            message: `Handler successfully scheduled to pick up a package.`
        });
    }
};